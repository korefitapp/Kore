"use client";

import { useState, useTransition } from "react";
import { AlertCircle, User, Activity, Target, ChevronRight, ChevronLeft } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { updateStudentProfile } from "@/app/actions/personal-actions";
import { useRouter } from "next/navigation";

interface EditStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: any;
}

export function EditStudentModal({ open, onOpenChange, patient }: EditStudentModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<"basic" | "body" | "routine">("basic");

  const meta = patient.metadata || {};
  const goal = patient.fitness_goal || meta.fitness_goal || meta.goal || "Saúde";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        await updateStudentProfile(patient.id, formData);
        onOpenChange(false);
        const { toast } = require("@/store/useToastStore");
        toast.success("Ficha do aluno salva com sucesso!");
        router.refresh();
      } catch (error: any) {
        setErrorMsg(error.message || "Erro ao atualizar aluno.");
      }
    });
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => {
        if (!isPending) onOpenChange(false);
      }}
      title="Editar Ficha de Anamnese"
      description="Atualize os dados completos do paciente."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex gap-3 text-rose-700 dark:text-rose-400">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <p className="text-sm font-semibold">{errorMsg}</p>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="flex bg-kore-bg p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("basic")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition ${
              activeTab === "basic" 
                ? "bg-white dark:bg-kore-card text-kore-emerald shadow-sm" 
                : "text-kore-muted hover:text-kore-ink"
            }`}
          >
            <User size={16} />
            <span className="hidden sm:inline">Básico</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("body")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition ${
              activeTab === "body" 
                ? "bg-white dark:bg-kore-card text-kore-emerald shadow-sm" 
                : "text-kore-muted hover:text-kore-ink"
            }`}
          >
            <Activity size={16} />
            <span className="hidden sm:inline">Corpo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("routine")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition ${
              activeTab === "routine" 
                ? "bg-white dark:bg-kore-card text-kore-emerald shadow-sm" 
                : "text-kore-muted hover:text-kore-ink"
            }`}
          >
            <Target size={16} />
            <span className="hidden sm:inline">Rotina</span>
          </button>
        </div>

        {/* TAB CONTENT: BASIC */}
        {activeTab === "basic" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-kore-muted mb-1.5">Telefone / WhatsApp</label>
              <input
                name="phone"
                type="text"
                defaultValue={patient.phone || ""}
                placeholder="Ex: (11) 99999-9999"
                className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald transition"
                required
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-kore-muted mb-1.5">Nascimento</label>
                <input
                  name="birth_date"
                  type="date"
                  defaultValue={patient.birth_date || meta.birth_date || ""}
                  className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald transition"
                  disabled={isPending}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-kore-muted mb-1.5">Sexo Biológico</label>
                <select
                  name="gender"
                  defaultValue={patient.gender || meta.gender || "Outro"}
                  className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald transition appearance-none"
                  disabled={isPending}
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: BODY */}
        {activeTab === "body" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-kore-muted mb-1.5">Altura (cm)</label>
                <input
                  name="height"
                  type="number"
                  defaultValue={patient.height || ""}
                  placeholder="Ex: 175"
                  className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald transition"
                  disabled={isPending}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-kore-muted mb-1.5">Peso Atual (kg)</label>
                <input
                  name="weight"
                  type="number"
                  step="0.1"
                  defaultValue={patient.weight || ""}
                  placeholder="Ex: 70.5"
                  className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald transition"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-kore-muted mb-1.5">% Gordura</label>
                <input
                  name="body_fat_percentage"
                  type="number"
                  step="0.1"
                  defaultValue={patient.body_fat || meta.body_fat_percentage || ""}
                  placeholder="Ex: 15"
                  className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald transition"
                  disabled={isPending}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-kore-muted mb-1.5">Peso Alvo (kg)</label>
                <input
                  name="goal_weight"
                  type="number"
                  step="0.1"
                  defaultValue={patient.target_weight || meta.goal_weight || ""}
                  placeholder="Ex: 65.0"
                  className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald transition"
                  disabled={isPending}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-kore-muted mb-1.5">Meta Gordura (%)</label>
              <input
                name="goal_body_fat"
                type="number"
                step="0.1"
                defaultValue={patient.target_body_fat || meta.goal_body_fat || ""}
                placeholder="Ex: 12"
                className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald transition"
                disabled={isPending}
              />
            </div>
          </div>
        )}

        {/* TAB CONTENT: ROUTINE */}
        {activeTab === "routine" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-kore-muted mb-1.5">Objetivo</label>
                <select
                  name="goal"
                  className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald transition appearance-none"
                  required
                  defaultValue={goal}
                  disabled={isPending}
                >
                  <option value="Emagrecimento">Emagrecimento</option>
                  <option value="Hipertrofia">Hipertrofia</option>
                  <option value="Saúde Clínica">Saúde Clínica</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Performance">Performance</option>
                  <option value="Saúde">Saúde Geral</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-kore-muted mb-1.5">Treino (Freq.)</label>
                <select
                  name="training_frequency"
                  className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald transition appearance-none"
                  defaultValue={patient.training_frequency || meta.training_frequency || "Sedentário"}
                  disabled={isPending}
                >
                  <option value="Sedentário">Sedentário</option>
                  <option value="1 a 2x">1 a 2x por semana</option>
                  <option value="1-2x na semana">1-2x na semana</option>
                  <option value="3 a 4x">3 a 4x por semana</option>
                  <option value="3-4x na semana">3-4x na semana</option>
                  <option value="5+ vezes">5+ vezes por semana</option>
                  <option value="5+ vezes na semana">5+ vezes na semana</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-kore-muted mb-1.5">Meta Água (L)</label>
              <input
                name="water_goal"
                type="number"
                step="0.1"
                defaultValue={patient.water_goal || meta.water_goal || ""}
                placeholder="Ex: 2.5"
                className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald transition"
                disabled={isPending}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-kore-muted mb-1.5">Restrições / Alergias</label>
              <textarea
                name="dietary_restrictions"
                defaultValue={patient.dietary_restrictions || meta.dietary_restrictions || ""}
                placeholder="Intolerância à lactose, vegetariano, alergia a amendoim..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald transition resize-none"
                disabled={isPending}
              ></textarea>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-4 flex items-center justify-between border-t border-kore-border/50">
          <button
            type="button"
            onClick={() => {
              if (activeTab === "body") setActiveTab("basic");
              else if (activeTab === "routine") setActiveTab("body");
              else onOpenChange(false);
            }}
            disabled={isPending}
            className="px-4 py-2 rounded-xl text-sm font-bold text-kore-muted hover:bg-kore-bg hover:text-kore-ink transition flex items-center gap-1 disabled:opacity-50"
          >
            {activeTab === "basic" ? "Cancelar" : (
              <><ChevronLeft size={16} /> Voltar</>
            )}
          </button>
          
          {activeTab !== "routine" ? (
            <button
              type="button"
              onClick={() => {
                if (activeTab === "basic") setActiveTab("body");
                else if (activeTab === "body") setActiveTab("routine");
              }}
              disabled={isPending}
              className="px-5 py-2 rounded-xl bg-kore-emerald/10 hover:bg-kore-emerald/20 text-kore-emerald-deep font-bold text-sm transition flex items-center gap-1"
            >
              Avançar <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 rounded-xl bg-kore-emerald hover:brightness-105 text-white font-bold text-sm shadow-lg shadow-kore-emerald/30 transition active:scale-95 disabled:opacity-50"
            >
              {isPending ? "Salvando..." : "Salvar Alterações"}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}
