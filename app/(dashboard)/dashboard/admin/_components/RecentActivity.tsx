"use client";

import {
  CircleDollarSign,
  Cpu,
  Flag,
  ScaleIcon,
  UserPlus,
} from "lucide-react";
import { RECENT_ACTIVITY } from "./data";
import type { ActivityEntry } from "./types";

const ICONS: Record<ActivityEntry["kind"], typeof CircleDollarSign> = {
  stripe: CircleDollarSign,
  user: UserPlus,
  moderation: Flag,
  dispute: ScaleIcon,
  system: Cpu,
};

const TINTS: Record<ActivityEntry["kind"], string> = {
  stripe: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300",
  user: "bg-sky-500/12 text-sky-600 dark:text-sky-300",
  moderation: "bg-amber-500/12 text-amber-600 dark:text-amber-300",
  dispute: "bg-red-500/12 text-red-600 dark:text-red-300",
  system: "bg-violet-500/12 text-violet-600 dark:text-violet-300",
};

export function RecentActivity() {
  return (
    <section className="card p-5">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-extrabold text-lg text-kore-ink tracking-tight">
            Atividade recente
          </h2>
          <p className="text-xs text-kore-muted mt-0.5">
            Feed em tempo real · últimos eventos da plataforma
          </p>
        </div>
        <button
          type="button"
          className="text-xs font-bold text-kore-emerald-deep hover:underline"
        >
          Ver auditoria completa →
        </button>
      </header>

      <ol className="relative space-y-3">
        {RECENT_ACTIVITY.map((entry) => {
          const Icon = ICONS[entry.kind];
          return (
            <li key={entry.id} className="flex items-start gap-3">
              <div className="flex flex-col items-center self-stretch">
                <div
                  className={`w-8 h-8 rounded-xl grid place-items-center ${TINTS[entry.kind]}`}
                >
                  <Icon size={14} strokeWidth={2.4} />
                </div>
                <span className="flex-1 w-px bg-kore-border my-1" />
              </div>
              <div className="flex-1 pb-1 min-w-0">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-bold text-kore-ink truncate">
                    {entry.actor}
                  </p>
                  <span className="text-[11px] font-bold text-kore-muted tabular-nums whitespace-nowrap">
                    {entry.ts}
                  </span>
                </div>
                <p className="text-[12.5px] text-kore-subink leading-snug">
                  {entry.action}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
