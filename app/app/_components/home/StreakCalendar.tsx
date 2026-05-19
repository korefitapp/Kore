"use client";

import { motion } from "framer-motion";
import { Check, Flame } from "lucide-react";
import { useKore } from "../store";

export function StreakCalendar() {
  const week = useKore((s) => s.week);
  const streak = useKore((s) => s.streak);

  const doneCount = week.filter((d) => d.done).length;
  const totalDays = week.length;

  return (
    <section className="rounded-3xl bg-kore-card border border-kore p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-kore">
            Calendário da semana
          </h3>
          <p className="text-xs text-muted mt-0.5">
            {doneCount}/{totalDays} hábitos batidos
          </p>
        </div>
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-center gap-1.5 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-300 px-3 py-1.5 font-bold text-sm flex-shrink-0"
        >
          <Flame size={16} className="fill-orange-500 stroke-orange-500" />
          <span>{streak}</span>
          <span className="text-xs font-semibold uppercase tracking-wide">
            streak
          </span>
        </motion.div>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
        {week.map((d, i) => {
          const base =
            "flex-shrink-0 w-[56px] h-[88px] rounded-2xl flex flex-col items-center justify-between py-2.5 px-2 transition-colors";
          let stateClasses: string;
          if (d.done) {
            stateClasses = "bg-emerald-500 text-white";
          } else if (d.isToday) {
            stateClasses =
              "bg-kore-card border-2 border-emerald-500 text-kore";
          } else {
            stateClasses =
              "bg-kore-card border border-slate-200 dark:border-slate-700/60 text-muted";
          }
          return (
            <motion.div
              key={i}
              whileTap={{ scale: 0.95 }}
              className={`${base} ${stateClasses}`}
            >
              <span
                className={`text-[11px] font-semibold uppercase tracking-wide ${
                  d.done ? "text-white/90" : ""
                }`}
              >
                {d.label}
              </span>

              {d.done ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center"
                >
                  <Check size={16} className="text-white" strokeWidth={3} />
                </motion.div>
              ) : (
                <span
                  className={`text-base font-bold ${
                    d.isToday ? "text-emerald-600 dark:text-emerald-400" : ""
                  }`}
                >
                  {d.date}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
