"use client";

import { Modal } from "@/components/ui/modal";
import type { Consultation } from "./types";

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: Consultation | null;
}

export function AppointmentModal({
  open,
  onOpenChange,
  session,
}: AppointmentModalProps) {
  if (!session) return null;

  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Consulta"
      description={`${session.time} · ${session.durationMin}min`}
    >
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-kore-emerald-soft text-2xl grid place-items-center flex-shrink-0">
            {session.patientAvatar}
          </div>
          <div>
            <p className="font-extrabold text-kore-ink text-lg">
              {session.patientName}
            </p>
            <p className="text-sm text-kore-muted">{session.focus}</p>
          </div>
        </div>

        <div className="rounded-xl border border-kore-border p-4 space-y-3 bg-kore-card/50">
          <div className="flex justify-between items-center text-sm">
            <span className="text-kore-muted font-semibold">Modalidade:</span>
            <span className="text-kore-ink font-bold capitalize">
              {session.modality}
            </span>
          </div>
          {session.modality === "online" && (
            <div className="pt-3 border-t border-kore-border">
              <button
                type="button"
                onClick={() => alert("Abrindo link do Google Meet...")}
                className="w-full py-2.5 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold text-sm hover:brightness-105 transition"
              >
                Entrar na vídeo-chamada
              </button>
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-between items-center gap-4">
          <button
            type="button"
            onClick={() => {
              if (confirm("Tem certeza que deseja desmarcar esta consulta?")) {
                onOpenChange(false);
                alert("Consulta desmarcada.");
              }
            }}
            className="text-sm font-bold text-rose-500 hover:text-rose-600 transition"
          >
            Desmarcar
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-6 py-2 rounded-xl bg-kore-ink hover:bg-kore-subink text-kore-bg font-bold text-sm shadow-lg transition active:scale-95"
          >
            Ver prontuário
          </button>
        </div>
      </div>
    </Modal>
  );
}
