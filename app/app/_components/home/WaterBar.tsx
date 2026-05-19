"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Droplet, Minus, Plus, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useKore } from "../store";

interface ConfettiPiece {
  id: number;
  dx: number;
  dy: number;
  rot: number;
  color: string;
  size: number;
}

const buildConfetti = (seed: number): ConfettiPiece[] =>
  Array.from({ length: 14 }).map((_, i) => ({
    id: seed * 100 + i,
    dx: (Math.random() - 0.5) * 220,
    dy: -120 - Math.random() * 80,
    rot: (Math.random() - 0.5) * 360,
    color: ["#10b981", "#34d399", "#38bdf8", "#fbbf24", "#f472b6"][i % 5]!,
    size: 6 + Math.random() * 5,
  }));

const PRESETS = [100, 250, 500];

export function WaterBar() {
  const water = useKore((s) => s.waterMl);
  const goal = useKore((s) => s.waterGoalMl);
  const addWater = useKore((s) => s.addWater);

  const pct = Math.min(100, (water / goal) * 100);
  const isFull = water >= goal;

  const target = useMotionValue(pct);
  const spring = useSpring(target, { stiffness: 110, damping: 18, mass: 1.1 });
  const heightStyle = useTransform(spring, (v) => `${v}%`);

  useEffect(() => {
    target.set(pct);
  }, [pct, target]);

  const wasFullRef = useRef(false);
  const [confettiBurst, setConfettiBurst] = useState<ConfettiPiece[] | null>(
    null,
  );
  useEffect(() => {
    if (isFull && !wasFullRef.current) {
      setConfettiBurst(buildConfetti(Date.now()));
      const t = setTimeout(() => setConfettiBurst(null), 1300);
      wasFullRef.current = true;
      return () => clearTimeout(t);
    }
    if (!isFull) {
      wasFullRef.current = false;
    }
    return undefined;
  }, [isFull]);

  return (
    <section className="rounded-3xl bg-kore-card border border-kore p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted font-semibold">
            Hidratação
          </p>
          <h3 className="text-base font-semibold text-kore flex items-center gap-1.5">
            <Droplet size={16} className="text-sky-500 fill-sky-500" />
            Água do dia
          </h3>
        </div>
        <div className="text-right">
          <p className="text-xl font-extrabold text-kore tabular-nums">
            {(water / 1000).toFixed(2)}L
          </p>
          <p className="text-[11px] text-muted">
            de {(goal / 1000).toFixed(1)}L
          </p>
        </div>
      </div>

      <div className="flex gap-4 items-stretch">
        <div className="relative w-20 h-44 rounded-3xl bg-sky-50 dark:bg-sky-500/5 border border-sky-100 dark:border-sky-500/20 overflow-hidden">
          <motion.div
            style={{ height: heightStyle }}
            className="absolute bottom-0 left-0 right-0 liquid-wave-water"
          >
            <svg
              viewBox="0 0 120 12"
              preserveAspectRatio="none"
              className="absolute -top-[10px] left-0 right-0 w-full h-3 text-sky-400"
            >
              <motion.path
                fill="currentColor"
                d="M0 6 Q 15 0 30 6 T 60 6 T 90 6 T 120 6 V12 H0 Z"
                animate={{ x: [0, -30, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 2.2,
                  ease: "easeInOut",
                }}
              />
            </svg>
          </motion.div>

          <AnimatePresence>
            {isFull && (
              <motion.div
                key="glow"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="absolute inset-0 pointer-events-none rounded-3xl shadow-[0_0_40px_rgba(56,189,248,0.85)] ring-2 ring-sky-300"
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {confettiBurst && (
              <div className="absolute inset-0 pointer-events-none">
                {confettiBurst.map((p) => (
                  <motion.span
                    key={p.id}
                    initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                    animate={{
                      x: p.dx,
                      y: p.dy,
                      opacity: 0,
                      rotate: p.rot,
                    }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute left-1/2 top-1/3 rounded-sm"
                    style={{
                      width: p.size,
                      height: p.size,
                      background: p.color,
                    }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          <div className="absolute inset-x-0 top-2 text-center">
            <span className="text-[11px] font-bold text-sky-700 dark:text-sky-200 bg-white/70 dark:bg-slate-900/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
              {pct.toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-2 justify-between">
          <div className="grid grid-cols-3 gap-1.5">
            {PRESETS.map((ml) => (
              <button
                key={ml}
                onClick={() => addWater(ml)}
                className="rounded-xl bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 active:scale-[0.97] transition text-sky-700 dark:text-sky-200 font-semibold text-xs py-2"
              >
                +{ml}ml
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => addWater(-250)}
              className="flex-1 h-11 rounded-2xl bg-kore-bg border border-kore text-kore flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-[0.96]"
              aria-label="Remover água"
            >
              <Minus size={20} />
            </button>
            <button
              onClick={() => addWater(250)}
              className="flex-[1.4] h-11 rounded-2xl bg-kore-emerald text-white flex items-center justify-center gap-1.5 font-semibold hover:brightness-110 transition active:scale-[0.96] shadow-sm shadow-emerald-500/20"
              aria-label="Adicionar água"
            >
              <Plus size={20} strokeWidth={2.5} />
              <span className="text-sm">250 ml</span>
            </button>
          </div>

          {isFull && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1 text-xs font-semibold text-kore-emerald"
            >
              <Sparkles size={14} /> Meta batida! 🎉
            </motion.p>
          )}
        </div>
      </div>
    </section>
  );
}
