"use client";

import { useTransition, useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { createMealPlan, getNutriPatients, getNutriTemplates } from "@/app/actions/nutri-actions";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, Check } from "lucide-react";
import { calculateTargetCalories, MetabolismResult } from "@/lib/metabolism";

interface CreateMealPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPatientId?: string;
}

export function CreateMealPlanModal({
  open,
  onOpenChange,
  defaultPatientId = "",
}: CreateMealPlanModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [patients, setPatients] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"zero" | "template">("zero");

  const [patientSearch, setPatientSearch] = useState("");
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(defaultPatientId);
  const [objective, setObjective] = useState("Saúde Geral");
  const [recommendedKcal, setRecommendedKcal] = useState("");
  const [calcResult, setCalcResult] = useState<MetabolismResult | null>(null);

  const filteredPatients = patients.filter(p => {
    const name = (p.display_name || p.full_name || "").toLowerCase();
    return name.includes(patientSearch.toLowerCase());
  });

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  useEffect(() => {
    if (open) {
      if (patients.length === 0) getNutriPatients().then(setPatients);
      if (templates.length === 0) getNutriTemplates().then(setTemplates);
    }
  }, [open, patients.length, templates.length]);

  useEffect(() => {
    if (selectedPatient) {
      // O Supabase retorna weight e height na raiz, mas o resto no metadata JSON
      const patientBiometrics = {
        weight: selectedPatient.weight,
        height: selectedPatient.height,
        birth_date: selectedPatient.metadata?.birth_date,
        gender: selectedPatient.metadata?.gender,
        training_freq: selectedPatient.metadata?.training_frequency,
        goal: selectedPatient.metadata?.fitness_goal
      };

      const computedObjective = patientBiometrics.goal || objective;
      setObjective(computedObjective); // atualiza objetivo visual com a meta do paciente
      
      const result = calculateTargetCalories({ ...patientBiometrics, goal: computedObjective }, "mifflin");
      setCalcResult(result);
      if (result) {
        setRecommendedKcal(result.finalTargetKcal.toString());
      } else {
        setRecommendedKcal("");
      }
    }
  }, [selectedPatientId, patients]); // Corre apenas ao mudar paciente

  // Permite recalcular se o nutricionista mudar manualmente o objetivo na combo-box
  useEffect(() => {
    if (selectedPatient) {
      const patientBiometrics = {
        weight: selectedPatient.weight,
        height: selectedPatient.height,
        birth_date: selectedPatient.metadata?.birth_date,
        gender: selectedPatient.metadata?.gender,
        training_freq: selectedPatient.metadata?.training_frequency,
        goal: selectedPatient.metadata?.fitness_goal
      };

      const result = calculateTargetCalories({ ...patientBiometrics, goal: objective }, "mifflin");
      setCalcResult(result);
      if (result) {
        setRecommendedKcal(result.finalTargetKcal.toString());
      }
    }
  }, [objective]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (!selectedPatientId) {
      alert("Por favor, selecione um paciente.");
      return;
    }

    // Ensure we don't submit fields from hidden tabs
    if (activeTab === "zero") {
      formData.delete("templateId");
    } else {
      // If we are using a template, we are NOT saving it as a new template itself, 
      // although we could, but let's keep it simple.
      formData.delete("is_template");
      formData.delete("objective");
      formData.delete("daily_kcal_goal");
    }

    startTransition(async () => {
      try {
        const planId = await createMealPlan(formData);
        onOpenChange(false);
        alert("Cardápio criado com sucesso!");
        router.push(`/dashboard/nutri/meal-plans/${planId}/builder`);
      } catch (error: any) {
        alert(error.message || "Erro ao criar cardápio.");
      }
    });
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => { if (!isPending) onOpenChange(false); }}
      title="Novo Cardápio"
      description="Escolha entre criar um plano do zero ou importar um modelo."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Paciente (Comum a ambos) */}
        <div className="relative">
          <label className="block text-xs font-bold uppercase tracking-wider text-kore-muted mb-1.5">
            Paciente
          </label>
          <input type="hidden" name="patientId" value={selectedPatientId} />
          
          <button
            type="button"
            onClick={() => setIsPatientDropdownOpen(!isPatientDropdownOpen)}
            disabled={isPending}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:outline-none focus:border-kore-emerald transition"
          >
            <span className={selectedPatient ? "text-kore-ink" : "text-kore-muted"}>
              {selectedPatient ? (selectedPatient.display_name || selectedPatient.full_name) : "Selecione um paciente..."}
            </span>
            <ChevronDown size={16} className={`text-kore-muted transition-transform ${isPatientDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isPatientDropdownOpen && (
            <div className="absolute z-50 top-[calc(100%+4px)] left-0 w-full bg-kore-card border border-kore-border rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              <div className="p-2 border-b border-kore-border flex items-center gap-2">
                <Search size={14} className="text-kore-muted" />
                <input
                  type="text"
                  placeholder="Buscar paciente..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="w-full bg-transparent text-sm text-kore-ink placeholder-kore-muted focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="max-h-48 overflow-y-auto p-1">
                {filteredPatients.length === 0 ? (
                  <div className="p-3 text-center text-xs text-kore-muted">Nenhum paciente encontrado.</div>
                ) : (
                  filteredPatients.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedPatientId(p.id);
                        setIsPatientDropdownOpen(false);
                        setPatientSearch("");
                      }}
                      className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-sm text-kore-ink hover:bg-kore-bg transition-colors"
                    >
                      {p.display_name || p.full_name}
                      {selectedPatientId === p.id && <Check size={14} className="text-kore-emerald" />}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Custom Tabs */}
        <div className="flex bg-kore-card p-1 rounded-xl border border-kore-border">
          <button
            type="button"
            onClick={() => setActiveTab("zero")}
            className={`flex-1 text-sm font-bold py-2 rounded-lg transition-colors ${
              activeTab === "zero" 
                ? "bg-kore-bg text-kore-ink shadow-sm" 
                : "text-kore-muted hover:text-kore-ink"
            }`}
          >
            Criar do Zero
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("template")}
            className={`flex-1 text-sm font-bold py-2 rounded-lg transition-colors ${
              activeTab === "template" 
                ? "bg-kore-bg text-kore-ink shadow-sm" 
                : "text-kore-muted hover:text-kore-ink"
            }`}
          >
            Usar Modelo
          </button>
        </div>

        {/* ABA: CRIAR DO ZERO */}
        {activeTab === "zero" && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-kore-muted mb-1.5">
                Nome do Cardápio
              </label>
              <input
                name="title"
                type="text"
                placeholder="Ex: Fase 1 - Hipertrofia"
                className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:border-kore-emerald transition"
                required={activeTab === "zero"}
                disabled={isPending}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-kore-muted mb-1.5">
                  Objetivo
                </label>
                <select
                  name="objective"
                  className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:outline-none focus:border-kore-emerald transition appearance-none"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  disabled={isPending}
                >
                  <option value="Emagrecimento">Emagrecimento</option>
                  <option value="Hipertrofia">Hipertrofia</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Saúde Geral">Saúde Geral</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-kore-muted mb-1.5">
                  Meta Calórica (Kcal)
                </label>
                <input
                  name="daily_kcal_goal"
                  type="number"
                  placeholder="Ex: 2500"
                  value={recommendedKcal}
                  onChange={(e) => setRecommendedKcal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:border-kore-emerald transition"
                  disabled={isPending}
                />
                {calcResult && (
                  <p className="mt-1.5 text-[10px] text-kore-muted font-medium">
                    Cálculo automático: {calcResult.tdee} kcal {calcResult.adjustment !== 0 ? (calcResult.adjustment > 0 ? `+ ${calcResult.adjustment}` : `${calcResult.adjustment}`) : ""} (Fórmula: {calcResult.formulaUsed})
                  </p>
                )}
              </div>
            </div>
            
            <label className="flex items-center gap-2 mt-4 cursor-pointer">
              <input 
                type="checkbox" 
                name="is_template" 
                value="true"
                className="w-4 h-4 rounded text-kore-emerald focus:ring-kore-emerald focus:ring-offset-kore-bg bg-kore-card border-kore-border"
                disabled={isPending}
              />
              <span className="text-sm font-medium text-kore-ink">
                Salvar este cardápio como um Modelo para o futuro
              </span>
            </label>
          </div>
        )}

        {/* ABA: USAR MODELO */}
        {activeTab === "template" && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-kore-muted mb-1.5">
                Selecionar Modelo
              </label>
              <select
                name="templateId"
                className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:outline-none focus:border-kore-emerald transition appearance-none"
                required={activeTab === "template"}
                disabled={isPending}
              >
                <option value="" disabled selected>Escolha um modelo salvo...</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.is_template ? "⭐ " : ""}{t.title} {t.daily_kcal_goal ? `(${t.daily_kcal_goal} kcal)` : ""}
                  </option>
                ))}
                {templates.length === 0 && (
                  <option value="" disabled>Nenhum modelo encontrado</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-kore-muted mb-1.5">
                Nome para o Paciente
              </label>
              <input
                name="title"
                type="text"
                placeholder="Ex: Dieta João - Fase 1"
                className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:border-kore-emerald transition"
                required={activeTab === "template"}
                disabled={isPending}
              />
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end gap-2 border-t border-kore-border mt-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="px-4 py-2 rounded-xl text-sm font-bold text-kore-muted hover:text-kore-ink transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2 rounded-xl bg-kore-emerald hover:brightness-105 text-white font-bold text-sm shadow-lg shadow-kore-emerald/30 transition active:scale-95 disabled:opacity-50"
          >
            {isPending ? "Processando..." : "Criar e Editar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
