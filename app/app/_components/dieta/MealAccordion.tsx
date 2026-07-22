"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Clock } from "lucide-react";
import { useState } from "react";
import { useKore } from "../store";
import type { Meal } from "../types";
import { triggerHaptic, playSuccessSound } from "../feedback";

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
    // If the meal is not 100% consumed yet, it will become consumed
    if (pct < 100) {
      triggerHaptic();
      playSuccessSound();
    }
    
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
      className={`relative rounded-[28px] border bg-white dark:bg-white/5 overflow-hidden transition-all duration-300 shadow-sm ${
        pct === 100
          ? "border-emerald-200 dark:border-emerald-500/30 opacity-60 scale-[0.98]"
          : "border-slate-200 dark:border-white/10"
      }`}
    >
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
          className="relative flex-shrink-0 w-12 h-12 flex items-center justify-center transition-transform active:scale-90"
          aria-label="Marcar todos"
        >
          <svg className="absolute inset-0 w-full h-full -rotate-90 text-slate-100 dark:text-white/5" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r={radius} stroke="currentColor" strokeWidth="3" fill="none" />
            <motion.circle
              cx="24"
              cy="24"
              r={radius}
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="text-emerald-500 dark:text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.3)] dark:drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]"
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
                className="absolute z-10 text-emerald-500 dark:text-white"
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
            <h3 className={`font-extrabold text-lg truncate ${pct === 100 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
              {meal.name}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
              <Clock size={12} className="text-slate-400 dark:text-zinc-500" /> {meal.targetTime} · {meal.items.length} itens
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-extrabold text-slate-900 dark:text-white tabular-nums">
              {total} kcal
            </p>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
              P {Math.round(protein)} · C {Math.round(carbs)} · G{" "}
              {Math.round(fat)}
            </p>
          </div>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            className="text-slate-400 dark:text-zinc-600"
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
                  onClick={() => {
                    const willConsume = !it.consumed;
                    if (willConsume) {
                      triggerHaptic();
                      playSuccessSound();
                    }
                    if (onToggleItem) onToggleItem(it.id, !!it.consumed);
                  }}
                  className={`flex items-center gap-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 px-3 py-2.5 cursor-pointer transition-all active:scale-[0.98] ${
                    it.consumed ? "opacity-50" : ""
                  }`}
                >
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    it.consumed 
                      ? "bg-emerald-500 border-emerald-500 dark:bg-emerald-400 dark:border-emerald-400" 
                      : "border-slate-300 dark:border-zinc-700"
                  }`}>
                    {it.consumed && <Check size={14} strokeWidth={3} className="text-white dark:text-[#121212]" />}
                  </div>
                  <div className={`flex-1 min-w-0 ${it.consumed ? "line-through decoration-slate-400 dark:decoration-zinc-600" : ""}`}>
                    <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{it.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-500">
                      P {it.protein}g · C {it.carbs}g · G {it.fat}g
                    </p>
                  </div>
                  <span className={`font-bold tabular-nums text-sm ${it.consumed ? "text-slate-400 dark:text-muted" : "text-emerald-600 dark:text-kore"}`}>
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
