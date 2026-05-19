"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Clock } from "lucide-react";
import { useState } from "react";
import { useKore } from "../store";
import type { Meal } from "../types";

export function MealAccordion({
  meal,
  defaultOpen,
}: {
  meal: Meal;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const toggleMeal = useKore((s) => s.toggleMeal);

  const total = meal.items.reduce((acc, it) => acc + it.kcal, 0);
  const protein = meal.items.reduce((acc, it) => acc + it.protein, 0);
  const carbs = meal.items.reduce((acc, it) => acc + it.carbs, 0);
  const fat = meal.items.reduce((acc, it) => acc + it.fat, 0);

  return (
    <motion.section
      layout
      className={`rounded-3xl border bg-kore-card overflow-hidden transition-colors ${
        meal.consumed
          ? "border-emerald-200 dark:border-emerald-700/50"
          : "border-kore"
      }`}
    >
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMeal(meal.id);
          }}
          className={`flex-shrink-0 w-12 h-12 rounded-full border-[3px] flex items-center justify-center transition-all active:scale-90 ${
            meal.consumed
              ? "bg-kore-emerald border-kore-emerald shadow-md shadow-emerald-500/30"
              : "bg-transparent border-slate-300 dark:border-slate-600 hover:border-kore-emerald"
          }`}
          aria-label={meal.consumed ? "Desmarcar refeição" : "Marcar refeição"}
        >
          <AnimatePresence mode="wait" initial={false}>
            {meal.consumed && (
              <motion.span
                key="check"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
              >
                <Check size={22} strokeWidth={3} className="text-white" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex-1 flex items-center gap-3 text-left min-w-0"
        >
          <span className="text-2xl">{meal.emoji}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-kore truncate">{meal.name}</h3>
            <p className="text-xs text-muted flex items-center gap-1.5">
              <Clock size={12} /> {meal.targetTime} · {meal.items.length} itens
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-extrabold text-kore tabular-nums">
              {total} kcal
            </p>
            <p className="text-[11px] text-muted">
              P {Math.round(protein)} · C {Math.round(carbs)} · G{" "}
              {Math.round(fat)}
            </p>
          </div>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            className="text-muted"
          >
            <ChevronDown size={20} />
          </motion.span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <ul className="px-4 pb-4 -mt-1 space-y-2">
              {meal.items.map((it) => (
                <li
                  key={it.id}
                  className="flex items-center justify-between rounded-2xl bg-kore-bg/60 border border-kore px-3 py-2.5"
                >
                  <div>
                    <p className="font-medium text-kore text-sm">{it.name}</p>
                    <p className="text-[11px] text-muted">
                      P {it.protein}g · C {it.carbs}g · G {it.fat}g
                    </p>
                  </div>
                  <span className="font-bold text-kore tabular-nums text-sm">
                    {it.kcal} kcal
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
