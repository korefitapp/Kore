"use client";

import { useState, useRef, useEffect } from "react";
import { X, Search, Plus, Trash2, GripVertical, Dumbbell } from "lucide-react";
import { createPortal } from "react-dom";
import { createWorkoutAction, WorkoutPayload } from "@/app/actions/workout-actions";
import { useRouter } from "next/navigation";

interface Exercise {
  id: string;
  name: string;
  target_muscle_group: string | null;
  category: string | null;
}

interface WorkoutBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercises: Exercise[];
  editBaseId?: string | null;
  studentId?: string | null;
}

export function WorkoutBuilderModal({ isOpen, onClose, exercises, editBaseId, studentId }: WorkoutBuilderModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [searchEx, setSearchEx] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    objective: "Hipertrofia",
    level: "Iniciante",
    description: "",
  });

  const INITIAL_DAYS = [
    { id: "mon", name: "Segunda-feira", isActive: true, exercises: [] as any[] },
    { id: "tue", name: "Terça-feira", isActive: false, exercises: [] as any[] },
    { id: "wed", name: "Quarta-feira", isActive: false, exercises: [] as any[] },
    { id: "thu", name: "Quinta-feira", isActive: false, exercises: [] as any[] },
    { id: "fri", name: "Sexta-feira", isActive: false, exercises: [] as any[] },
    { id: "sat", name: "Sábado", isActive: false, exercises: [] as any[] },
    { id: "sun", name: "Domingo", isActive: false, exercises: [] as any[] },
  ];

  const [days, setDays] = useState(INITIAL_DAYS);
  const [activeDayId, setActiveDayId] = useState("mon");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activeDayId]);

  useEffect(() => {
    if (isOpen && editBaseId) {
      const fetchWorkout = async () => {
        try {
          const { getWorkoutDetailsAction } = await import("@/app/actions/workout-actions");
          const res = await getWorkoutDetailsAction(editBaseId);
          if (res && res.workout) {
            setFormData({
              name: res.workout.name,
              objective: res.workout.objective || "Hipertrofia",
              level: res.workout.level || "Iniciante",
              description: res.workout.description || "",
            });
            
            if (res.days && res.days.length > 0) {
              const loadedDays = INITIAL_DAYS.map(idDay => {
                const fetchedDay = res.days.find((d: any) => d.name === idDay.name);
                if (fetchedDay) {
                  return {
                    ...idDay,
                    isActive: true,
                    exercises: fetchedDay.workout_day_exercises.map((ex: any) => ({
                      id: ex.id || Math.random().toString(36).substr(2, 9),
                      exercise_id: ex.exercises.id,
                      name: ex.exercises.name,
                      sets: ex.sets || 3,
                      reps: ex.reps || "10-12",
                      weight: ex.weight || "",
                      rest_time: ex.rest_time || "60s",
                      technique: ex.technique || "",
                      observation: ex.observation || ""
                    }))
                  };
                }
                return idDay;
              });
              
              setDays(loadedDays);
              const firstActive = loadedDays.find(d => d.isActive);
              if (firstActive) setActiveDayId(firstActive.id);
            }
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchWorkout();
    } else if (isOpen && !editBaseId) {
      setFormData({ name: "", objective: "Hipertrofia", level: "Iniciante", description: "" });
      setDays(INITIAL_DAYS);
      setStep(1);
    }
  }, [isOpen, editBaseId]);

  if (!isOpen) return null;

  const toggleDay = (id: string) => {
    setDays(days.map(d => {
      if (d.id === id) {
        const newlyActive = !d.isActive;
        // If we are deactivating the currently selected day, switch selection
        if (!newlyActive && activeDayId === id) {
          const firstActive = days.find(day => day.id !== id && day.isActive);
          if (firstActive) setActiveDayId(firstActive.id);
        }
        // If we are activating a day and none were active, select it
        if (newlyActive && !days.some(day => day.isActive)) {
          setActiveDayId(id);
        }
        return { ...d, isActive: newlyActive };
      }
      return d;
    }));
  };

  const handleAddExerciseToDay = (ex: Exercise) => {
    setDays(days.map(day => {
      if (day.id === activeDayId) {
        return {
          ...day,
          exercises: [...day.exercises, {
            id: Math.random().toString(36).substr(2, 9),
            exercise_id: ex.id,
            name: ex.name,
            sets: 3,
            reps: "10-12",
            weight: "",
            rest_time: "60s",
            technique: "",
            observation: ""
          }]
        };
      }
      return day;
    }));
  };

  const updateExercise = (dayId: string, exId: string, field: string, value: string | number) => {
    setDays(days.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          exercises: day.exercises.map(ex => {
            if (ex.id === exId) {
              return { ...ex, [field]: value };
            }
            return ex;
          })
        };
      }
      return day;
    }));
  };

  const removeExercise = (dayId: string, exId: string) => {
    setDays(days.map(day => {
      if (day.id === dayId) {
        return { ...day, exercises: day.exercises.filter(ex => ex.id !== exId) };
      }
      return day;
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return alert("Dê um nome ao treino!");
    
    const activeDays = days.filter(d => d.isActive);
    if (activeDays.length === 0) return alert("Ative pelo menos um dia de treino!");

    setIsSubmitting(true);

    const payload: WorkoutPayload = {
      ...formData,
      days: activeDays.map(d => ({
        name: d.name,
        exercises: d.exercises.map(ex => ({
          exercise_id: ex.exercise_id,
          sets: Number(ex.sets),
          reps: ex.reps,
          weight: ex.weight,
          rest_time: ex.rest_time,
          technique: ex.technique,
          observation: ex.observation
        }))
      }))
    };

    try {
      if (studentId) {
        const { createPersonalizedWorkoutAction } = await import("@/app/actions/workout-actions");
        await createPersonalizedWorkoutAction(payload, studentId);
      } else {
        await createWorkoutAction(payload);
      }
      onClose();
      router.refresh();
      // Also maybe reload page to clear searchParams
      router.replace("/dashboard/personal/workouts");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar treino");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeDay = days.find(d => d.id === activeDayId);
  const filteredLibrary = exercises.filter(e => e.name.toLowerCase().includes(searchEx.toLowerCase()));

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex flex-col bg-kore-bg rounded-2xl shadow-2xl overflow-hidden w-[95vw] max-w-6xl h-[90vh] animate-in zoom-in-95 duration-200 border border-kore-border/40">
        {/* Top Header */}
        <header className="flex-shrink-0 h-16 border-b border-kore-border bg-kore-card/50 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 -ml-2 rounded-xl hover:bg-kore-bg text-kore-muted hover:text-kore-ink transition">
            <X size={20} />
          </button>
          <div>
            <h2 className="font-bold text-lg text-kore-ink leading-tight">Construtor de Treinos</h2>
            <p className="text-xs text-kore-muted">Passo {step} de 2</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {step === 2 && (
            <button onClick={() => setStep(1)} className="px-4 py-2 text-sm font-semibold text-kore-subink hover:text-kore-ink hover:bg-kore-bg rounded-xl transition">
              Voltar
            </button>
          )}
          {step === 1 ? (
            <button onClick={() => setStep(2)} className="btn-emerald px-6 py-2 text-sm">
              Continuar
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isSubmitting} className="btn-emerald px-6 py-2 text-sm disabled:opacity-50">
              {isSubmitting ? "Salvando..." : "Salvar Ficha Completa"}
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {step === 1 ? (
          <div className="max-w-2xl mx-auto py-12 px-6">
            <div className="mb-8">
              <div className="w-16 h-16 rounded-2xl bg-kore-emerald-soft text-kore-emerald-deep flex items-center justify-center mb-6">
                <Dumbbell size={32} />
              </div>
              <h1 className="text-3xl font-extrabold text-kore-ink mb-2">Detalhes da Ficha</h1>
              <p className="text-kore-muted">Configure as informações gerais do plano de treinamento.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-kore-ink">Nome do Treino</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Hipertrofia A/B/C"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-kore-card border border-kore-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-kore-emerald focus:ring-2 focus:ring-kore-emerald/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-kore-ink">Objetivo</label>
                  <select
                    value={formData.objective}
                    onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                    className="w-full bg-kore-card border border-kore-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-kore-emerald focus:ring-2 focus:ring-kore-emerald/20 transition-all appearance-none"
                  >
                    <option value="Hipertrofia">Hipertrofia</option>
                    <option value="Emagrecimento">Emagrecimento</option>
                    <option value="Resistência">Resistência</option>
                    <option value="Força">Força</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-kore-ink">Nível</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full bg-kore-card border border-kore-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-kore-emerald focus:ring-2 focus:ring-kore-emerald/20 transition-all appearance-none"
                  >
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-kore-ink">Descrição (opcional)</label>
                <textarea
                  rows={4}
                  placeholder="Instruções gerais, foco da semana, etc..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-kore-card border border-kore-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-kore-emerald focus:ring-2 focus:ring-kore-emerald/20 transition-all resize-none"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full">
            {/* Days Sidebar */}
            <div className="w-64 border-r border-kore-border bg-kore-card/30 flex flex-col">
              <div className="p-4 border-b border-kore-border bg-kore-bg">
                <h3 className="text-sm font-bold text-kore-ink">Dias de Treino</h3>
                <p className="text-xs text-kore-muted mt-1">Marque os dias que deseja incluir na ficha.</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {days.map((day) => (
                  <div 
                    key={day.id} 
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      activeDayId === day.id && day.isActive
                        ? "border-kore-emerald bg-kore-emerald/10 shadow-sm"
                        : day.isActive
                        ? "border-kore-border bg-kore-card hover:border-kore-emerald/40"
                        : "border-transparent hover:bg-kore-bg opacity-60 grayscale"
                    }`}
                    onClick={() => day.isActive && setActiveDayId(day.id)}
                  >
                    <input
                      type="checkbox"
                      checked={day.isActive}
                      onChange={() => toggleDay(day.id)}
                      className="w-4 h-4 rounded text-kore-emerald focus:ring-kore-emerald focus:ring-offset-0 bg-kore-bg border-kore-border cursor-pointer shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${day.isActive ? "text-kore-ink" : "text-kore-muted"}`}>
                        {day.name}
                      </p>
                      <p className="text-[10px] text-kore-muted truncate">
                        {day.exercises.length} {day.exercises.length === 1 ? 'exercício' : 'exercícios'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Editor do Dia Selecionado */}
            <div className="flex-1 flex flex-col bg-kore-bg">
              {!activeDay || !activeDay.isActive ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-2xl bg-kore-card border border-kore-border flex items-center justify-center mb-4">
                    <Dumbbell size={32} className="text-kore-muted" />
                  </div>
                  <h3 className="text-lg font-bold text-kore-ink mb-1">Nenhum dia selecionado</h3>
                  <p className="text-sm text-kore-muted max-w-sm">
                    Marque um dia na lista ao lado para começar a adicionar exercícios.
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-6 border-b border-kore-border bg-kore-card/10">
                    <input
                      type="text"
                      value={activeDay.name}
                      onChange={(e) => {
                        setDays(days.map(d => d.id === activeDayId ? { ...d, name: e.target.value } : d));
                      }}
                      className="bg-transparent text-2xl font-extrabold text-kore-ink focus:outline-none focus:border-b-2 focus:border-kore-emerald px-1 pb-1 w-64 transition-colors"
                    />
                  </div>
                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                    {activeDay.exercises.map((ex, idx) => (
                  <div key={ex.id} className="group relative flex items-center gap-4 bg-kore-card border border-kore-border p-4 rounded-2xl hover:border-kore-emerald/30 transition-all">
                    <div className="cursor-grab text-kore-muted hover:text-kore-ink">
                      <GripVertical size={20} />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-bold text-kore-ink text-base mb-3">{idx + 1}. {ex.name}</h4>
                      
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-semibold text-kore-muted">Séries:</label>
                          <input type="number" min={1} value={ex.sets} onChange={(e) => updateExercise(activeDay.id, ex.id, 'sets', e.target.value)} className="w-16 bg-kore-bg border border-kore-border rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-kore-emerald" />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-semibold text-kore-muted">Reps:</label>
                          <input type="text" placeholder="10-12" value={ex.reps} onChange={(e) => updateExercise(activeDay.id, ex.id, 'reps', e.target.value)} className="w-16 bg-kore-bg border border-kore-border rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-kore-emerald" />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-semibold text-kore-muted">Carga:</label>
                          <input type="text" placeholder="Ex: 20kg" value={ex.weight || ""} onChange={(e) => updateExercise(activeDay.id, ex.id, 'weight', e.target.value)} className="w-20 bg-kore-bg border border-kore-border rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-kore-emerald" />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-semibold text-kore-muted">Descanso:</label>
                          <input type="text" placeholder="60s" value={ex.rest_time} onChange={(e) => updateExercise(activeDay.id, ex.id, 'rest_time', e.target.value)} className="w-16 bg-kore-bg border border-kore-border rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-kore-emerald" />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-semibold text-kore-muted">Técnica:</label>
                          <input type="text" placeholder="Ex: Drop-set (opcional)" value={ex.technique} onChange={(e) => updateExercise(activeDay.id, ex.id, 'technique', e.target.value)} className="w-40 bg-kore-bg border border-kore-border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-kore-emerald" />
                        </div>
                      </div>
                    </div>
                    
                    <button onClick={() => removeExercise(activeDay.id, ex.id)} className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition self-start opacity-0 group-hover:opacity-100">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

                {activeDay.exercises.length === 0 && (
                  <div className="py-12 border-2 border-dashed border-kore-border rounded-2xl flex flex-col items-center justify-center text-center">
                    <p className="text-kore-muted font-medium mb-1">Nenhum exercício neste dia</p>
                    <p className="text-xs text-kore-muted">Use o painel lateral direito para adicionar exercícios.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Library Sidebar (Right) */}
            <div className="w-80 border-l border-kore-border bg-kore-card/50 flex flex-col">
              <div className="p-4 border-b border-kore-border space-y-3">
                <h3 className="font-bold text-sm text-kore-ink uppercase tracking-wider">Biblioteca</h3>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted" />
                  <input
                    type="text"
                    placeholder="Buscar exercícios..."
                    value={searchEx}
                    onChange={(e) => setSearchEx(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-kore-bg border border-kore-border rounded-xl text-sm focus:outline-none focus:border-kore-emerald transition-colors"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredLibrary.map(ex => (
                  <div key={ex.id} className="flex items-center justify-between p-3 rounded-xl border border-kore-border bg-kore-card hover:border-kore-emerald/40 transition group">
                    <div className="min-w-0 pr-2">
                      <p className="text-sm font-bold text-kore-ink truncate">{ex.name}</p>
                      {ex.target_muscle_group && (
                        <p className="text-[10px] text-kore-muted uppercase tracking-wider mt-0.5">{ex.target_muscle_group}</p>
                      )}
                    </div>
                    <button onClick={() => handleAddExerciseToDay(ex)} className="w-8 h-8 rounded-lg bg-kore-bg text-kore-emerald flex items-center justify-center hover:bg-kore-emerald hover:text-white transition-colors shrink-0">
                      <Plus size={16} />
                    </button>
                  </div>
                ))}
                {filteredLibrary.length === 0 && (
                  <p className="text-sm text-kore-muted text-center py-4">Nenhum exercício encontrado.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
