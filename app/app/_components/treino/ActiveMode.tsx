"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Pause, Play } from "lucide-react";
import { useState, useEffect } from "react";
import { useKore } from "../store";
import { CircularTimer } from "./CircularTimer";
import { triggerHaptic, playSuccessSound } from "../feedback";

export function ActiveMode({ exerciseId }: { exerciseId: string }) {
  const exercise = useKore((s) =>
    s.exercises.find((e) => e.id === exerciseId),
  );
  const updateSet = useKore((s) => s.updateSet);
  const setActive = useKore((s) => s.setActive);
  const [playing, setPlaying] = useState(true);

  // Screen Wake Lock API
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await (navigator as any).wakeLock.request("screen");
        }
      } catch (err) {
        console.warn("Wake Lock error:", err);
      }
    };
    requestWakeLock();
    return () => {
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, []);

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
        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 rounded-full px-3 py-1.5">
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
                  className="h-full bg-purple-500"
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

      <CircularTimer defaultDuration={exercise.restTime || 60} />

      <section className="rounded-[24px] bg-kore-card p-5 shadow-sm border border-kore">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-kore text-lg">Log de Séries</h2>
          <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Carga · Reps</span>
        </div>
        <div className="space-y-2.5">
          {exercise.sets.map((st, i) => (
            <div
              key={i}
              className={`group flex items-center gap-3 rounded-2xl p-2.5 transition-all ${
                st.done
                  ? "bg-purple-50 dark:bg-purple-500/10 shadow-[inset_0_0_0_1px_rgba(168,85,247,0.2)]"
                  : "bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10"
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold ${
                st.done 
                  ? "bg-purple-200 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300"
                  : "bg-white dark:bg-white/10 text-slate-500 dark:text-zinc-400 shadow-sm"
              }`}>
                {i + 1}
              </div>
              
              <div className="flex-1 flex items-center gap-2">
                <input
                  value={st.load}
                  onChange={(e) => updateSet(exercise.id, i, { load: e.target.value })}
                  inputMode="decimal"
                  className={`w-full text-center text-base font-extrabold tabular-nums placeholder:text-slate-300 dark:placeholder:text-zinc-600 focus:outline-none focus:bg-white dark:focus:bg-black/20 focus:ring-2 ring-purple-500 rounded-lg py-1 transition-colors ${
                    st.done 
                      ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300" 
                      : "bg-slate-200/60 dark:bg-white/10 text-slate-700 dark:text-slate-200"
                  }`}
                  placeholder="-"
                />
                <span className="text-slate-300 dark:text-zinc-600 font-bold text-sm">×</span>
                <input
                  value={st.reps}
                  onChange={(e) => updateSet(exercise.id, i, { reps: e.target.value })}
                  inputMode="numeric"
                  className={`w-16 text-center text-base font-extrabold tabular-nums placeholder:text-slate-300 dark:placeholder:text-zinc-600 focus:outline-none focus:bg-white dark:focus:bg-black/20 focus:ring-2 ring-purple-500 rounded-lg py-1 transition-colors ${
                    st.done 
                      ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300" 
                      : "bg-slate-200/60 dark:bg-white/10 text-slate-700 dark:text-slate-200"
                  }`}
                  placeholder="-"
                />
              </div>

              <button
                onClick={() => {
                  const willBeDone = !st.done;
                  if (willBeDone) {
                    triggerHaptic();
                    playSuccessSound();
                  }
                  updateSet(exercise.id, i, { done: willBeDone });
                }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                  st.done
                    ? "bg-purple-500 text-white shadow-md shadow-purple-500/20"
                    : "bg-white dark:bg-white/10 text-slate-400 dark:text-zinc-500 hover:text-purple-500 shadow-sm"
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
                      transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    >
                      <Check size={18} strokeWidth={3} />
                    </motion.span>
                  )}
                </AnimatePresence>
                {!st.done && <Check size={18} strokeWidth={2.5} />}
              </button>
            </div>
          ))}
        </div>
      </section>

    </motion.div>
  );
}
