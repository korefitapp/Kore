"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const PRESETS = [45, 60, 90, 120];

export function CircularTimer() {
  const [duration, setDuration] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const [running, setRunning] = useState(false);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const startedAt = performance.now();
    const startedRemaining = remaining;
    const tick = () => {
      const elapsed = (performance.now() - startedAt) / 1000;
      const next = Math.max(0, startedRemaining - elapsed);
      setRemaining(next);
      if (next <= 0) {
        setRunning(false);
        return;
      }
      tickRef.current = requestAnimationFrame(tick);
    };
    tickRef.current = requestAnimationFrame(tick);
    return () => {
      if (tickRef.current) cancelAnimationFrame(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const reset = useCallback(
    (next?: number) => {
      const d = next ?? duration;
      setRunning(false);
      setDuration(d);
      setRemaining(d);
    },
    [duration],
  );

  const pct = duration > 0 ? remaining / duration : 0;
  const RADIUS = 44;
  const CIRC = 2 * Math.PI * RADIUS;
  const dashOffset = CIRC * (1 - pct);
  const finished = remaining <= 0;

  const min = Math.floor(remaining / 60);
  const sec = Math.floor(remaining % 60);

  return (
    <div className="rounded-3xl bg-kore-card border border-kore p-4 shadow-sm flex items-center gap-4">
      <div className="relative w-[110px] h-[110px] flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke="rgb(var(--kore-border))"
            strokeWidth="8"
          />
          <motion.circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke="rgb(var(--kore-emerald))"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.18, ease: "linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase font-bold text-muted tracking-wider">
            {finished ? "Pronto!" : running ? "Descanso" : "Pausa"}
          </span>
          <span className="text-2xl font-extrabold text-kore tabular-nums">
            {min}:{String(sec).padStart(2, "0")}
          </span>
        </div>
        <AnimatePresence>
          {finished && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, repeat: 2 }}
              className="absolute inset-0 rounded-full ring-4 ring-emerald-400/60"
            />
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => reset(p)}
              className={`flex-1 text-xs font-semibold py-1.5 rounded-xl border transition ${
                duration === p
                  ? "bg-kore-emerald text-white border-transparent"
                  : "bg-kore-bg border-kore text-kore hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {p}s
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (finished) reset();
              setRunning((r) => !r);
            }}
            className="flex-1 h-10 rounded-2xl bg-kore-emerald text-white font-semibold flex items-center justify-center gap-1.5 active:scale-[0.97] transition shadow-sm shadow-emerald-500/20"
          >
            {running ? <Pause size={16} /> : <Play size={16} />}
            {running ? "Pausar" : finished ? "Reiniciar" : "Iniciar"}
          </button>
          <button
            onClick={() => reset()}
            className="h-10 w-10 rounded-2xl bg-kore-bg border border-kore flex items-center justify-center text-kore active:scale-[0.96] transition"
            aria-label="Resetar"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
