"use client";

import { motion } from "framer-motion";
import { Activity, CalendarClock, MessageSquareWarning, TrendingDown } from "lucide-react";
import type { KpiTone, PersonalKpi } from "./types";

const ICONS = {
  "calendar-clock": CalendarClock,
  "trending-down": TrendingDown,
  "message-warning": MessageSquareWarning,
  activity: Activity,
} as const;

const TONES: Record<KpiTone, string> = {
  amber:
    "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-300 ring-amber-200/70 dark:ring-amber-500/30",
  rose: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-300 ring-rose-200/70 dark:ring-rose-500/30",
  sky: "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-300 ring-sky-200/70 dark:ring-sky-500/30",
  emerald:
    "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 ring-emerald-200/70 dark:ring-emerald-500/30",
};

export function KpiGrid({ kpis }: { kpis?: any }) {
  const dynamicKpis: PersonalKpi[] = [
    {
      id: "expiring",
      icon: "calendar-clock",
      value: kpis?.expiringPlans ?? 0,
      label: "Treinos vencendo",
      hint: "Alunos com planos a expirar < 12 dias",
      tone: "amber",
    },
    {
      id: "low-adherence",
      icon: "trending-down",
      value: kpis?.lowAdherence ?? 0,
      label: "Aderência baixa",
      hint: "Alunos abaixo de 75% de foco",
      tone: "rose",
    },
    {
      id: "unread",
      icon: "message-warning",
      value: kpis?.unreadMessages ?? 0,
      label: "Mensagens não lidas",
      hint: "A aguardar resposta",
      tone: "sky",
    },
    {
      id: "reviews",
      icon: "activity",
      value: kpis?.scheduledReviews ?? 0,
      label: "Sessões agendadas",
      hint: "Agendamentos esta semana",
      tone: "emerald",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {dynamicKpis.map((kpi, i) => (
        <KpiTile key={kpi.id} kpi={kpi} index={i} />
      ))}
    </div>
  );
}

function KpiTile({ kpi, index }: { kpi: PersonalKpi; index: number }) {
  const Icon = ICONS[kpi.icon];
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.05,
        type: "spring",
        stiffness: 200,
        damping: 22,
      }}
      className="card p-4 text-left ring-1 ring-transparent hover:ring-kore-emerald/40 transition"
    >
      <div className="flex items-center justify-between gap-3">
        <div
          className={`w-11 h-11 rounded-xl grid place-items-center ring-1 ${TONES[kpi.tone]}`}
        >
          <Icon size={20} strokeWidth={2.2} />
        </div>
        <p className="text-3xl font-extrabold text-kore-ink tabular-nums">
          {kpi.value}
        </p>
      </div>
      <p className="mt-3 text-sm font-bold text-kore-ink">{kpi.label}</p>
      <p className="text-xs text-kore-muted mt-0.5 leading-snug">{kpi.hint}</p>
    </motion.button>
  );
}
