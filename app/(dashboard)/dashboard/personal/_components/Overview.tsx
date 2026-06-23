"use client";

import { motion } from "framer-motion";
import { AgendaToday } from "./AgendaToday";
import { OWNER } from "./data";
import { KpiGrid } from "./KpiGrid";
import { StudentsTable } from "./StudentsTable";
import { WeeklyVolumeChart } from "./WeeklyVolumeChart";
import { WorkoutsToBuild } from "./WorkoutsToBuild";

export function Overview({ personalName, metrics, dashboardData }: { personalName: string, metrics: any, dashboardData: any }) {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-[1440px] mx-auto">
      <Header personalName={personalName} metrics={metrics} />
      <KpiGrid kpis={dashboardData?.kpis} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <StudentsTable students={dashboardData?.students || []} />
          <WeeklyVolumeChart />
        </div>
        <div className="space-y-6">
          <AgendaToday agenda={dashboardData?.agendaToday || []} />
          <WorkoutsToBuild />
        </div>
      </div>
    </div>
  );
}

function Header({ personalName, metrics }: { personalName: string, metrics: any }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const firstName = personalName.split(" ")[0] ?? OWNER.name.split(" ")[0];

  return (
    <motion.header
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className="flex items-end justify-between gap-4 flex-wrap"
    >
      <div>
        <p className="text-xs text-kore-muted font-semibold">
          {greeting}, {firstName} 👋
        </p>
        <h1 className="text-3xl font-extrabold text-kore-ink tracking-tight mt-0.5">
          Você tem <span className="text-kore-emerald-deep">{metrics?.activeStudents ?? 0} alunos ativos</span>
        </h1>
        <p className="text-sm text-kore-muted mt-1">
          Resumo da operação · R$ {(metrics?.monthlyRevenue ?? 0).toFixed(2)} faturamento no mês
        </p>
      </div>
    </motion.header>
  );
}
