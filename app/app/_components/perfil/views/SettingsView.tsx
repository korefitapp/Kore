"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Settings,
  Globe,
  Ruler,
  Sun,
  Moon,
} from "lucide-react";
import { useKore } from "../../store";

const LANGUAGES = [
  { id: "pt-br", label: "Português (BR)" },
  { id: "en", label: "English" },
  { id: "es", label: "Español" },
];

const UNITS = [
  { id: "metric", label: "Métrico (kg, cm)" },
  { id: "imperial", label: "Imperial (lbs, ft)" },
];

const THEMES = [
  { id: "light" as const, label: "Claro", icon: Sun },
  { id: "dark" as const, label: "Escuro", icon: Moon },
];

export function SettingsView() {
  const setProfileView = useKore((s) => s.setProfileView);
  const theme = useKore((s) => s.theme);
  const setTheme = useKore((s) => s.setTheme);

  const [language, setLanguage] = useState("pt-br");
  const [unit, setUnit] = useState("metric");

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
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
            Configurações
          </h1>
        </div>
      </header>

      {/* Header card */}
      <section className="rounded-3xl border border-kore bg-kore-card p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-500/10 text-slate-500 flex items-center justify-center">
            <Settings size={26} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-kore">Preferências</h2>
            <p className="text-sm text-muted">
              Idioma, unidades e aparência do aplicativo
            </p>
          </div>
        </div>
      </section>

      {/* Idioma */}
      <section className="rounded-3xl border border-kore bg-kore-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Globe size={16} className="text-emerald-500" />
          <h3 className="text-sm font-bold text-kore">Idioma</h3>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setLanguage(lang.id)}
              className={`w-full text-left rounded-2xl border px-4 py-3 text-sm font-semibold transition active:scale-[0.98] ${
                language === lang.id
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-kore bg-kore-bg/60 text-kore hover:border-emerald-500/40"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </section>

      {/* Unidades */}
      <section className="rounded-3xl border border-kore bg-kore-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Ruler size={16} className="text-emerald-500" />
          <h3 className="text-sm font-bold text-kore">Unidades de medida</h3>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {UNITS.map((u) => (
            <button
              key={u.id}
              onClick={() => setUnit(u.id)}
              className={`w-full text-left rounded-2xl border px-4 py-3 text-sm font-semibold transition active:scale-[0.98] ${
                unit === u.id
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-kore bg-kore-bg/60 text-kore hover:border-emerald-500/40"
              }`}
            >
              {u.label}
            </button>
          ))}
        </div>
      </section>

      {/* Tema */}
      <section className="rounded-3xl border border-kore bg-kore-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sun size={16} className="text-emerald-500" />
          <h3 className="text-sm font-bold text-kore">Tema</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map((t) => {
            const Icon = t.icon;
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as "light" | "dark")}
                className={`flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-xs font-semibold transition active:scale-[0.98] ${
                  active
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-kore bg-kore-bg/60 text-kore hover:border-emerald-500/40"
                }`}
              >
                <Icon size={20} />
                {t.label}
              </button>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}