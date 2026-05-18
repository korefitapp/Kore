"use client";

import { motion } from "framer-motion";
import { Check, Flame } from "lucide-react";
import { useKore } from "../store";

export function StreakCalendar() {
  const week = useKore((s) => s.week);
  const streak = useKore((s) => s.streak);

  return (
    <section className="rounded-3xl bg-kore-card border border-kore p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted font-semibold">
            Semana atual
          </p>
          <h3 className="text-base font-semibold text-kore">
            Calendário de hábitos
          </h3>
        </div>
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-center gap-1.5 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-300 px-3 py-1.5 font-bold text-sm"
        >
          <Flame size={16} className="fill-orange-500 stroke-orange-500" />
          {streak}
        </motion.div>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
        {week.map((d, i) => (
          <motion.div
            key={i}
            whileTap={{ scale: 0.96 }}
            className={`flex-shrink-0 w-[52px] rounded-2xl border p-2.5 flex flex-col items-center gap-2 transition-colors ${
              d.isToday
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                : "border-kore bg-kore-bg/40"
            }`}
          >
            <span className="text-[10px] font-semibold uppercase text-muted">
              {d.label}
            </span>
            <span className="text-sm font-bold text-kore">{d.date}</span>
            {d.done ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="w-6 h-6 rounded-full bg-kore-emerald flex items-center justify-center"
              >
                <Check size={14} className="text-white" strokeWidth={3} />
              </motion.div>
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600" />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
