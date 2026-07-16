"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { CalendarDays, Clock, User, FileText, Activity, Trash2 } from "lucide-react";
import { getStudents, createPersonalAppointment, updatePersonalAppointment, deletePersonalAppointment } from "@/app/actions/personal-actions";

interface NewAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: any | null;
}

export function NewAppointmentModal({ open, onOpenChange, appointment }: NewAppointmentModalProps) {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    clientId: "",
    date: "",
    time: "",
    duration: "60",
    type: "treino",
    notes: ""
  });

  useEffect(() => {
    if (open) {
      getStudents().then(res => {
        if (res.ok && res.data) {
          setStudents(res.data);
        }
      });
      
      if (appointment) {
        const d = new Date(appointment.start_time);
        const e = new Date(appointment.end_time || appointment.start_time);
        
        // Formata data considerando o fuso horário local
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        const durationStr = Math.round((e.getTime() - d.getTime())/60000).toString();

        let type = "treino";
        if (appointment.focus) {
          if (appointment.focus.toLowerCase().includes("consultoria")) type = "consultoria";
          if (appointment.focus.toLowerCase().includes("avalia")) type = "avaliacao";
        }

        setFormData({
          clientId: appointment.client_id || "",
          date: dateStr,
          time: timeStr,
          duration: durationStr || "60",
          type: type,
          notes: appointment.notes || ""
        });
      } else {
        setFormData({ clientId: "", date: "", time: "", duration: "60", type: "treino", notes: "" });
      }
    }
  }, [open, appointment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      let result;
      if (appointment) {
        result = await updatePersonalAppointment(appointment.id, formData);
      } else {
        result = await createPersonalAppointment(formData);
      }
      
      if (result.ok) {
        onOpenChange(false);
        router.refresh();
      } else {
        alert("Erro ao salvar agendamento: " + result.error);
      }
    });
  };

  const handleDelete = async () => {
    if (!appointment || !confirm("Tem certeza que deseja excluir este agendamento?")) return;
    startTransition(async () => {
      const result = await deletePersonalAppointment(appointment.id);
      if (result.ok) {
        onOpenChange(false);
        router.refresh();
      } else {
        alert("Erro ao excluir agendamento: " + result.error);
      }
    });
  };

  return (
    <Modal isOpen={open} onClose={() => onOpenChange(false)} title={appointment ? "Editar Agendamento" : "Novo Agendamento"} maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Aluno */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-kore-ink">Aluno</label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted" />
            <select
              required
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full bg-kore-bg border border-kore-border rounded-lg pl-9 pr-4 py-2.5 text-sm font-medium text-kore-ink focus:outline-none focus:border-kore-emerald appearance-none cursor-pointer"
            >
              <option value="" disabled>Selecione o aluno...</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Data */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-kore-ink">Data</label>
            <div className="relative">
              <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted pointer-events-none" />
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-kore-bg border border-kore-border rounded-lg pl-9 pr-4 py-2.5 text-sm font-medium text-kore-ink focus:outline-none focus:border-kore-emerald"
              />
            </div>
          </div>

          {/* Hora */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-kore-ink">Hora</label>
            <div className="relative">
              <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted pointer-events-none" />
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full bg-kore-bg border border-kore-border rounded-lg pl-9 pr-4 py-2.5 text-sm font-medium text-kore-ink focus:outline-none focus:border-kore-emerald"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Duração */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-kore-ink">Duração</label>
            <div className="relative">
              <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted pointer-events-none" />
              <select
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full bg-kore-bg border border-kore-border rounded-lg pl-9 pr-4 py-2.5 text-sm font-medium text-kore-ink focus:outline-none focus:border-kore-emerald appearance-none cursor-pointer"
              >
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">1 hora</option>
                <option value="90">1 hora e 30 min</option>
              </select>
            </div>
          </div>

          {/* Tipo */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-kore-ink">Tipo</label>
            <div className="relative">
              <Activity size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted pointer-events-none" />
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-kore-bg border border-kore-border rounded-lg pl-9 pr-4 py-2.5 text-sm font-medium text-kore-ink focus:outline-none focus:border-kore-emerald appearance-none cursor-pointer"
              >
                <option value="treino">Treino Presencial</option>
                <option value="consultoria">Consultoria Online</option>
                <option value="avaliacao">Avaliação Física</option>
              </select>
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-kore-ink">Observações</label>
          <div className="relative">
            <FileText size={16} className="absolute left-3 top-3 text-kore-muted pointer-events-none" />
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-kore-bg border border-kore-border rounded-lg pl-9 pr-4 py-2.5 text-sm font-medium text-kore-ink focus:outline-none focus:border-kore-emerald resize-none"
              placeholder="Notas ou observações (opcional)..."
            />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-kore-border/60">
          {appointment ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition disabled:opacity-50"
            >
              <Trash2 size={16} />
              Excluir
            </button>
          ) : <div></div>}
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-kore-subink hover:bg-kore-bg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-kore-emerald hover:brightness-110 transition shadow-kore-emerald disabled:opacity-50"
            >
              {isPending ? "Salvando..." : (appointment ? "Salvar Alterações" : "Agendar")}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
