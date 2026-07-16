"use client";

import { motion } from "framer-motion";
import { Flame, ScanLine } from "lucide-react";
import { useKore } from "../store";
import type { Meal } from "../types";

export function KcalHero({ meals = [] }: { meals?: Meal[] }) {
  const goal = useKore((s) => s.kcalGoal);
  const targetMacros = useKore((s) => s.macrosGoal);
  
  const consumedKcal = meals.flatMap((m) => m.items).filter((it) => it.consumed).reduce((acc, it) => acc + it.kcal, 0);
  const consumedProtein = meals.flatMap((m) => m.items).filter((it) => it.consumed).reduce((acc, it) => acc + it.protein, 0);
  const consumedCarbs = meals.flatMap((m) => m.items).filter((it) => it.consumed).reduce((acc, it) => acc + it.carbs, 0);
  const consumedFat = meals.flatMap((m) => m.items).filter((it) => it.consumed).reduce((acc, it) => acc + it.fat, 0);

  const pct = Math.min(100, (goal > 0 ? (consumedKcal / goal) * 100 : 0));
  const progressDeg = (pct / 100) * 360;

  // Day mock for the UI
  const streak = useKore((s) => s.streak);

  return (
    <section className="mb-8">
      {/* Container principal para Chart e Macros */}
      <div className="flex items-center justify-between gap-6 mb-6 px-2">
        {/* Gráfico Circular Esquerda */}
        <div className="relative w-[150px] h-[150px] flex-shrink-0 flex items-center justify-center">
          {/* Conic Gradient para o anel principal */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(#34d399 ${progressDeg}deg, rgba(255,255,255,0.05) ${progressDeg}deg)`
            }}
          />
          {/* Furo do meio */}
          <div className="absolute inset-[6px] bg-slate-50 dark:bg-[#121212] rounded-full flex flex-col items-center justify-center shadow-inner">
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider mb-1 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
              Dia {streak}
            </span>
            <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-extrabold text-3xl">
              <span className="text-xl">🍎</span>
              {Math.round(consumedKcal)}
            </div>
            <span className="text-slate-500 dark:text-zinc-500 text-[11px] font-bold mt-0.5 tracking-wide">
              {goal} Kcal
            </span>
          </div>
        </div>

        {/* Macros Direita */}
        <div className="flex-1 flex flex-col justify-center gap-5">
          {/* Carbs */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Carbs</span>
              <span className="text-slate-900 dark:text-white font-bold">{Math.round(consumedCarbs)}<span className="text-slate-400 dark:text-zinc-500">/{Math.round(targetMacros?.carbs || 0)}g</span></span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden">
              <div 
                className="h-full bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" 
                style={{ width: `${Math.min(100, (consumedCarbs / (targetMacros?.carbs || 1)) * 100)}%` }}
              />
            </div>
          </div>
          
          {/* Proteins */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-purple-600 dark:text-purple-400 font-bold">Proteins</span>
              <span className="text-slate-900 dark:text-white font-bold">{Math.round(consumedProtein)}<span className="text-slate-400 dark:text-zinc-500">/{Math.round(targetMacros?.protein || 0)}g</span></span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden">
              <div 
                className="h-full bg-purple-400 rounded-full shadow-[0_0_10px_rgba(192,132,252,0.5)]" 
                style={{ width: `${Math.min(100, (consumedProtein / (targetMacros?.protein || 1)) * 100)}%` }}
              />
            </div>
          </div>
          
          {/* Fats */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-orange-600 dark:text-orange-400 font-bold">Fats</span>
              <span className="text-slate-900 dark:text-white font-bold">{Math.round(consumedFat)}<span className="text-slate-400 dark:text-zinc-500">/{Math.round(targetMacros?.fat || 0)}g</span></span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden">
              <div 
                className="h-full bg-orange-400 rounded-full shadow-[0_0_10px_rgba(251,146,60,0.5)]" 
                style={{ width: `${Math.min(100, (consumedFat / (targetMacros?.fat || 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Check calories button */}
      <button className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 border-dashed rounded-2xl py-4 px-5 flex items-center justify-between text-slate-500 dark:text-zinc-300 font-bold text-sm active:scale-[0.99] transition-transform">
        <span>Checar calorias</span>
        <ScanLine size={20} className="text-slate-400 dark:text-zinc-500" />
      </button>
    </section>
  );
}
