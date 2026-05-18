"use client";

import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";
import { KPIS } from "./data";
import type { KpiCard } from "./types";

const ICONS: Record<string, typeof Users> = {
  revenue: CircleDollarSign,
  users: Users,
  marketplace: ShoppingCart,
  professionals: Sparkles,
};

const TINTS: Record<string, string> = {
  revenue: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300",
  users: "bg-sky-500/12 text-sky-600 dark:text-sky-300",
  marketplace: "bg-violet-500/12 text-violet-600 dark:text-violet-300",
  professionals: "bg-amber-500/12 text-amber-600 dark:text-amber-300",
};

export function KpiGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {KPIS.map((kpi, i) => (
        <KpiTile key={kpi.id} kpi={kpi} index={i} />
      ))}
    </div>
  );
}

function KpiTile({ kpi, index }: { kpi: KpiCard; index: number }) {
  const Icon = ICONS[kpi.id] ?? CircleDollarSign;
  const tint = TINTS[kpi.id] ?? "bg-kore-emerald/12 text-kore-emerald-deep";
  const positive = kpi.delta >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.05,
        type: "spring",
        stiffness: 200,
        damping: 22,
      }}
      className="card p-5"
    >
      <div className="flex items-start justify-between">
        <div
          className={`w-10 h-10 rounded-xl grid place-items-center ${tint}`}
        >
          <Icon size={18} strokeWidth={2.2} />
        </div>
        <span
          className={`chip ${
            positive
              ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
              : "bg-red-500/12 text-red-600 dark:text-red-300"
          }`}
        >
          {positive ? (
            <ArrowUpRight size={11} strokeWidth={2.8} />
          ) : (
            <ArrowDownRight size={11} strokeWidth={2.8} />
          )}
          {positive ? "+" : ""}
          {kpi.delta.toFixed(1)}%
        </span>
      </div>
      <p className="mt-4 text-[11px] uppercase tracking-[0.16em] font-bold text-kore-muted">
        {kpi.label}
      </p>
      <p className="mt-1 text-2xl font-black text-kore-ink tracking-tight">
        {kpi.value}
      </p>
      <p className="mt-1 text-xs text-kore-muted">{kpi.hint}</p>
    </motion.div>
  );
}
