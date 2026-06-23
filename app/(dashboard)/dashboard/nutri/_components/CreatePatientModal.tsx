"use client";

import { useState, useTransition } from "react";
import { AlertCircle, User, Activity, Target, ChevronRight, ChevronLeft, Link as LinkIcon } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { createPatient, linkExistingPatientToNutri } from "@/app/actions/nutri-actions";
import { useRouter } from "next/navigation";

interface CreatePatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePatientModal({ open, onOpenChange }: CreatePatientModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [mode, setMode] = useState<"novo" | "existente">("novo");
  const [activeTab, setActiveTab] = useState<"basic" | "body" | "routine">("basic");
  const [linkEmail, setLinkEmail] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        const result = await createPatient(formData);
        onOpenChange(false);
        alert(result?.message || "Paciente cadastrado com sucesso!");
        router.refresh();
      } catch (error: any) {
        setErrorMsg(error.message || "Erro ao cadastrar paciente.");
      }
    });
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => {
        if (!isPending) onOpenChange(false);
      }}
      title="Ficha de Anamnese"
      description="Adicione ou cadastre um paciente para acompanhamento."
      maxWidth="2xl"
    >
      <div className="flex bg-kore-bg rounded-xl p-1 mb-6 border border-kore-border">
        <button
          type="button"
          onClick={() => {
            setMode("novo");
            setErrorMsg(null);
          }}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
            mode === "novo" 
              ? "bg-kore-card text-kore-emerald shadow-sm" 
              : "text-kore-muted hover:text-kore-ink"
          }`}
        >
          Cadastrar Novo
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("existente");
            setErrorMsg(null);
          }}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
            mode === "existente" 
              ? "bg-kore-card text-kore-emerald shadow-sm" 
              : "text-kore-muted hover:text-kore-ink"
          }`}
        >
          Vincular Existente
        </button>
      </div>

      {mode === "novo" ? (
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 overflow-x-hidden">
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
              <label className="block text-xs font-bold uppercase tracking-wider text-kore-muted mb-1.5">Nome Completo</label>
              <input
                name="fullName"
                type="text"
                placeholder="Ex: João da Silva"
                className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald transition"
                required
                disabled={isPending}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-kore-muted mb-1.5">E-mail</label>
                <input
                  name="email"
                  type="email"
                  placeholder="Ex: joao@email.com"
                  className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald transition"
                  required
                  disabled={isPending}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-kore-muted mb-1.5">Telefone / WhatsApp</label>
                <input
                  name="phone"
                  type="text"
                  placeholder="Ex: (11) 99999-9999"
                  className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald transition"
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-kore-muted mb-1.5">Nascimento</label>
                <input
                  name="birth_date"
                  type="date"
                  className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald transition"
                  disabled={isPending}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-kore-muted mb-1.5">Sexo Biológico</label>
                <select
                  name="gender"
                  className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald transition"
                  disabled={isPending}
                  defaultValue=""
                >
                  <option value="" disabled>Selecione</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
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
                  name="body_fat"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 15"
                  className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald transition"
                  disabled={isPending}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-kore-muted mb-1.5">Peso Alvo (kg)</label>
                <input
                  name="target_weight"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 65.0"
                  className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald transition"
                  disabled={isPending}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-kore-muted mb-1.5">Meta Gordura (%)</label>
              <input
                name="target_body_fat"
                type="number"
                step="0.1"
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
                  className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald transition"
                  required
                  defaultValue="Saúde Clínica"
                  disabled={isPending}
                >
                  <option value="Emagrecimento">Emagrecimento</option>
                  <option value="Hipertrofia">Hipertrofia</option>
                  <option value="Saúde Clínica">Saúde Clínica</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Performance">Performance</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-kore-muted mb-1.5">Treino (Freq.)</label>
                <select
                  name="training_frequency"
                  className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald transition"
                  defaultValue=""
                  disabled={isPending}
                >
                  <option value="" disabled>Selecione</option>
                  <option value="Sedentário">Sedentário</option>
                  <option value="1 a 2x">1 a 2x por semana</option>
                  <option value="3 a 4x">3 a 4x por semana</option>
                  <option value="5+ vezes">5+ vezes por semana</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-kore-muted mb-1.5">Meta Água (L)</label>
              <input
                name="water_goal"
                type="number"
                step="0.1"
                placeholder="Ex: 2.5"
                className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald transition"
                disabled={isPending}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-kore-muted mb-1.5">Restrições / Alergias</label>
              <textarea
                name="dietary_restrictions"
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
              {isPending ? "Salvando..." : "Salvar Paciente"}
            </button>
          )}
        </div>
      </form>
      ) : (
        <div className="space-y-6 overflow-x-hidden">
          <section>
            <h3 className="text-xs font-bold text-kore-emerald-deep uppercase tracking-wider mb-4 border-b border-kore-border pb-2">
              Vincular Conta Existente
            </h3>
            <div className="bg-kore-card border border-kore-border rounded-xl p-6">
              <p className="text-sm text-kore-muted mb-4">
                Se o seu paciente já utiliza o KORE ou possui conta, insira o e-mail de registro para adicioná-lo à sua carteira.
              </p>
              <div>
                <label className="block text-sm font-bold text-kore-ink mb-1.5">E-mail do Paciente</label>
                <input
                  type="email"
                  value={linkEmail}
                  onChange={(e) => setLinkEmail(e.target.value)}
                  placeholder="Ex: joao@email.com"
                  className="w-full px-3 py-2 rounded-xl bg-kore-bg border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald focus:outline-none transition"
                  disabled={isLinking}
                />
                {linkError && mode === "existente" && (
                  <p className="text-sm text-red-500 mt-2 font-medium">{linkError}</p>
                )}
                {successMsg && mode === "existente" && (
                  <p className="text-sm text-emerald-500 mt-2 font-medium">{successMsg}</p>
                )}
              </div>
            </div>
          </section>

          <div className="pt-4 flex items-center justify-end border-t border-kore-border mt-8 gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isLinking}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-kore-subink hover:text-kore-ink hover:bg-kore-bg transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!linkEmail) return;
                setIsLinking(true);
                setLinkError(null);
                setSuccessMsg(null);
                
                const response = await linkExistingPatientToNutri(linkEmail);
                
                if (!response.success) {
                  setLinkError(response.message);
                  setIsLinking(false);
                  return;
                }
                
                setSuccessMsg(response.message);
                setTimeout(() => {
                  setSuccessMsg(null);
                  setLinkEmail("");
                  onOpenChange(false);
                  router.refresh();
                }, 1500);
                setIsLinking(false);
              }}
              disabled={isLinking || !linkEmail}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-kore-emerald hover:brightness-110 transition flex items-center gap-2 shadow-kore-emerald disabled:opacity-50"
            >
              {isLinking ? "Buscando..." : <><LinkIcon size={16} /> Buscar e Vincular</>}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
