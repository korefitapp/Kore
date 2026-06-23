"use client";

import { useState, useTransition } from "react";
import { Calendar, Clock, Video, RotateCw, RefreshCw } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { createAppointment } from "@/app/actions/nutri-actions";

export function CreateAppointmentModal({
  open,
  onOpenChange,
  patients,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: { id: string; name: string; avatar: string }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("date", date);
    formData.set("time", time);
    formData.set("duration", duration);

    startTransition(async () => {
      try {
        await createAppointment(formData);
        alert("Consulta agendada com sucesso!");
        onOpenChange(false);
      } catch (err: any) {
        alert(err.message || "Falha ao agendar consulta.");
      }
    });
  };

  return (
    <Modal 
      isOpen={open} 
      onClose={() => onOpenChange(false)}
      title="Nova Consulta"
      description="Preencha os dados do agendamento"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Paciente */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-kore-ink">Paciente</label>
            <select
              name="patient_id"
              required
              className="w-full bg-kore-bg border border-kore-border rounded-xl px-4 py-2.5 text-sm font-medium text-kore-ink focus:outline-none focus:border-kore-emerald transition"
            >
              <option value="">Selecione um paciente...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {patients.length === 0 && (
              <p className="text-xs text-rose-500 mt-1 font-medium">
                Você não possui pacientes ativos. Vincule um paciente primeiro.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-kore-ink">Tipo / Foco</label>
              <select
                name="focus"
                required
                className="w-full bg-kore-bg border border-kore-border rounded-xl px-4 py-2.5 text-sm font-medium text-kore-ink focus:outline-none focus:border-kore-emerald transition"
              >
                <option value="Primeira Consulta">Primeira Consulta</option>
                <option value="Acompanhamento">Acompanhamento</option>
                <option value="Retorno">Retorno</option>
                <option value="Avaliação Física">Avaliação Física</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-kore-ink">Modalidade</label>
              <select
                name="modality"
                required
                className="w-full bg-kore-bg border border-kore-border rounded-xl px-4 py-2.5 text-sm font-medium text-kore-ink focus:outline-none focus:border-kore-emerald transition"
              >
                <option value="presencial">Presencial</option>
                <option value="online">Online</option>
                <option value="retorno">Retorno (Online)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5 col-span-1">
              <label className="text-sm font-bold text-kore-ink">Data</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-kore-bg border border-kore-border rounded-xl px-3 py-2.5 text-sm font-medium text-kore-ink focus:outline-none focus:border-kore-emerald transition"
              />
            </div>
            <div className="space-y-1.5 col-span-1">
              <label className="text-sm font-bold text-kore-ink">Horário</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-kore-bg border border-kore-border rounded-xl px-3 py-2.5 text-sm font-medium text-kore-ink focus:outline-none focus:border-kore-emerald transition"
              />
            </div>
            <div className="space-y-1.5 col-span-1">
              <label className="text-sm font-bold text-kore-ink">Duração</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-kore-bg border border-kore-border rounded-xl px-3 py-2.5 text-sm font-medium text-kore-ink focus:outline-none focus:border-kore-emerald transition"
              >
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">1h</option>
                <option value="90">1h 30m</option>
                <option value="120">2h</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-kore-ink hover:bg-kore-bg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || patients.length === 0}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-kore-emerald hover:brightness-110 transition disabled:opacity-50 flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Agendando...
                </>
              ) : (
                "Confirmar Agendamento"
              )}
            </button>
          </div>
        </form>
    </Modal>
  );
}
