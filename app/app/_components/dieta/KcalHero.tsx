"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect } from "react";
import { selectConsumedKcal, useKore } from "../store";

export function KcalHero() {
  const goal = useKore((s) => s.kcalGoal);
  const consumed = useKore(selectConsumedKcal);
  const remaining = Math.max(0, goal - consumed);
  const pct = Math.min(100, (consumed / goal) * 100);

  const target = useMotionValue(pct);
  const spring = useSpring(target, { stiffness: 110, damping: 18, mass: 1.1 });
  const widthStyle = useTransform(spring, (v) => `${v}%`);
  useEffect(() => {
    target.set(pct);
  }, [pct, target]);

  return (
    <section className="rounded-3xl bg-kore-card border border-kore p-5 shadow-sm overflow-hidden relative">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted font-semibold">
            Calorias do dia
          </p>
          <h2 className="text-[40px] leading-none font-extrabold text-kore mt-1 tabular-nums">
            {Math.round(consumed)}
            <span className="text-lg text-muted font-medium"> / {goal}</span>
          </h2>
          <p className="text-sm text-muted mt-1">
            Restam{" "}
            <span className="text-kore-emerald font-bold">
              {Math.round(remaining)}
            </span>{" "}
            kcal
          </p>
        </div>
        <motion.div
          key={pct >= 100 ? "done" : "wip"}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 text-right"
        >
          <p className="text-[10px] uppercase font-bold text-kore-emerald">
            Progresso
          </p>
          <p className="text-2xl font-extrabold text-kore tabular-nums">
            {pct.toFixed(0)}%
          </p>
        </motion.div>
      </div>

      <div className="mt-4 h-5 rounded-full bg-kore-bg border border-kore overflow-hidden relative">
        <motion.div
          style={{ width: widthStyle }}
          className="h-full liquid-wave relative"
        >
          <svg
            viewBox="0 0 120 12"
            preserveAspectRatio="none"
            className="absolute -right-3 top-0 h-full w-4 text-emerald-500"
          >
            <motion.path
              fill="currentColor"
              d="M0 0 Q 3 6 0 12 V0 Z"
              animate={{ x: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
            />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
