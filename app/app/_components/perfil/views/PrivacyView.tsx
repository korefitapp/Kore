"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Shield,
  Download,
  Eye,
  BarChart3,
  Share2,
} from "lucide-react";
import { useKore } from "../../store";

interface PrivacyOption {
  id: string;
  label: string;
  description: string;
  icon: typeof Shield;
  color: string;
  bgColor: string;
  defaultOn: boolean;
}

const PRIVACY_OPTIONS: PrivacyOption[] = [
  {
    id: "analytics",
    label: "Dados de uso anônimos",
    description: "Ajudar a melhorar o app com dados anônimos de uso",
    icon: BarChart3,
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-500/10",
    defaultOn: true,
  },
  {
    id: "profile_visible",
    label: "Perfil visível",
    description: "Permitir que outros usuários vejam seu perfil básico",
    icon: Eye,
    color: "text-sky-500",
    bgColor: "bg-sky-50 dark:bg-sky-500/10",
    defaultOn: false,
  },
  {
    id: "share_progress",
    label: "Compartilhar progresso",
    description: "Permitir que seu treinador veja seu progresso em tempo real",
    icon: Share2,
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-500/10",
    defaultOn: true,
  },
];

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-12 h-7 rounded-full transition-colors duration-200 flex-shrink-0 ${
        on ? "bg-emerald-500" : "bg-kore-border"
      }`}
      aria-pressed={on}
    >
      <motion.span
        layout
        className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm"
        animate={{ x: on ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

export function PrivacyView() {
  const setProfileView = useKore((s) => s.setProfileView);
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    PRIVACY_OPTIONS.forEach((opt) => {
      initial[opt.id] = opt.defaultOn;
    });
    return initial;
  });
  const [exporting, setExporting] = useState(false);

  function toggle(id: string) {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleExport() {
    setExporting(true);
    setTimeout(() => setExporting(false), 2000);
  }

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
            Privacidade & LGPD
          </h1>
        </div>
      </header>

      {/* Header card */}
      <section className="rounded-3xl border border-kore bg-kore-card p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Shield size={26} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-kore">Seus dados</h2>
            <p className="text-sm text-muted">
              Controle suas permissões e exporte seus dados conforme a LGPD
            </p>
          </div>
        </div>
      </section>

      {/* Export data */}
      <section className="rounded-3xl border border-kore bg-kore-card p-5 shadow-sm">
        <h3 className="text-sm font-bold text-kore mb-3">Exportação de dados</h3>
        <p className="text-xs text-muted mb-4">
          Solicite uma cópia completa de todos os seus dados armazenados no KORE.
          O arquivo será enviado por e-mail em até 48h.
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full rounded-2xl border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold py-3 flex items-center justify-center gap-2 active:scale-[0.98] transition disabled:opacity-50"
        >
          <Download size={18} />
          {exporting ? "Solicitação enviada ✓" : "Solicitar meus dados"}
        </button>
      </section>

      {/* Privacy toggles */}
      <section className="rounded-3xl border border-kore bg-kore-card p-5 shadow-sm">
        <h3 className="text-sm font-bold text-kore mb-3">Permissões</h3>
        <div className="space-y-4">
          {PRIVACY_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <div key={opt.id} className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl ${opt.bgColor} ${opt.color} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-kore text-sm">{opt.label}</p>
                  <p className="text-[11px] text-muted leading-snug">
                    {opt.description}
                  </p>
                </div>
                <Toggle
                  on={toggles[opt.id] ?? false}
                  onToggle={() => toggle(opt.id)}
                />
              </div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}