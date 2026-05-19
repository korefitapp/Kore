"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, Video } from "lucide-react";
import { AGENDA_TODAY } from "./data";
import type { AgendaModality, AgendaSession } from "./types";

const MODALITY_STYLES: Record<
  AgendaModality,
  { icon: typeof MapPin; label: string; text: string }
> = {
  presencial: {
    icon: MapPin,
    label: "Presencial",
    text: "text-emerald-600 dark:text-emerald-300",
  },
  online: {
    icon: Video,
    label: "Online",
    text: "text-sky-600 dark:text-sky-300",
  },
  consultoria: {
    icon: Clock,
    label: "Consultoria",
    text: "text-violet-600 dark:text-violet-300",
  },
};

export function AgendaToday() {
  const totalMinutes = AGENDA_TODAY.reduce((acc, s) => acc + s.durationMin, 0);
  return (
    <section className="card overflow-hidden">
      <header className="px-5 pt-5 pb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-kore-ink tracking-tight">
            Agenda de hoje
          </h2>
          <p className="text-xs text-kore-muted mt-0.5">
            {AGENDA_TODAY.length} sessões · {totalMinutes}min totais
          </p>
        </div>
        <button
          type="button"
          className="text-xs font-bold text-kore-emerald-deep hover:underline"
        >
          Ver semana →
        </button>
      </header>
      <ul className="divide-y divide-kore-border">
        {AGENDA_TODAY.map((s, i) => (
          <Row key={s.id} session={s} index={i} />
        ))}
      </ul>
    </section>
  );
}

function Row({ session, index }: { session: AgendaSession; index: number }) {
  const mod = MODALITY_STYLES[session.modality];
  const ModIcon = mod.icon;
  return (
    <motion.li
      initial={{ opacity: 0, x: 6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="px-5 py-3 flex items-center gap-3 hover:bg-kore-bg/60 transition cursor-pointer"
    >
      <div className="w-12 flex-shrink-0">
        <p className="text-base font-extrabold text-kore-ink tabular-nums leading-none">
          {session.time}
        </p>
        <p className="text-[10px] text-kore-muted font-bold mt-1">
          {session.durationMin}min
        </p>
      </div>
      <div className="w-9 h-9 rounded-xl bg-kore-emerald-soft text-lg grid place-items-center flex-shrink-0">
        {session.studentAvatar}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-kore-ink text-sm truncate">
          {session.studentName}
        </p>
        <p className="text-[11px] text-kore-muted truncate">{session.focus}</p>
      </div>
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-bold ${mod.text}`}
      >
        <ModIcon size={11} strokeWidth={2.5} />
        {mod.label}
      </span>
    </motion.li>
  );
}
