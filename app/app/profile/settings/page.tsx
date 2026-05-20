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
  Monitor,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const LANGUAGES = [
  { code: "pt-BR", label: "Português (Brasil)", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

const UNITS = [
  { id: "metric", label: "Métrico", detail: "kg, cm, km" },
  { id: "imperial", label: "Imperial", detail: "lbs, ft, mi" },
];

const THEMES = [
  { id: "light", label: "Claro", icon: Sun },
  { id: "dark", label: "Escuro", icon: Moon },
  { id: "system", label: "Sistema", icon: Monitor },
];

export default function SettingsPage() {
  const [language, setLanguage] = useState("pt-BR");
  const [unit, setUnit] = useState("metric");
  const [theme, setTheme] = useState("light");

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
            Configurações
          </h1>
        </div>
      </header>

      {/* Icon header card */}
      <section className="rounded-3xl border border-kore bg-kore-card p-5 shadow-sm mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-500/10 text-violet-500 flex items-center justify-center">
            <Settings size={26} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-kore">
              Personalize sua experiência
            </h2>
            <p className="text-sm text-muted">
              Idioma, unidades e aparência do aplicativo
            </p>
          </div>
        </div>
      </section>

      {/* Idioma */}
      <section className="rounded-3xl border border-kore bg-kore-card overflow-hidden mb-5">
        <p className="px-4 pt-4 pb-2 text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
          <Globe size={12} />
          Idioma
        </p>

        {LANGUAGES.map((lang, i) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-kore-bg transition ${
              i !== LANGUAGES.length - 1 ? "border-b border-kore" : ""
            }`}
          >
            <span className="text-xl">{lang.flag}</span>
            <span className="flex-1 min-w-0">
              <p className="font-semibold text-kore text-sm">{lang.label}</p>
            </span>
            {language === lang.code && (
              <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <span className="w-2 h-2 rounded-full bg-white" />
              </span>
            )}
          </button>
        ))}
      </section>

      {/* Unidades de medida */}
      <section className="rounded-3xl border border-kore bg-kore-card overflow-hidden mb-5">
        <p className="px-4 pt-4 pb-2 text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
          <Ruler size={12} />
          Unidades de medida
        </p>

        {UNITS.map((u, i) => (
          <button
            key={u.id}
            onClick={() => setUnit(u.id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-kore-bg transition ${
              i !== UNITS.length - 1 ? "border-b border-kore" : ""
            }`}
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                unit === u.id
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500"
                  : "bg-kore-bg text-muted"
              }`}
            >
              <Ruler size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-kore text-sm">{u.label}</p>
              <p className="text-[11px] text-muted">{u.detail}</p>
            </div>
            {unit === u.id && (
              <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <span className="w-2 h-2 rounded-full bg-white" />
              </span>
            )}
          </button>
        ))}
      </section>

      {/* Tema */}
      <section className="rounded-3xl border border-kore bg-kore-card overflow-hidden mb-5">
        <p className="px-4 pt-4 pb-2 text-xs font-bold uppercase tracking-wider text-muted">
          Tema
        </p>

        <div className="grid grid-cols-3 gap-2 p-4 pt-0">
          {THEMES.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition active:scale-[0.97] ${
                  theme === t.id
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm shadow-emerald-500/20"
                    : "border-kore bg-kore-bg/60 text-muted hover:border-emerald-500/40"
                }`}
              >
                <Icon size={22} />
                <span className="text-xs font-bold">{t.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* App info */}
      <section className="rounded-3xl border border-kore bg-kore-card p-5 shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">Versão do app</p>
            <p className="text-sm font-semibold text-kore">0.1.0</p>
          </div>
          <div className="h-px bg-kore" />
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">Build</p>
            <p className="text-sm font-semibold text-kore">2026.05.20</p>
          </div>
          <div className="h-px bg-kore" />
          <button className="w-full flex items-center justify-between">
            <p className="text-sm text-muted">Termos de uso</p>
            <ChevronRight size={16} className="text-muted" />
          </button>
          <div className="h-px bg-kore" />
          <button className="w-full flex items-center justify-between">
            <p className="text-sm text-muted">Política de privacidade</p>
            <ChevronRight size={16} className="text-muted" />
          </button>
        </div>
      </section>
    </motion.div>
  );
}