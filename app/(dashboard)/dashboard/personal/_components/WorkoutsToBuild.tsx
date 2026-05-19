"use client";

import { AlertTriangle, Plus } from "lucide-react";
import { WORKOUTS_TO_BUILD } from "./data";

export function WorkoutsToBuild() {
  return (
    <section className="card p-5">
      <header className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-300 grid place-items-center ring-1 ring-amber-200/70 dark:ring-amber-500/30">
          <AlertTriangle size={16} strokeWidth={2.4} />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-kore-ink tracking-tight">
            Treinos a montar
          </h2>
          <p className="text-[11px] text-kore-muted mt-0.5">
            {WORKOUTS_TO_BUILD.length} pendentes nesta semana
          </p>
        </div>
      </header>

      <ul className="space-y-2">
        {WORKOUTS_TO_BUILD.map((w) => (
          <li
            key={w.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-kore-bg/60 border border-kore-border hover:border-kore-emerald/40 transition"
          >
            <div className="w-9 h-9 rounded-xl bg-kore-emerald-soft text-lg grid place-items-center flex-shrink-0">
              {w.studentAvatar}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-kore-ink truncate">
                {w.studentName}
              </p>
              <p className="text-[11px] text-kore-muted truncate">{w.block}</p>
            </div>
            <DueChip days={w.dueInDays} />
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-kore-border text-sm font-bold text-kore-subink py-2.5 hover:border-kore-emerald hover:text-kore-emerald-deep transition"
      >
        <Plus size={15} strokeWidth={2.5} />
        Montar novo treino
      </button>
    </section>
  );
}

function DueChip({ days }: { days: number }) {
  const cls =
    days <= 1
      ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"
      : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
  return (
    <span
      className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${cls} whitespace-nowrap`}
    >
      {days}d
    </span>
  );
}
