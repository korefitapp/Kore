"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Clock } from "lucide-react";
import { useState } from "react";
import { useKore } from "../store";
import type { Meal } from "../types";

export function MealAccordion({
  meal,
  defaultOpen,
  onToggle,
  onToggleItem,
}: {
  meal: Meal;
  defaultOpen?: boolean;
  onToggle?: () => void;
  onToggleItem?: (itemId: string, consumed: boolean) => void;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const toggleMeal = useKore((s) => s.toggleMeal);

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      toggleMeal(meal.id);
    }
  };

  const total = meal.items.reduce((acc, it) => acc + it.kcal, 0);
  const protein = meal.items.reduce((acc, it) => acc + it.protein, 0);
  const carbs = meal.items.reduce((acc, it) => acc + it.carbs, 0);
  const fat = meal.items.reduce((acc, it) => acc + it.fat, 0);
  const totalItems = meal.items.length;
  const consumedItemsCount = meal.items.filter((it) => it.consumed).length;
  const pct = totalItems > 0 ? (consumedItemsCount / totalItems) * 100 : 0;
  
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <motion.section
      layout
      className={`rounded-3xl border bg-kore-card overflow-hidden transition-all duration-300 ${
        pct === 100
          ? "border-emerald-200 dark:border-emerald-700/50 opacity-60 scale-[0.98]"
          : "border-kore"
      }`}
    >
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onToggle) onToggle();
          }}
          className="relative flex-shrink-0 w-12 h-12 flex items-center justify-center transition-transform active:scale-90"
          aria-label="Marcar todos"
        >
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 48 48">
            <circle
              cx="24"
              cy="24"
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth="4"
              className="text-slate-200 dark:text-slate-700"
            />
            <circle
              cx="24"
              cy="24"
              r={radius}
              fill={pct === 100 ? "currentColor" : "transparent"}
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`transition-all duration-700 ease-out ${
                pct === 100 
                  ? "text-kore-emerald fill-kore-emerald" 
                  : "text-kore-emerald"
              }`}
            />
          </svg>
          <AnimatePresence>
            {pct === 100 && (
              <motion.span
                key="check"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="z-10 text-white"
              >
                <Check size={20} strokeWidth={3} />
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
                  onClick={() => onToggleItem && onToggleItem(it.id, !!it.consumed)}
                  className={`flex items-center gap-3 rounded-2xl bg-kore-bg/60 border border-kore px-3 py-2.5 cursor-pointer transition-all active:scale-[0.98] ${
                    it.consumed ? "opacity-50" : ""
                  }`}
                >
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    it.consumed 
                      ? "bg-kore-emerald border-kore-emerald" 
                      : "border-slate-300 dark:border-slate-600"
                  }`}>
                    {it.consumed && <Check size={12} strokeWidth={3} className="text-white" />}
                  </div>
                  <div className={`flex-1 min-w-0 ${it.consumed ? "line-through decoration-slate-400" : ""}`}>
                    <p className="font-medium text-kore text-sm truncate">{it.name}</p>
                    <p className="text-[11px] text-muted">
                      P {it.protein}g · C {it.carbs}g · G {it.fat}g
                    </p>
                  </div>
                  <span className={`font-bold tabular-nums text-sm ${it.consumed ? "text-muted" : "text-kore"}`}>
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
