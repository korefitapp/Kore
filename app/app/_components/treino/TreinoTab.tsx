"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Clock, Dumbbell, Flame } from "lucide-react";
import { useKore } from "../store";
import { ActiveMode } from "./ActiveMode";

export function TreinoTab() {
  const exercises = useKore((s) => s.exercises);
  const activeId = useKore((s) => s.activeExerciseId);
  const setActive = useKore((s) => s.setActive);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {activeId ? (
        <ActiveMode key={`active-${activeId}`} exerciseId={activeId} />
      ) : (
        <motion.div
          key="list"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          <header>
            <p className="text-xs text-muted">Periodização · Semana 3</p>
            <h1 className="text-2xl font-extrabold text-kore tracking-tight">
              Push A · Peito · Tríceps
            </h1>
          </header>

          <section className="rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 text-white shadow-sm">
            <div className="flex items-center justify-between text-sm">
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
              onClick={() => {
                if (exercises[0]) setActive(exercises[0].id);
              }}
              className="mt-4 w-full bg-white text-emerald-700 rounded-2xl font-bold py-3 flex items-center justify-center gap-1.5 active:scale-[0.98] transition"
            >
              Iniciar Treino
              <ChevronRight size={18} strokeWidth={2.6} />
            </button>
          </section>

          <div className="space-y-2.5">
            {exercises.map((ex, idx) => (
              <button
                key={ex.id}
                onClick={() => setActive(ex.id)}
                className="w-full text-left rounded-3xl bg-kore-card border border-kore p-3 flex items-center gap-3 hover:border-emerald-300 transition active:scale-[0.99]"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-3xl flex-shrink-0">
                  {ex.thumb}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase font-bold text-muted tracking-wider">
                    Exercício {idx + 1}
                  </p>
                  <p className="font-bold text-kore truncate">{ex.name}</p>
                  <p className="text-xs text-muted">
                    {ex.targetReps} · {ex.muscle}
                  </p>
                </div>
                <ChevronRight size={18} className="text-muted flex-shrink-0" />
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
