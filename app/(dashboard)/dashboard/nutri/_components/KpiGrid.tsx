"use client";

import { motion } from "framer-motion";
import {
  CalendarClock,
  MessageSquareWarning,
  Salad,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import type { KpiTone, NutriKpi } from "./types";

const ICONS = {
  "calendar-clock": CalendarClock,
  "trending-down": TrendingDown,
  "message-warning": MessageSquareWarning,
  salad: Salad,
} as const;

const TONES: Record<KpiTone, string> = {
  amber:
    "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-300 ring-amber-200/70 dark:ring-amber-500/30",
  rose: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-300 ring-rose-200/70 dark:ring-rose-500/30",
  sky: "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-300 ring-sky-200/70 dark:ring-sky-500/30",
  emerald:
    "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 ring-emerald-200/70 dark:ring-emerald-500/30",
};

export function KpiGrid({ dashboardData }: { dashboardData?: any }) {
  const patientsCount = dashboardData?.patients?.length || 0;
  const unreadCount = dashboardData?.unreadMessagesCount || 0;
  const appointmentsCount = dashboardData?.appointmentsToday?.length || 0;
  const lowAdherenceCount = dashboardData?.patients?.filter((p: any) => p.status === 'atencao' || p.status === 'churned').length || 0;

  const KPIS: NutriKpi[] = [
    {
      id: "to-review",
      icon: "calendar-clock",
      value: patientsCount,
      label: "Pacientes ativos",
      hint: "Total de pacientes vinculados",
      tone: "amber",
      href: "/dashboard/nutri/patients",
    },
    {
      id: "low-adherence",
      icon: "trending-down",
      value: lowAdherenceCount,
      label: "Aderência baixa",
      hint: "Pacientes precisando de atenção",
      tone: "rose",
      href: "/dashboard/nutri/patients?filter=atencao",
    },
    {
      id: "unread",
      icon: "message-warning",
      value: unreadCount,
      label: "Mensagens não lidas",
      hint: "Mensagens aguardando resposta",
      tone: "sky",
      href: "/dashboard/nutri/messages",
    },
    {
      id: "today",
      icon: "salad",
      value: appointmentsCount,
      label: "Consultas hoje",
      hint: "Consultas agendadas para hoje",
      tone: "emerald",
      href: "/dashboard/nutri/appointments",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {KPIS.map((kpi, i) => (
        <KpiTile key={kpi.id} kpi={kpi} index={i} />
      ))}
    </div>
  );
}

function KpiTile({ kpi, index }: { kpi: NutriKpi; index: number }) {
  const Icon = ICONS[kpi.icon];
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.05,
        type: "spring",
        stiffness: 200,
        damping: 22,
      }}
      className="card p-4 text-left ring-1 ring-transparent hover:ring-kore-emerald/40 transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-md hover:border-emerald-500/50 block w-full h-full"
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
    </motion.div>
  );

  if (kpi.href) {
    return (
      <Link href={kpi.href} className="block w-full h-full">
        {content}
      </Link>
    );
  }

  return content;
}
