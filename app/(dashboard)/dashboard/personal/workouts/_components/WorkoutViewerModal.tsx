"use client";

import { useEffect, useState, useRef } from "react";
import { X, Dumbbell, Clock, Activity, Target } from "lucide-react";
import { createPortal } from "react-dom";
import { getWorkoutDetailsAction } from "@/app/actions/workout-actions";

interface WorkoutViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutId: string;
}

export function WorkoutViewerModal({ isOpen, onClose, workoutId }: WorkoutViewerModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activeDayId]);

  useEffect(() => {
    if (isOpen && workoutId) {
      setLoading(true);
      getWorkoutDetailsAction(workoutId)
        .then((res) => {
          setData(res);
          if (res.days && res.days.length > 0 && res.days[0]) {
            setActiveDayId(res.days[0].id);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, workoutId]);

  if (!isOpen) return null;

  const activeDay = data?.days?.find((d: any) => d.id === activeDayId);

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex flex-col bg-kore-bg rounded-2xl shadow-2xl overflow-hidden w-[95vw] max-w-5xl h-[85vh] animate-in zoom-in-95 duration-200 border border-kore-border/40 relative">
        
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-kore-emerald border-t-transparent rounded-full animate-spin"></div>
            <p className="text-kore-muted font-medium">Carregando detalhes do treino...</p>
          </div>
        ) : !data ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-kore-muted">Erro ao carregar o treino.</p>
            <button onClick={onClose} className="mt-4 btn-emerald px-4 py-2 text-sm">Fechar</button>
          </div>
        ) : (
          <>
            {/* Top Header */}
            <header className="flex-shrink-0 h-auto p-6 border-b border-kore-border bg-kore-card flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="font-extrabold text-2xl text-kore-ink">{data.workout.name}</h2>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    data.workout.professional_id === null 
                      ? "bg-violet-500/10 text-violet-500 border border-violet-500/20" 
                      : "bg-kore-emerald-soft text-kore-emerald border border-kore-emerald/20"
                  }`}>
                    {data.workout.professional_id === null ? "Global" : "Seu Treino"}
                  </span>
                </div>
                {data.workout.description && (
                  <p className="text-sm text-kore-muted max-w-3xl leading-relaxed">{data.workout.description}</p>
                )}
                
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-kore-subink bg-kore-bg px-3 py-1.5 rounded-lg border border-kore-border">
                    <Target size={14} className="text-kore-emerald" />
                    {data.workout.objective}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-kore-subink bg-kore-bg px-3 py-1.5 rounded-lg border border-kore-border">
                    <Activity size={14} className="text-blue-500" />
                    {data.workout.level}
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 -mr-2 rounded-xl hover:bg-kore-bg text-kore-muted hover:text-kore-ink transition shrink-0">
                <X size={20} />
              </button>
            </header>

            <div className="flex h-full overflow-hidden">
              {/* Days Sidebar */}
              <div className="w-64 border-r border-kore-border bg-kore-card/30 flex flex-col">
                <div className="p-4 border-b border-kore-border bg-kore-bg">
                  <h3 className="text-sm font-bold text-kore-ink">Divisão do Treino</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {data.days.map((day: any) => (
                    <button
                      key={day.id}
                      onClick={() => setActiveDayId(day.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                        activeDayId === day.id
                          ? "bg-kore-emerald text-white shadow-md shadow-kore-emerald/20"
                          : "text-kore-subink hover:bg-kore-bg hover:text-kore-ink border border-transparent hover:border-kore-border"
                      }`}
                    >
                      {day.name}
                      <span className={`block text-[10px] font-normal mt-0.5 ${activeDayId === day.id ? 'opacity-90' : 'text-kore-muted'}`}>
                        {day.workout_day_exercises.length} {day.workout_day_exercises.length === 1 ? 'exercício' : 'exercícios'}
                      </span>
                    </button>
                  ))}
                  {data.days.length === 0 && (
                    <p className="text-xs text-kore-muted text-center pt-4">Nenhum dia cadastrado.</p>
                  )}
                </div>
              </div>

              {/* Main Content (Exercises) */}
              <div ref={scrollRef} className="flex-1 flex flex-col bg-kore-bg overflow-y-auto p-6 space-y-4">
                {activeDay && (
                  <>
                    <h3 className="text-xl font-extrabold text-kore-ink mb-2 pb-2 border-b border-kore-border inline-block">
                      {activeDay.name}
                    </h3>
                    
                    {activeDay.workout_day_exercises
                      .sort((a: any, b: any) => a.order - b.order)
                      .map((ex: any, idx: number) => (
                      <div key={ex.id} className="flex flex-col bg-kore-card border border-kore-border p-4 rounded-2xl hover:border-kore-emerald/30 transition-all shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-kore-ink text-base">
                              {idx + 1}. {ex.exercises?.name}
                            </h4>
                            {ex.exercises?.target_muscle_group && (
                              <p className="text-[10px] text-kore-muted uppercase tracking-wider mt-1">
                                {ex.exercises?.target_muscle_group}
                              </p>
                            )}
                          </div>
                          {ex.technique && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2 py-0.5 rounded-md">
                              {ex.technique}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-kore-border/50">
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-kore-muted font-semibold tracking-wider">Séries</span>
                            <span className="font-bold text-kore-ink">{ex.sets}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-kore-muted font-semibold tracking-wider">Reps</span>
                            <span className="font-bold text-kore-ink">{ex.reps}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-kore-muted font-semibold tracking-wider flex items-center gap-1">
                              <Clock size={10} /> Descanso
                            </span>
                            <span className="font-bold text-kore-ink">{ex.rest_time}</span>
                          </div>
                          
                          {ex.observation && (
                            <div className="flex flex-col flex-1 pl-6 border-l border-kore-border/50">
                              <span className="text-[10px] uppercase text-kore-muted font-semibold tracking-wider">Obs</span>
                              <span className="text-sm text-kore-subink italic">{ex.observation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {activeDay.workout_day_exercises.length === 0 && (
                      <div className="py-12 border-2 border-dashed border-kore-border rounded-2xl flex flex-col items-center justify-center text-center mt-4">
                        <Dumbbell size={32} className="text-kore-muted/50 mb-3" />
                        <p className="text-kore-muted font-medium mb-1">Nenhum exercício neste dia</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
