"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, RotateCw, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { AppointmentModal } from "./AppointmentModal";
import type { ConsultModality, Consultation } from "./types";

const MODALITY_STYLES: Record<
  ConsultModality,
  { icon: any; label: string; text: string }
> = {
  presencial: {
    icon: MapPin,
    label: "Presencial",
    text: "text-kore-muted",
  },
  online: {
    icon: Video,
    label: "Online",
    text: "text-blue-500",
  },
  retorno: {
    icon: RotateCw,
    label: "Retorno",
    text: "text-amber-500",
  },
};

export function AppointmentRow({ consultation: cons }: { consultation: any }) {
  const mod = MODALITY_STYLES[cons.modality as ConsultModality] || MODALITY_STYLES.presencial;
  const ModIcon = mod.icon;
  const start = new Date(cons.start_time);
  const end = new Date(cons.end_time);
  const duration = Math.round((end.getTime() - start.getTime()) / 60000);
  const formattedTime = start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  
  const pName = cons.client?.full_name || "Paciente sem nome";
  const pAvatar = cons.client?.avatar_url || "👤";

  return (
    <div className="px-5 py-3 flex items-center gap-3 hover:bg-kore-bg/60 transition cursor-pointer">
      <div className="w-14 flex flex-col flex-shrink-0">
        <span className="text-sm font-extrabold text-kore-ink tabular-nums">{formattedTime}</span>
        <span className="text-[10px] uppercase font-bold text-kore-muted tracking-wide mt-0.5">{duration} min</span>
      </div>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg bg-kore-emerald-soft flex-shrink-0">
        {pAvatar}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-kore-ink text-sm truncate">{pName}</p>
        <p className="text-[11px] text-kore-muted truncate">{cons.title || cons.focus}</p>
      </div>
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${mod.text}`}>
        <ModIcon size={11} strokeWidth={2.5} />
        {mod.label}
      </span>
    </div>
  );
}

export function AgendaToday({ appointments = [] }: { appointments?: any[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Consultation | null>(null);

  return (
    <section className="card overflow-hidden">
      <header className="px-5 pt-5 pb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-kore-ink tracking-tight">
            Agenda de hoje
          </h2>
          <p className="text-xs text-kore-muted mt-0.5">
            {appointments.length} consultas
          </p>
        </div>
        <button
          type="button"
          className="text-xs font-bold text-kore-emerald hover:text-kore-emerald-deep transition"
        >
          Ver semana →
        </button>
      </header>
      <ul className="divide-y divide-kore-border bg-kore-card">
        {appointments.map((apt: any) => (
          <li key={apt.id}>
            <AppointmentRow consultation={apt} />
          </li>
        ))}
        {appointments.length === 0 && (
          <li className="py-6 px-4 text-center text-sm text-kore-muted">
            Nenhuma consulta agendada para hoje.
          </li>
        )}
      </ul>
      <AppointmentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        session={selectedSession}
      />
    </section>
  );
}
