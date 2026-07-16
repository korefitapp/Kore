"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, HeartPulse, Save } from "lucide-react";
import Link from "next/link";
import { updateHealthData } from "@/app/actions/profile-actions";

const GOALS = [
  "Perder peso",
  "Ganhar massa muscular",
  "Manutenção",
  "Melhorar condicionamento",
  "Saúde geral",
];

interface HealthData {
  weight: string;
  height: string;
  fitness_goal: string;
  medical_restrictions: string;
}

export function HealthClient({ defaultValues }: { defaultValues: HealthData }) {
  const [weight, setWeight] = useState(defaultValues.weight);
  const [height, setHeight] = useState(defaultValues.height);
  const [goal, setGoal] = useState(defaultValues.fitness_goal);
  const [restrictions, setRestrictions] = useState(defaultValues.medical_restrictions);
  
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("fitness_goal", goal); // Because we use custom buttons for goals
    
    startTransition(async () => {
      try {
        await updateHealthData(formData);
        const { toast } = require("@/store/useToastStore");
        toast.success("Dados atualizados com sucesso!");
      } catch (e) {
        const { toast } = require("@/store/useToastStore");
        toast.error("Erro ao salvar dados.");
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen bg-kore-bg px-4 pt-4 pb-28 max-w-lg mx-auto"
    >
      {/* Header */}
      <header className="flex items-center gap-3 mb-6">
        <Link
          href="/app/profile"
          className="w-10 h-10 rounded-2xl border border-kore bg-kore-card flex items-center justify-center active:scale-95 transition"
        >
          <ArrowLeft size={18} className="text-kore" />
        </Link>
        <div>
          <p className="text-xs text-muted">Perfil</p>
          <h1 className="text-xl font-extrabold text-kore tracking-tight">
            Dados de Saúde
          </h1>
        </div>
      </header>

      {/* Icon header card */}
      <section className="rounded-3xl border border-kore bg-kore-card p-5 shadow-sm mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <HeartPulse size={26} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-kore">
              Seus dados corporais
            </h2>
            <p className="text-sm text-muted">
              Mantenha suas informações atualizadas para cálculos precisos
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="rounded-3xl border border-kore bg-kore-card p-5 shadow-sm space-y-5">
          {/* Peso */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
              Peso (kg)
            </label>
            <input
              name="weight"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Ex: 78"
              className="w-full rounded-2xl border border-kore bg-kore-bg/60 px-4 py-3 text-kore font-semibold text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
            />
          </div>

          {/* Altura */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
              Altura (cm)
            </label>
            <input
              name="height"
              type="number"
              step="0.1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="Ex: 175"
              className="w-full rounded-2xl border border-kore bg-kore-bg/60 px-4 py-3 text-kore font-semibold text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
            />
          </div>

          {/* Objetivo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
              Objetivo
            </label>
            <div className="grid grid-cols-1 gap-2">
              {GOALS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGoal(g)}
                  className={`w-full text-left rounded-2xl border px-4 py-3 text-sm font-semibold transition active:scale-[0.98] ${
                    goal === g
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-kore bg-kore-bg/60 text-kore hover:border-emerald-500/40"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          
          {/* Restrições Médicas */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
              Restrições Médicas / Lesões
            </label>
            <textarea
              name="medical_restrictions"
              value={restrictions}
              onChange={(e) => setRestrictions(e.target.value)}
              placeholder="Ex: Dor no joelho direito, hipertensão..."
              className="w-full rounded-2xl border border-kore bg-kore-bg/60 px-4 py-3 text-kore font-semibold text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition resize-none h-24"
            />
          </div>
        </section>

        {/* IMC Preview */}
        {weight && height && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-3xl border border-kore bg-kore-card p-5 shadow-sm"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
              IMC estimado
            </p>
            <p className="text-3xl font-extrabold text-emerald-500">
              {(
                parseFloat(weight) /
                (parseFloat(height) / 100) ** 2
              ).toFixed(1)}
            </p>
            <p className="text-xs text-muted mt-1">
              {parseFloat(weight) / (parseFloat(height) / 100) ** 2 < 18.5
                ? "Abaixo do peso"
                : parseFloat(weight) / (parseFloat(height) / 100) ** 2 < 25
                  ? "Peso normal"
                  : parseFloat(weight) / (parseFloat(height) / 100) ** 2 < 30
                    ? "Sobrepeso"
                    : "Obesidade"}
            </p>
          </motion.section>
        )}

        {/* Save button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-3xl bg-emerald-500 hover:brightness-105 text-white font-bold py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition disabled:opacity-50"
        >
          <Save size={18} />
          {isPending ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>
    </motion.div>
  );
}
