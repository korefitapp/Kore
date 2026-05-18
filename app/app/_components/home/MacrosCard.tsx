"use client";

import { motion } from "framer-motion";
import { selectConsumedKcal, useKore } from "../store";

function Bar({
  label,
  value,
  goal,
  color,
  bgColor,
}: {
  label: string;
  value: number;
  goal: number;
  color: string;
  bgColor: string;
}) {
  const pct = Math.min(100, (value / goal) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-xs font-semibold text-kore">{label}</span>
        <span className="text-[11px] text-muted tabular-nums">
          {Math.round(value)}/{goal}g
        </span>
      </div>
      <div className={`h-2 rounded-full ${bgColor} overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 110, damping: 18, mass: 1.1 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

export function MacrosCard() {
  const macros = useKore((s) => s.macros);
  const macrosGoal = useKore((s) => s.macrosGoal);
  const kcalGoal = useKore((s) => s.kcalGoal);
  const consumed = useKore(selectConsumedKcal);
  const kcalPct = Math.min(100, (consumed / kcalGoal) * 100);

  return (
    <section className="rounded-3xl bg-kore-card border border-kore p-4 shadow-sm">
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted font-semibold">
            Nutrição
          </p>
          <h3 className="text-base font-semibold text-kore">Macros do dia</h3>
        </div>
        <div className="text-right">
          <p className="text-xl font-extrabold text-kore tabular-nums">
            {Math.round(consumed)}
            <span className="text-sm text-muted font-medium">
              {" "}
              / {kcalGoal} kcal
            </span>
          </p>
          <p className="text-[11px] text-kore-emerald font-semibold">
            {kcalPct.toFixed(0)}% da meta
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2.5">
        <Bar
          label="Proteína"
          value={macros.protein}
          goal={macrosGoal.protein}
          color="bg-rose-400"
          bgColor="bg-rose-100 dark:bg-rose-400/10"
        />
        <Bar
          label="Carboidratos"
          value={macros.carbs}
          goal={macrosGoal.carbs}
          color="bg-amber-400"
          bgColor="bg-amber-100 dark:bg-amber-400/10"
        />
        <Bar
          label="Gorduras"
          value={macros.fat}
          goal={macrosGoal.fat}
          color="bg-violet-400"
          bgColor="bg-violet-100 dark:bg-violet-400/10"
        />
      </div>
    </section>
  );
}
