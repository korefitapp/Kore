"use client";

import { motion } from "framer-motion";
import { AgendaToday } from "./AgendaToday";
import { OWNER } from "./data";
import { KpiGrid } from "./KpiGrid";
import { StudentsTable } from "./StudentsTable";
import { WeeklyVolumeChart } from "./WeeklyVolumeChart";
import { WorkoutsToBuild } from "./WorkoutsToBuild";

export function Overview({ personalName }: { personalName: string }) {
  return (
    <div className="px-6 lg:px-8 py-6 space-y-6 max-w-[1440px] mx-auto">
      <Header personalName={personalName} />
      <KpiGrid />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <StudentsTable />
          <WeeklyVolumeChart />
        </div>
        <div className="space-y-6">
          <AgendaToday />
          <WorkoutsToBuild />
        </div>
      </div>
    </div>
  );
}

function Header({ personalName }: { personalName: string }) {
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
          Você tem <span className="text-kore-emerald-deep">3 alunos</span> com
          treino vencendo esta semana
        </h1>
        <p className="text-sm text-kore-muted mt-1">
          Resumo da operação · 28 alunos ativos ·{" "}
          <span className="font-semibold text-kore-subink">⭐ 4.92</span> de
          avaliação média
        </p>
      </div>
    </motion.header>
  );
}
