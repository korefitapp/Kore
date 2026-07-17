"use client";

import { useEffect, useState, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import { getStudentDetails, updateStudentWorkoutStatus, getPersonalWorkoutsDropdown } from "@/app/actions/personal-actions";
import { getStudentAdherence } from "@/app/actions/adherence-actions";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, Dumbbell, Calendar, Info, Target, CreditCard, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface StudentDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: any; // The minimal student object passed from the table row
}



export function StudentDetailsSheet({ open, onOpenChange, student }: StudentDetailsSheetProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "workout" | "plan">("overview");
  const [details, setDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isEditingWorkout, setIsEditingWorkout] = useState(false);
  const [workoutInput, setWorkoutInput] = useState("");

  const [availableWorkouts, setAvailableWorkouts] = useState<any[]>([]);
  const [adherenceData, setAdherenceData] = useState<{ name: string; value: number }[]>([]);

  // Fetch full details when the modal opens
  useEffect(() => {
    if (open && student?.id) {
      setIsLoading(true);
      Promise.all([
        getStudentDetails(student.id),
        getPersonalWorkoutsDropdown(),
        getStudentAdherence(student.id)
      ]).then(([resDetails, resWorkouts, resAdherence]) => {
        if (resDetails.ok) {
          setDetails(resDetails.data);
          setWorkoutInput(resDetails.data?.metadata?.current_workout || "");
        }
        if (resWorkouts.ok) {
          setAvailableWorkouts(resWorkouts.data || []);
        }
        if (resAdherence) {
          // Reverte o array para que o mês mais antigo fique na esquerda do gráfico
          const chartData = [...resAdherence.monthlyAdherence].reverse().map(item => ({
            name: item.month,
            value: item.progress
          }));
          setAdherenceData(chartData);
        }
        setIsLoading(false);
      });
    } else {
      setDetails(null);
      setActiveTab("overview");
      setIsEditingWorkout(false);
    }
  }, [open, student?.id]);

  const handleSetWorkout = () => {
    if (!workoutInput.trim()) return;
    
    startTransition(async () => {
      const result = await updateStudentWorkoutStatus(student.id, workoutInput);
      if (result.ok) {
        const { toast } = require("@/store/useToastStore");
        toast.success("Treino atualizado com sucesso!");
        setDetails((prev: any) => ({
          ...prev,
          metadata: {
            ...(prev?.metadata || {}),
            current_workout: workoutInput
          }
        }));
        setIsEditingWorkout(false);
        router.refresh();
      }
    });
  };

  const currentWorkout = details?.metadata?.current_workout || null;

  return (
    <Modal isOpen={open} onClose={() => onOpenChange(false)} title="Raio-X do Aluno" maxWidth="xl">
      
      {/* HEADER / ALUNO INFO */}
      <div className="px-6 py-5 border-b border-kore-border bg-kore-bg flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-kore-emerald/10 border border-kore-emerald/20 flex items-center justify-center text-kore-emerald font-bold text-xl flex-shrink-0">
          {student?.name?.charAt(0) || "A"}
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-kore-ink">{student?.name}</h3>
          <p className="text-xs font-medium text-kore-muted flex items-center gap-1.5 mt-0.5">
            {details ? (
              <>ID: {details.id.split("-")[0].toUpperCase()}</>
            ) : (
              "Carregando..."
            )}
          </p>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="px-6 py-4">
        <div className="flex bg-kore-bg/50 p-1 rounded-xl border border-kore-border">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition ${
              activeTab === "overview" 
                ? "bg-kore-card text-kore-emerald shadow-sm border border-kore-border/40" 
                : "text-kore-muted hover:text-kore-ink"
            }`}
          >
            <Activity size={15} />
            Visão Geral
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("workout")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition ${
              activeTab === "workout" 
                ? "bg-kore-card text-kore-emerald shadow-sm border border-kore-border/40" 
                : "text-kore-muted hover:text-kore-ink"
            }`}
          >
            <Dumbbell size={15} />
            Treino
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("plan")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition ${
              activeTab === "plan" 
                ? "bg-kore-card text-kore-emerald shadow-sm border border-kore-border/40" 
                : "text-kore-muted hover:text-kore-ink"
            }`}
          >
            <CreditCard size={15} />
            Plano
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="px-6 pb-8 space-y-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-kore-emerald/20 border-t-kore-emerald rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && details && (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl border border-white/20 bg-gradient-to-br from-white/60 to-white/30 dark:from-slate-800/60 dark:to-slate-900/30 backdrop-blur-md shadow-sm">
                    <div className="flex items-center gap-2 text-kore-muted mb-1">
                      <Target size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Progressão</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-kore-ink">+12%</span>
                      <span className="text-xs font-semibold text-kore-emerald">esse mês</span>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl border border-white/20 bg-gradient-to-br from-white/60 to-white/30 dark:from-slate-800/60 dark:to-slate-900/30 backdrop-blur-md shadow-sm">
                    <div className="flex items-center gap-2 text-kore-muted mb-1">
                      <Calendar size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Treinos Realizados</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-kore-ink">24</span>
                      <span className="text-xs font-semibold text-kore-muted">/ 30 dias</span>
                    </div>
                  </div>
                </div>

                {/* Adherence Chart */}
                <div className="p-5 rounded-xl border border-kore-border bg-kore-card">
                  <h4 className="text-sm font-bold text-kore-ink mb-4 flex items-center gap-2">
                    <Activity size={16} className="text-kore-emerald" />
                    Aderência (Últimos 6 Meses)
                  </h4>
                  <div className="h-[200px] mt-4 -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={adherenceData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                        <XAxis 
                          dataKey="name" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: "var(--kore-muted)" }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: "var(--kore-muted)" }}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                          itemStyle={{ color: '#10B981', fontWeight: 'bold' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#10B981" 
                          strokeWidth={3}
                          dot={{ r: 4, fill: "#10B981", strokeWidth: 2, stroke: "#fff" }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            )}

            {/* WORKOUT TAB */}
            {activeTab === "workout" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="p-5 rounded-xl border border-kore-border bg-kore-card text-center flex flex-col items-center">
                  
                  {!isEditingWorkout && currentWorkout ? (
                    <>
                      <div className="w-12 h-12 bg-kore-emerald/10 text-kore-emerald rounded-full flex items-center justify-center mb-4">
                        <Dumbbell size={24} />
                      </div>
                      <h4 className="text-sm font-bold text-kore-muted uppercase tracking-wider mb-1">Status Atual do Treino</h4>
                      <p className="text-xl font-extrabold text-kore-ink mb-4">{currentWorkout}</p>
                      
                      <div className="w-full flex items-center justify-between p-3 rounded-lg bg-kore-bg border border-kore-border mb-4">
                        <span className="text-sm font-semibold text-kore-ink">Sincronizado</span>
                        <span className="text-xs font-bold text-kore-emerald bg-kore-emerald/10 px-2 py-1 rounded-md">Ativo</span>
                      </div>

                      <button
                        onClick={() => setIsEditingWorkout(true)}
                        className="text-sm font-bold text-kore-emerald hover:text-kore-emerald-deep transition"
                      >
                        Alterar Ficha de Treino
                      </button>
                    </>
                  ) : (
                    <div className="w-full">
                      <div className="w-12 h-12 bg-kore-emerald/10 text-kore-emerald rounded-full flex items-center justify-center mx-auto mb-4">
                        <Dumbbell size={24} />
                      </div>
                      <h4 className="text-sm font-bold text-kore-ink uppercase tracking-wider mb-2">
                        {currentWorkout ? "Alterar Treino" : "Definir Novo Treino"}
                      </h4>
                      <p className="text-sm font-medium text-kore-subink mb-6 mx-auto">
                        Insira o nome ou link da nova ficha de treino para este aluno.
                      </p>
                      
                      <select
                        value={workoutInput}
                        onChange={(e) => {
                          if (e.target.value === "create_new") {
                            onOpenChange(false);
                            router.push("/dashboard/personal/workouts?new=true");
                          } else {
                            setWorkoutInput(e.target.value);
                          }
                        }}
                        className="w-full bg-kore-bg border border-kore-border rounded-lg px-4 py-3 text-sm text-kore-ink focus:outline-none focus:border-kore-emerald mb-4 appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Selecione uma ficha de treino...</option>
                        {availableWorkouts.length > 0 && (
                          <optgroup label="Sua Biblioteca">
                            {availableWorkouts.map(w => (
                              <option key={w.id} value={w.name}>{w.name}</option>
                            ))}
                          </optgroup>
                        )}
                        <optgroup label="Ações">
                          <option value="create_new">➕ Criar Nova Ficha na Biblioteca</option>
                        </optgroup>
                      </select>

                      <div className="flex gap-2">
                        {currentWorkout && (
                          <button
                            onClick={() => setIsEditingWorkout(false)}
                            disabled={isPending}
                            className="flex-1 py-3 rounded-xl bg-kore-bg border border-kore-border text-kore-ink font-bold text-sm hover:bg-kore-border transition disabled:opacity-60"
                          >
                            Cancelar
                          </button>
                        )}
                        <button
                          onClick={handleSetWorkout}
                          disabled={isPending || !workoutInput.trim()}
                          className="flex-[2] py-3 rounded-xl bg-kore-emerald text-white font-bold text-sm hover:bg-kore-emerald-deep transition shadow-lg shadow-kore-emerald/20 flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          {isPending ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>Salvar Treino</>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                  
                </div>
              </div>
            )}

            {/* PLAN TAB */}
            {activeTab === "plan" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                <div className="p-5 rounded-xl border border-kore-border bg-kore-card">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-[11px] font-bold text-kore-muted uppercase tracking-wider">Plano Atual</h4>
                      <p className="text-lg font-extrabold text-kore-ink mt-0.5">
                        {student?.plan || "Nenhum plano ativo"}
                      </p>
                    </div>
                    {student?.plan && student?.plan !== "Sem plano" && (
                      <span className="bg-kore-emerald/10 text-kore-emerald text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                        Ativo
                      </span>
                    )}
                  </div>
                  
                  {student?.plan && student?.plan !== "Sem plano" ? (
                    <div className="pt-4 border-t border-kore-border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-kore-subink">Data de Vencimento</span>
                        <span className="font-bold text-kore-ink">Em {student?.planExpiresInDays} dias</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-kore-muted pt-4 border-t border-kore-border">
                      O aluno ainda não adquiriu nenhum plano financeiro associado à consultoria.
                    </p>
                  )}
                </div>

              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
