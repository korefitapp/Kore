"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Pause, Play } from "lucide-react";
import { useState } from "react";
import { useKore } from "../store";
import { CircularTimer } from "./CircularTimer";

export function ActiveMode({ exerciseId }: { exerciseId: string }) {
  const exercise = useKore((s) =>
    s.exercises.find((e) => e.id === exerciseId),
  );
  const updateSet = useKore((s) => s.updateSet);
  const setActive = useKore((s) => s.setActive);
  const [playing, setPlaying] = useState(true);

  if (!exercise) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 pb-20"
    >
      <header className="flex items-center gap-2">
        <button
          onClick={() => setActive(null)}
          className="w-10 h-10 rounded-2xl bg-kore-card border border-kore flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-kore" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted truncate">{exercise.muscle}</p>
          <h1 className="text-lg font-extrabold text-kore truncate">
            {exercise.name}
          </h1>
        </div>
        <span className="text-xs font-semibold text-kore-emerald bg-emerald-50 dark:bg-emerald-500/10 rounded-full px-3 py-1.5">
          {exercise.targetReps}
        </span>
      </header>

      <div className="relative rounded-3xl overflow-hidden aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 border border-kore shadow-sm">
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            animate={playing ? { scale: [1, 1.06, 1] } : { scale: 1 }}
            transition={{ repeat: Infinity, duration: 1.4 }}
            className="text-7xl"
          >
            {exercise.thumb}
          </motion.span>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex items-center gap-3 text-white">
            <button
              onClick={() => setPlaying((p) => !p)}
              className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <div className="flex-1">
              <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: playing ? "100%" : "32%" }}
                  transition={{
                    duration: playing ? 80 : 0,
                    ease: "linear",
                  }}
                  className="h-full bg-emerald-400"
                />
              </div>
              <p className="text-[11px] mt-1 opacity-80">
                {exercise.videoLabel}
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-500/90 text-white text-[10px] font-bold rounded-md flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          AO VIVO · DEMO
        </div>
      </div>

      <section className="rounded-3xl bg-kore-card border border-kore p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-kore">Log de séries</h2>
          <span className="text-xs text-muted">Carga (kg) · Repetições</span>
        </div>
        <div className="space-y-2">
          {exercise.sets.map((st, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 rounded-2xl border p-2 transition-colors ${
                st.done
                  ? "border-emerald-200 dark:border-emerald-700/50 bg-emerald-50/60 dark:bg-emerald-500/10"
                  : "border-kore bg-kore-bg/40"
              }`}
            >
              <span className="w-7 h-7 rounded-lg bg-kore-card border border-kore text-xs font-bold flex items-center justify-center text-kore">
                {i + 1}
              </span>
              <input
                value={st.load}
                onChange={(e) =>
                  updateSet(exercise.id, i, { load: e.target.value })
                }
                inputMode="decimal"
                className="flex-1 min-w-0 rounded-xl bg-kore-card border border-kore px-2.5 py-1.5 text-sm text-kore font-semibold tabular-nums focus:outline-none focus:ring-2 ring-kore-emerald"
                placeholder="kg"
              />
              <span className="text-muted text-xs">×</span>
              <input
                value={st.reps}
                onChange={(e) =>
                  updateSet(exercise.id, i, { reps: e.target.value })
                }
                inputMode="numeric"
                className="w-14 rounded-xl bg-kore-card border border-kore px-2.5 py-1.5 text-sm text-kore font-semibold tabular-nums focus:outline-none focus:ring-2 ring-kore-emerald"
                placeholder="reps"
              />
              <button
                onClick={() => updateSet(exercise.id, i, { done: !st.done })}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition active:scale-95 ${
                  st.done
                    ? "bg-kore-emerald text-white"
                    : "bg-kore-card border border-kore text-muted hover:text-kore-emerald"
                }`}
                aria-label="Concluir série"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {st.done && (
                    <motion.span
                      key="done"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 18,
                      }}
                    >
                      <Check size={16} strokeWidth={3} />
                    </motion.span>
                  )}
                </AnimatePresence>
                {!st.done && <Check size={16} strokeWidth={2.5} />}
              </button>
            </div>
          ))}
        </div>
      </section>

      <CircularTimer />
    </motion.div>
  );
}
