"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, HeartPulse, Save } from "lucide-react";
import { useKore } from "../../store";

const GOALS = [
  "Perder peso",
  "Ganhar massa muscular",
  "Manutenção",
  "Melhorar condicionamento",
  "Saúde geral",
];

export function HealthView() {
  const setProfileView = useKore((s) => s.setProfileView);
  const [weight, setWeight] = useState("78");
  const [height, setHeight] = useState("175");
  const [goal, setGoal] = useState("Manutenção");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      {/* Header */}
      <header className="flex items-center gap-3">
        <button
          onClick={() => setProfileView("menu")}
          className="w-10 h-10 rounded-2xl border border-kore bg-kore-card flex items-center justify-center active:scale-95 transition"
        >
          <ArrowLeft size={18} className="text-kore" />
        </button>
        <div>
          <p className="text-xs text-muted">Perfil</p>
          <h1 className="text-xl font-extrabold text-kore tracking-tight">
            Dados de Saúde
          </h1>
        </div>
      </header>

      {/* Icon header card */}
      <section className="rounded-3xl border border-kore bg-kore-card p-5 shadow-sm">
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
      <section className="rounded-3xl border border-kore bg-kore-card p-5 shadow-sm space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
            Peso (kg)
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Ex: 78"
            className="w-full rounded-2xl border border-kore bg-kore-bg/60 px-4 py-3 text-kore font-semibold text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
            Altura (cm)
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="Ex: 175"
            className="w-full rounded-2xl border border-kore bg-kore-bg/60 px-4 py-3 text-kore font-semibold text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
          />
        </div>

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
        onClick={handleSave}
        className="w-full rounded-3xl bg-emerald-500 hover:brightness-105 text-white font-bold py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition"
      >
        <Save size={18} />
        {saved ? "Salvo ✓" : "Salvar alterações"}
      </button>
    </motion.div>
  );
}