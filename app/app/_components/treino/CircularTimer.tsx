"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";


export function CircularTimer({ defaultDuration = 60 }: { defaultDuration?: number }) {
  const [duration, setDuration] = useState(defaultDuration);
  const [remaining, setRemaining] = useState(defaultDuration);
  const [running, setRunning] = useState(false);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    setDuration(defaultDuration);
    setRemaining(defaultDuration);
    setRunning(false);
  }, [defaultDuration]);

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

  const adjustTime = useCallback((delta: number) => {
    setRemaining((prev) => {
      const next = Math.max(0, prev + delta);
      setDuration(d => Math.max(d, next));
      return next;
    });
  }, []);

  const pct = duration > 0 ? remaining / duration : 0;
  const RADIUS = 44;
  const CIRC = 2 * Math.PI * RADIUS;
  const dashOffset = CIRC * (1 - pct);
  const finished = remaining <= 0;

  const min = Math.floor(remaining / 60);
  const sec = Math.floor(remaining % 60);

  return (
    <div className="rounded-[24px] bg-kore-card border border-kore p-3 shadow-sm flex flex-row items-center gap-4">
      <div className="relative w-[70px] h-[70px] flex-shrink-0">
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
            stroke="#a855f7"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.18, ease: "linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center mt-0.5">
          <span className="text-[8px] uppercase font-bold text-muted tracking-widest mb-0.5">
            {finished ? "Pronto" : running ? "Descan." : "Pausa"}
          </span>
          <span className="text-sm font-extrabold text-kore tabular-nums leading-none">
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
              className="absolute inset-0 rounded-full ring-4 ring-purple-400/60"
            />
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-2">
          <button
            onClick={() => reset(60)}
            className={`flex-1 text-xs font-semibold py-1.5 rounded-xl border transition ${
              duration === 60
                ? "bg-purple-500 text-white border-transparent"
                : "bg-kore-bg border-kore text-kore hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            60s
          </button>
          <button
            onClick={() => reset(120)}
            className={`flex-1 text-xs font-semibold py-1.5 rounded-xl border transition ${
              duration === 120
                ? "bg-purple-500 text-white border-transparent"
                : "bg-kore-bg border-kore text-kore hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            120s
          </button>
          <button
            onClick={() => adjustTime(-15)}
            className="flex-1 text-xs font-semibold py-1.5 rounded-xl border border-kore bg-kore-bg text-kore hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            -15s
          </button>
          <button
            onClick={() => adjustTime(15)}
            className="flex-1 text-xs font-semibold py-1.5 rounded-xl border border-kore bg-kore-bg text-kore hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            +15s
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (finished) reset();
              setRunning((r) => !r);
            }}
            className="flex-1 h-9 rounded-[14px] bg-purple-500 text-white text-sm font-bold flex items-center justify-center gap-1.5 active:scale-[0.97] transition shadow-sm shadow-purple-500/20"
          >
            {running ? <Pause size={16} /> : <Play size={16} />}
            {running ? "Pausar" : finished ? "Reiniciar" : "Iniciar"}
          </button>
          <button
            onClick={() => reset()}
            className="h-9 w-9 rounded-[14px] bg-kore-bg border border-kore flex items-center justify-center text-kore active:scale-[0.96] transition"
            aria-label="Resetar"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
