"use client";

import { motion } from "framer-motion";
import { ChevronRight, Clock, Dumbbell, Flame } from "lucide-react";
import { useKore } from "../store";

export function TrainingCard() {
  const setTab = useKore((s) => s.setTab);
  const exercises = useKore((s) => s.exercises);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl overflow-hidden border border-kore shadow-sm relative"
      style={{
        background:
          "linear-gradient(135deg, rgb(var(--kore-emerald)) 0%, rgb(var(--kore-emerald-deep)) 100%)",
      }}
    >
      <div className="absolute -right-8 -top-8 text-white/10 text-[180px] leading-none select-none">
        💪
      </div>
      <div className="p-5 text-white relative">
        <p className="text-xs uppercase tracking-wider font-semibold text-white/80">
          Treino de hoje · Push A
        </p>
        <h3 className="text-xl font-extrabold mt-0.5">
          Peito · Tríceps · Ombros
        </h3>

        <div className="flex items-center gap-4 mt-3 text-sm">
          <span className="flex items-center gap-1.5">
            <Dumbbell size={14} /> {exercises.length} exercícios
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} /> ~52 min
          </span>
          <span className="flex items-center gap-1.5">
            <Flame size={14} /> ~480 kcal
          </span>
        </div>

        <button
          onClick={() => setTab("treino")}
          className="mt-4 w-full rounded-2xl bg-white text-emerald-700 font-bold py-3 flex items-center justify-center gap-1.5 hover:brightness-105 transition active:scale-[0.98]"
        >
          Iniciar Treino
          <ChevronRight size={18} strokeWidth={2.6} />
        </button>
      </div>
    </motion.section>
  );
}
