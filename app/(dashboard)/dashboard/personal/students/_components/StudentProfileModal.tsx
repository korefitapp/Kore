"use client";

import { useState, useTransition, useEffect } from "react";
import { X, User, Save, LibraryBig, Plus, Activity, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { getPersonalWorkoutsDropdown, createWorkoutPlan, updatePersonalStudentData } from "@/app/actions/personal-actions_fixed";
import { Scale } from "lucide-react";

export function StudentProfileModal({
  isOpen,
  onClose,
  student,
}: {
  isOpen: boolean;
  onClose: () => void;
  student: any | null;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"dados" | "treinos">("dados");
  
  // States para Treinos
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState("");
  const [isAssigning, startAssignTransition] = useTransition();

  // States para Dados (Mock simples por enquanto, salvar não fará muito além do visual se não houver backend)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [weight, setWeight] = useState("");
  const [isSavingData, setIsSavingData] = useState(false);

  useEffect(() => {
    if (student) {
      setName(student.full_name || student.display_name || "");
      setEmail(student.email || "");
      setWeight(student.weight ? student.weight.toString() : "");
    }
  }, [student]);

  useEffect(() => {
    if (isOpen && activeTab === "treinos") {
      loadWorkouts();
    }
  }, [isOpen, activeTab]);

  async function loadWorkouts() {
    setLoadingWorkouts(true);
    const res = await getPersonalWorkoutsDropdown();
    if (res.ok && res.data) {
      setWorkouts(res.data);
    }
    setLoadingWorkouts(false);
  }

  const handleAssignGlobal = () => {
    if (!selectedWorkoutId || !student) return;
    const selectedWorkout = workouts.find((w) => w.id === selectedWorkoutId);
    
    startAssignTransition(async () => {
      // Cria o plano e joga no metadata o base_workout_id
      const res = await createWorkoutPlan(student.id, selectedWorkout?.name || "Treino Global", "Atribuído da biblioteca global.", selectedWorkoutId);
      if (res.ok) {
        onClose();
        router.refresh();
      } else {
        alert(res.error);
      }
    });
  };

  const handleNewCustom = () => {
    if (!student) return;
    onClose();
    // Redireciona para o WorkoutBuilder passando o aluno para criarmos um do zero
    router.push(`/dashboard/personal/workouts?new=true&studentId=${student.id}`);
  };

  const handleSaveData = async () => {
    if (!student) return;
    setIsSavingData(true);
    const fd = new FormData();
    fd.append("name", name);
    fd.append("weight", weight);
    const res = await updatePersonalStudentData(student.id, fd);
    setIsSavingData(false);
    
    if (res.ok) {
      router.refresh();
      onClose();
    } else {
      alert("Erro ao salvar: " + res.error);
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-kore-ink/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-kore-bg border border-kore-border rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-kore-border flex items-center justify-between bg-kore-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center justify-center border border-emerald-200 dark:border-emerald-500/30">
              {name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-kore-ink tracking-tight leading-tight">
                Perfil do Aluno
              </h2>
              <p className="text-xs text-kore-muted">
                {name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-700 dark:hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-4 gap-6 border-b border-kore-border bg-kore-bg">
          <button
            onClick={() => setActiveTab("dados")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "dados"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-kore-muted hover:text-kore-ink"
            }`}
          >
            Dados Cadastrais
          </button>
          <button
            onClick={() => setActiveTab("treinos")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "treinos"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-kore-muted hover:text-kore-ink"
            }`}
          >
            Gerenciar Treinos
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === "dados" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div>
                <label className="block text-xs font-bold text-kore-muted uppercase tracking-wider mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white dark:bg-[#1a1a1a] border border-kore-border rounded-xl pl-9 pr-3 py-2.5 text-sm font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-kore-muted uppercase tracking-wider mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full bg-slate-50 dark:bg-white/5 border border-kore-border rounded-xl pl-9 pr-3 py-2.5 text-sm font-medium text-kore-muted cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-kore-muted mt-1">O e-mail é vinculado à conta e não pode ser alterado por aqui.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-kore-muted uppercase tracking-wider mb-1">
                  Peso (kg)
                </label>
                <div className="relative">
                  <Scale size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted" />
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Ex: 75.5"
                    className="w-full bg-white dark:bg-[#1a1a1a] border border-kore-border rounded-xl pl-9 pr-3 py-2.5 text-sm font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                  />
                </div>
              </div>

              <button 
                onClick={handleSaveData}
                disabled={isSavingData}
                className="w-full mt-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 disabled:opacity-50 rounded-xl font-bold py-2.5 flex items-center justify-center gap-2 transition-colors"
              >
                <Save size={16} />
                {isSavingData ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
              </button>
            </div>
          )}

          {activeTab === "treinos" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
              
              {/* Opção A: Treino Global */}
              <div className="bg-white dark:bg-[#1a1a1a] border border-kore-border rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <LibraryBig size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-kore-ink">Atribuir da Biblioteca</h3>
                    <p className="text-xs text-kore-muted">Use um treino global salvo</p>
                  </div>
                </div>
                
                {loadingWorkouts ? (
                  <p className="text-sm text-kore-muted text-center py-4">Carregando biblioteca...</p>
                ) : (
                  <div className="space-y-3">
                    <select 
                      className="w-full bg-slate-50 dark:bg-white/5 border border-kore-border rounded-xl px-3 py-2.5 text-sm font-medium focus:border-purple-500 outline-none"
                      value={selectedWorkoutId}
                      onChange={(e) => setSelectedWorkoutId(e.target.value)}
                    >
                      <option value="">Selecione um treino...</option>
                      {workouts.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>

                    <button 
                      onClick={handleAssignGlobal}
                      disabled={!selectedWorkoutId || isAssigning}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-bold py-2.5 flex items-center justify-center gap-2 transition-colors"
                    >
                      {isAssigning ? "ATRIBUINDO..." : "ATRIBUIR TREINO GLOBAL"}
                    </button>
                  </div>
                )}
              </div>

              <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-kore-border"></div>
                </div>
                <div className="relative bg-kore-bg px-4 text-xs font-bold text-kore-muted uppercase tracking-widest">
                  OU
                </div>
              </div>

              {/* Opção B: Treino Personalizado */}
              <div className="bg-white dark:bg-[#1a1a1a] border border-kore-border rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                    <Activity size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-kore-ink">Treino Personalizado</h3>
                    <p className="text-xs text-kore-muted">Crie um treino do zero exclusivo</p>
                  </div>
                </div>
                
                <button 
                  onClick={handleNewCustom}
                  className="w-full bg-kore-card border border-orange-200 dark:border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-xl font-bold py-2.5 flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus size={16} />
                  CRIAR NOVO PERSONALIZADO
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
