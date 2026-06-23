"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect } from "react";
import { useKore } from "../store";
import type { Meal } from "../types";

export function KcalHero({ meals = [] }: { meals?: Meal[] }) {
  const goal = useKore((s) => s.kcalGoal);
  const targetMacros = useKore((s) => s.macrosGoal);
  
  const consumedKcal = meals.flatMap((m) => m.items).filter((it) => it.consumed).reduce((acc, it) => acc + it.kcal, 0);
  const consumedProtein = meals.flatMap((m) => m.items).filter((it) => it.consumed).reduce((acc, it) => acc + it.protein, 0);
  const consumedCarbs = meals.flatMap((m) => m.items).filter((it) => it.consumed).reduce((acc, it) => acc + it.carbs, 0);
  const consumedFat = meals.flatMap((m) => m.items).filter((it) => it.consumed).reduce((acc, it) => acc + it.fat, 0);

  const remaining = Math.max(0, goal - consumedKcal);
  const pct = Math.min(100, (goal > 0 ? (consumedKcal / goal) * 100 : 0));

  const target = useMotionValue(pct);
  const spring = useSpring(target, { stiffness: 110, damping: 18, mass: 1.1 });
  const widthStyle = useTransform(spring, (v) => `${v}%`);
  useEffect(() => {
    target.set(pct);
  }, [pct, target]);

  return (
    <section className="rounded-3xl bg-kore-card border border-kore p-5 shadow-sm overflow-hidden relative">
      <div className="flex flex-row items-start justify-between gap-4">
        <div className="flex-shrink-0">
          <p className="text-xs uppercase tracking-wider text-muted font-semibold">
            Calorias do dia
          </p>
          <h2 className="text-[36px] sm:text-[40px] leading-none font-extrabold text-kore mt-1 tabular-nums">
            {Math.round(consumedKcal)}
            <span className="text-base sm:text-lg text-muted font-medium"> / {goal}</span>
          </h2>
          <p className="text-sm text-muted mt-1">
            Restam{" "}
            <span className="text-kore-emerald font-bold">
              {Math.round(remaining)}
            </span>{" "}
            kcal
          </p>
        </div>

        {/* Macros Verticais */}
        <div className="flex flex-col gap-2.5 w-full max-w-[140px] pt-1">
          {/* Protein */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] sm:text-xs">
              <span className="font-semibold text-kore">Proteína</span>
              <span className="text-muted tabular-nums">{Math.round(consumedProtein)}/{Math.round(targetMacros?.protein || 0)}g</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-pink-100 dark:bg-pink-950 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (consumedProtein / (targetMacros?.protein || 1)) * 100)}%` }}
                transition={{ type: "spring", bounce: 0, duration: 0.8 }}
                className="h-full bg-pink-500 rounded-full" 
              />
            </div>
          </div>
          
          {/* Carbs */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] sm:text-xs">
              <span className="font-semibold text-kore">Carbo</span>
              <span className="text-muted tabular-nums">{Math.round(consumedCarbs)}/{Math.round(targetMacros?.carbs || 0)}g</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-yellow-100 dark:bg-yellow-900/40 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (consumedCarbs / (targetMacros?.carbs || 1)) * 100)}%` }}
                transition={{ type: "spring", bounce: 0, duration: 0.8 }}
                className="h-full bg-yellow-400 rounded-full" 
              />
            </div>
          </div>

          {/* Fat */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] sm:text-xs">
              <span className="font-semibold text-kore">Gordura</span>
              <span className="text-muted tabular-nums">{Math.round(consumedFat)}/{Math.round(targetMacros?.fat || 0)}g</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-purple-100 dark:bg-purple-950 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (consumedFat / (targetMacros?.fat || 1)) * 100)}%` }}
                transition={{ type: "spring", bounce: 0, duration: 0.8 }}
                className="h-full bg-purple-400 rounded-full" 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 h-4 sm:h-5 rounded-full bg-kore-bg border border-kore overflow-hidden relative">
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
