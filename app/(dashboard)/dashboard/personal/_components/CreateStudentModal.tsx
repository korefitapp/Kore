"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "@/components/ui/modal";
import { createStudent, linkExistingStudent } from "@/app/actions/personal-actions";
import { useRouter } from "next/navigation";

const studentSchema = z.object({
  fullName: z.string().min(3, "Nome completo é obrigatório"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  birthDate: z.string().min(10, "Data de nascimento inválida"),
  gender: z.enum(["masculino", "feminino", "outro"]),
  heightCm: z.number().min(100, "Altura inválida"),
  currentWeightKg: z.number().min(30, "Peso inválido"),
  targetWeightKg: z.number().min(30, "Peso objetivo inválido"),
  bodyFatPct: z.number().optional(),
  primaryGoal: z.enum(["hipertrofia", "emagrecimento", "forca", "condicionamento"]),
  experienceLevel: z.enum(["iniciante", "intermediario", "avancado"]),
  injuries: z.string().optional(),
  weeklyFrequency: z.enum(["2x", "3x", "4x", "5x", "6x"]),
});

export type CreateStudentFormData = z.infer<typeof studentSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateStudentModal({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"novo" | "existente">("novo");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [linkEmail, setLinkEmail] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateStudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      gender: "masculino",
      primaryGoal: "hipertrofia",
      experienceLevel: "iniciante",
      weeklyFrequency: "3x",
    },
  });

  const onSubmit = async (data: CreateStudentFormData) => {
    setToastMessage(null);
    const result = await createStudent(data);
    
    if (result.ok) {
      setToastMessage("Aluno cadastrado com sucesso!");
      setTimeout(() => {
        setToastMessage(null);
        reset();
        onClose();
      }, 2000);
    } else {
      setToastMessage(result.error || "Ocorreu um erro ao cadastrar aluno.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Novo Aluno"
      description="Cadastre um novo aluno e preencha a anamnese inicial."
      maxWidth="2xl"
    >
      <div className="flex bg-kore-bg rounded-xl p-1 mb-6 border border-kore-border">
        <button
          type="button"
          onClick={() => {
            setActiveTab("novo");
            setToastMessage(null);
          }}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
            activeTab === "novo" 
              ? "bg-kore-card text-kore-emerald shadow-sm" 
              : "text-kore-muted hover:text-kore-ink"
          }`}
        >
          Cadastrar Novo
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("existente");
            setToastMessage(null);
          }}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
            activeTab === "existente" 
              ? "bg-kore-card text-kore-emerald shadow-sm" 
              : "text-kore-muted hover:text-kore-ink"
          }`}
        >
          Vincular Existente
        </button>
      </div>

      {activeTab === "novo" ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 overflow-x-hidden">
          
          {/* DADOS BÁSICOS */}
        <section>
          <h3 className="text-xs font-bold text-kore-emerald-deep uppercase tracking-wider mb-4 border-b border-kore-border pb-2">
            Dados Básicos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-kore-ink mb-1.5">Nome Completo</label>
              <input
                {...register("fullName")}
                className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald focus:outline-none transition"
              />
              {errors.fullName && <p className="text-xs text-rose-500 mt-1">{errors.fullName.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-bold text-kore-ink mb-1.5">E-mail</label>
              <input
                {...register("email")}
                type="email"
                className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald focus:outline-none transition"
              />
              {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-kore-ink mb-1.5">WhatsApp</label>
              <input
                {...register("phone")}
                placeholder="Ex: 11999999999"
                className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald focus:outline-none transition"
              />
              {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-kore-ink mb-1.5">Data de Nasc.</label>
              <input
                {...register("birthDate")}
                type="date"
                className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald focus:outline-none transition"
              />
              {errors.birthDate && <p className="text-xs text-rose-500 mt-1">{errors.birthDate.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-kore-ink mb-1.5">Sexo Biológico</label>
              <select
                {...register("gender")}
                className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald focus:outline-none transition appearance-none"
              >
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>
        </section>

        {/* COMPOSIÇÃO CORPORAL */}
        <section>
          <h3 className="text-xs font-bold text-kore-emerald-deep uppercase tracking-wider mb-4 border-b border-kore-border pb-2">
            Composição Corporal
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold text-kore-ink mb-1.5">Altura (cm)</label>
              <input
                {...register("heightCm", { valueAsNumber: true })}
                type="number"
                placeholder="Ex: 175"
                className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-kore-ink mb-1.5">Peso (kg)</label>
              <input
                {...register("currentWeightKg", { valueAsNumber: true })}
                type="number"
                step="0.1"
                placeholder="Ex: 80.5"
                className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-kore-ink mb-1.5">Objetivo (kg)</label>
              <input
                {...register("targetWeightKg", { valueAsNumber: true })}
                type="number"
                step="0.1"
                placeholder="Ex: 75"
                className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-kore-ink mb-1.5">% Gordura</label>
              <input
                {...register("bodyFatPct", { valueAsNumber: true })}
                type="number"
                step="0.1"
                placeholder="Opcional"
                className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald focus:outline-none transition"
              />
            </div>
          </div>
        </section>

        {/* ROTINA E METAS */}
        <section>
          <h3 className="text-xs font-bold text-kore-emerald-deep uppercase tracking-wider mb-4 border-b border-kore-border pb-2">
            Rotina e Metas Desportivas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-kore-ink mb-1.5">Objetivo Principal</label>
              <select
                {...register("primaryGoal")}
                className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald focus:outline-none transition appearance-none"
              >
                <option value="hipertrofia">Hipertrofia</option>
                <option value="emagrecimento">Emagrecimento</option>
                <option value="forca">Força Máxima</option>
                <option value="condicionamento">Condicionamento / Saúde</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-kore-ink mb-1.5">Frequência Semanal</label>
              <select
                {...register("weeklyFrequency")}
                className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald focus:outline-none transition appearance-none"
              >
                <option value="2x">2x na semana</option>
                <option value="3x">3x na semana</option>
                <option value="4x">4x na semana</option>
                <option value="5x">5x na semana</option>
                <option value="6x">6x na semana</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-kore-ink mb-1.5">Nível de Experiência</label>
              <select
                {...register("experienceLevel")}
                className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald focus:outline-none transition appearance-none"
              >
                <option value="iniciante">Iniciante</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-kore-ink mb-1.5">Lesões / Limitações</label>
              <textarea
                {...register("injuries")}
                rows={3}
                placeholder="Ex: Condromalácia patelar, hérnia L5-S1..."
                className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald focus:outline-none transition resize-none"
              />
            </div>
          </div>
        </section>

        {/* TOAST E BOTÕES */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between border-t border-kore-border mt-8 gap-4">
          <div className="text-sm font-bold">
            {toastMessage && (
              <span className={toastMessage.includes("sucesso") ? "text-emerald-500" : "text-rose-500"}>
                {toastMessage}
              </span>
            )}
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-bold text-kore-subink hover:text-kore-ink hover:bg-kore-bg transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-kore-emerald hover:brightness-110 transition shadow-kore-emerald disabled:opacity-50"
            >
              {isSubmitting ? "Cadastrando..." : "Cadastrar Aluno"}
            </button>
          </div>
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
                Se o seu aluno já utiliza o KORE ou já possui uma conta de Paciente/Aluno, insira o e-mail de registo dele para o adicionar à sua carteira.
              </p>
              <div>
                <label className="block text-sm font-bold text-kore-ink mb-1.5">E-mail do Aluno</label>
                <input
                  type="email"
                  value={linkEmail}
                  onChange={(e) => setLinkEmail(e.target.value)}
                  placeholder="Ex: joao@email.com"
                  className="w-full px-3 py-2 rounded-xl bg-kore-bg border border-kore-border text-sm font-medium text-kore-ink focus:border-kore-emerald focus:outline-none transition"
                />
                {linkError && <p className="text-sm text-red-500 mt-2">{linkError}</p>}
                {toastMessage && activeTab === "existente" && (
                  <p className="text-sm text-emerald-500 mt-2 font-medium">
                    {toastMessage}
                  </p>
                )}
              </div>
            </div>
          </section>

          <div className="pt-4 flex items-center justify-end border-t border-kore-border mt-8 gap-3">
            <button
                type="button"
                onClick={onClose}
                disabled={isLinking}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-bold text-kore-subink hover:text-kore-ink hover:bg-kore-bg transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!linkEmail) return;
                  setIsLinking(true);
                  setLinkError(null);
                  setToastMessage(null);
                  
                  const response = await linkExistingStudent(linkEmail);
                  
                  if (!response.success) {
                    setLinkError(response.message);
                    setIsLinking(false);
                    return;
                  }
                  
                  setToastMessage(response.message);
                  setTimeout(() => {
                    setToastMessage(null);
                    setLinkEmail("");
                    onClose();
                    router.refresh();
                  }, 1500);
                  setIsLinking(false);
                }}
                disabled={isLinking || !linkEmail}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-kore-emerald hover:brightness-110 transition shadow-kore-emerald disabled:opacity-50"
              >
                {isLinking ? "Buscando..." : "Buscar e Vincular"}
              </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
