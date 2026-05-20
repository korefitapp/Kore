"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  PlayCircle,
  Plus,
  RotateCcw,
} from "lucide-react";
import { MobileSidebar, Sidebar } from "../../_components/Sidebar";
import { Topbar } from "../../_components/Topbar";

/* ── Types ──────────────────────────────────────────────────── */
interface Appointment {
  id: string;
  title: string | null;
  type: string | null;
  status: string | null;
  start_time: string;
  end_time: string | null;
  notes: string | null;
  client_id: string | null;
  client_name: string | null;
  client_avatar_url: string | null;
}

/* ── Constants ──────────────────────────────────────────────── */
const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00 – 20:00

const STATUS_BADGE: Record<string, { label: string; colors: string }> = {
  confirmada: {
    label: "Confirmada",
    colors:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300 ring-1 ring-inset ring-emerald-200/70 dark:ring-emerald-500/30",
  },
  pendente: {
    label: "Pendente",
    colors:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/12 dark:text-amber-300 ring-1 ring-inset ring-amber-200/70 dark:ring-amber-500/30",
  },
  cancelada: {
    label: "Cancelada",
    colors:
      "bg-slate-50 text-slate-500 dark:bg-slate-500/12 dark:text-slate-400 ring-1 ring-inset ring-slate-200/70 dark:ring-slate-500/30",
  },
};

const TYPE_BADGE: Record<string, { label: string; colors: string }> = {
  primeira: {
    label: "Primeira Consulta",
    colors:
      "bg-blue-50 text-blue-700 dark:bg-blue-500/12 dark:text-blue-300 ring-1 ring-inset ring-blue-200/70 dark:ring-blue-500/30",
  },
  retorno: {
    label: "Retorno",
    colors:
      "bg-violet-50 text-violet-700 dark:bg-violet-500/12 dark:text-violet-300 ring-1 ring-inset ring-violet-200/70 dark:ring-violet-500/30",
  },
  acompanhamento: {
    label: "Acompanhamento Mensal",
    colors:
      "bg-teal-50 text-teal-700 dark:bg-teal-500/12 dark:text-teal-300 ring-1 ring-inset ring-teal-200/70 dark:ring-teal-500/30",
  },
  avaliacao: {
    label: "Avaliação Nutricional",
    colors:
      "bg-orange-50 text-orange-700 dark:bg-orange-500/12 dark:text-orange-300 ring-1 ring-inset ring-orange-200/70 dark:ring-orange-500/30",
  },
};

const DEFAULT_TYPE_BADGE = {
  label: "Consulta",
  colors:
    "bg-slate-50 text-slate-600 dark:bg-slate-500/12 dark:text-slate-300 ring-1 ring-inset ring-slate-200/70 dark:ring-slate-500/30",
};

const DEFAULT_STATUS_BADGE = {
  label: "Pendente",
  colors:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/12 dark:text-amber-300 ring-1 ring-inset ring-amber-200/70 dark:ring-amber-500/30",
};

/* ── Mock Data ──────────────────────────────────────────────── */
function generateMockAppointments(): Appointment[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = today.getDay();

  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));

  const names = [
    "Ana Carolina Silva",
    "Bruno Costa Oliveira",
    "Camila Ferreira Santos",
    "Diego Almeida Lima",
    "Elena Rodrigues Pereira",
    "Felipe Souza Martins",
    "Gabriela Mendes Rocha",
    "Hugo Nascimento Barbosa",
    "Isabela Carvalho Dias",
    "João Pedro Araújo",
    "Karina Lopes Ribeiro",
    "Lucas Gomes Monteiro",
  ];

  const slots = [
    { day: 0, hour: 8, name: 0, type: "primeira", status: "confirmada" },
    { day: 0, hour: 9, name: 1, type: "retorno", status: "confirmada" },
    { day: 0, hour: 10, name: 2, type: "acompanhamento", status: "pendente" },
    { day: 0, hour: 14, name: 3, type: "avaliacao", status: "confirmada" },
    { day: 0, hour: 16, name: 4, type: "retorno", status: "confirmada" },
    { day: 1, hour: 8, name: 5, type: "primeira", status: "confirmada" },
    { day: 1, hour: 10, name: 6, type: "acompanhamento", status: "pendente" },
    { day: 1, hour: 14, name: 7, type: "retorno", status: "cancelada" },
    { day: 1, hour: 16, name: 8, type: "avaliacao", status: "confirmada" },
    { day: 2, hour: 9, name: 9, type: "primeira", status: "confirmada" },
    { day: 2, hour: 10, name: 10, type: "retorno", status: "confirmada" },
    { day: 2, hour: 14, name: 0, type: "acompanhamento", status: "pendente" },
    { day: 2, hour: 15, name: 11, type: "avaliacao", status: "confirmada" },
    { day: 3, hour: 8, name: 1, type: "retorno", status: "confirmada" },
    { day: 3, hour: 9, name: 2, type: "primeira", status: "pendente" },
    { day: 3, hour: 11, name: 3, type: "acompanhamento", status: "confirmada" },
    { day: 3, hour: 14, name: 4, type: "avaliacao", status: "cancelada" },
    { day: 3, hour: 16, name: 5, type: "retorno", status: "confirmada" },
    { day: 4, hour: 8, name: 6, type: "primeira", status: "confirmada" },
    { day: 4, hour: 10, name: 7, type: "acompanhamento", status: "confirmada" },
    { day: 4, hour: 14, name: 8, type: "retorno", status: "pendente" },
    { day: 4, hour: 15, name: 9, type: "avaliacao", status: "confirmada" },
    { day: 5, hour: 9, name: 10, type: "primeira", status: "confirmada" },
    { day: 5, hour: 10, name: 11, type: "retorno", status: "confirmada" },
    { day: 5, hour: 14, name: 0, type: "acompanhamento", status: "pendente" },
  ];

  return slots.map((s, i) => {
    const start = new Date(monday);
    start.setDate(monday.getDate() + s.day);
    start.setHours(s.hour, 0, 0, 0);
    const end = new Date(start);
    end.setMinutes(50);

    return {
      id: `mock-${i + 1}`,
      title: null,
      type: s.type,
      status: s.status,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      notes: null,
      client_id: `client-${s.name}`,
      client_name: names[s.name] ?? null,
      client_avatar_url: null,
    };
  });
}

/* ── Helpers ────────────────────────────────────────────────── */
function getWeekDates(base: Date): Date[] {
  const start = new Date(base);
  const day = start.getDay();
  start.setDate(start.getDate() - day + (day === 0 ? -6 : 1)); // monday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatHour(h: number): string {
  return `${String(h).padStart(2, "0")}:00`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  const first = parts[0] ?? "";
  const last = parts[parts.length - 1] ?? "";
  if (parts.length === 1) return first.charAt(0).toUpperCase();
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

/* ── Component ──────────────────────────────────────────────── */
export function AppointmentsPageClient({
  appointments: serverAppointments,
}: {
  appointments: Appointment[];
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const today = useMemo(() => new Date(), []);

  // Use mock if server returned nothing
  const appointments = useMemo(
    () =>
      serverAppointments.length > 0
        ? serverAppointments
        : generateMockAppointments(),
    [serverAppointments],
  );

  const baseDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [today, weekOffset]);

  const weekDates = useMemo(() => getWeekDates(baseDate), [baseDate]);
  const weekStart = weekDates[0] ?? today;
  const weekEnd = weekDates[6] ?? today;

  // Appointments do dia selecionado
  const dayAppointments = useMemo(
    () =>
      appointments
        .filter((a) => isSameDay(new Date(a.start_time), selectedDay))
        .sort(
          (a, b) =>
            new Date(a.start_time).getTime() -
            new Date(b.start_time).getTime(),
        ),
    [appointments, selectedDay],
  );

  // Mapear appointments por dia da semana (índice 0-6)
  const appointmentsByDay = useMemo(() => {
    const map: Record<number, Appointment[]> = {
      0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
    };
    appointments.forEach((a) => {
      const d = new Date(a.start_time);
      weekDates.forEach((wd, idx) => {
        if (isSameDay(d, wd) && map[idx]) {
          map[idx]!.push(a);
        }
      });
    });
    return map;
  }, [appointments, weekDates]);

  const getStatusBadge = (status: string | null) => {
    if (!status) return DEFAULT_STATUS_BADGE;
    return STATUS_BADGE[status.toLowerCase()] ?? DEFAULT_STATUS_BADGE;
  };

  const getTypeBadge = (type: string | null) => {
    if (!type) return DEFAULT_TYPE_BADGE;
    return TYPE_BADGE[type.toLowerCase()] ?? DEFAULT_TYPE_BADGE;
  };

  // Consultas de hoje (para sidebar)
  const todayAppointments = useMemo(
    () =>
      appointments
        .filter((a) => isSameDay(new Date(a.start_time), today))
        .sort(
          (a, b) =>
            new Date(a.start_time).getTime() -
            new Date(b.start_time).getTime(),
        ),
    [appointments, today],
  );

  return (
    <div className="min-h-screen flex bg-kore-bg text-kore-ink">
      <Sidebar />
      <MobileSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />

        <main className="flex-1 px-3 sm:px-6 py-6 space-y-6">
          {/* ── Header ───────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 grid place-items-center">
                <CalendarDays size={20} className="text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">
                  Gestão de Consultas
                </h1>
                <p className="text-sm text-kore-muted mt-0.5">
                  {appointments.length} consultas esta semana ·{" "}
                  {todayAppointments.length} hoje
                </p>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-kore-emerald hover:brightness-110 transition shadow-kore-emerald self-start sm:self-auto"
            >
              <Plus size={16} strokeWidth={2.5} />
              Agendar Nova Consulta
            </button>
          </div>

          {/* ── Week Navigator ───────────────────────────────── */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setWeekOffset((o) => o - 1)}
              className="p-2 rounded-lg hover:bg-kore-card transition text-kore-muted hover:text-kore-ink"
            >
              <ChevronLeft size={18} />
            </button>
            <p className="text-sm font-bold text-kore-ink">
              {weekStart.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })}{" "}
              –{" "}
              {weekEnd.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
            <button
              type="button"
              onClick={() => setWeekOffset((o) => o + 1)}
              className="p-2 rounded-lg hover:bg-kore-card transition text-kore-muted hover:text-kore-ink"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* ── Two-column layout ────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            {/* ── Weekly Calendar ────────────────────────────── */}
            <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm overflow-hidden">
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-kore-border">
                {weekDates.map((d, idx) => {
                  const isToday = isSameDay(d, today);
                  const isSelected = isSameDay(d, selectedDay);
                  const dayAppts = appointmentsByDay[idx];
                  const count = dayAppts ? dayAppts.length : 0;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedDay(d)}
                      className={`flex flex-col items-center gap-1 py-3 px-1 sm:px-3 transition relative ${
                        isSelected
                          ? "bg-kore-emerald-soft"
                          : "hover:bg-kore-bg"
                      }`}
                    >
                      {isToday && (
                        <span
                          aria-hidden
                          className="absolute top-0 inset-x-0 h-[3px] bg-kore-emerald rounded-b-full"
                        />
                      )}
                      <span
                        className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                          isToday
                            ? "text-kore-emerald-deep"
                            : "text-kore-muted"
                        }`}
                      >
                        {DAY_LABELS[idx]}
                      </span>
                      <span
                        className={`text-base sm:text-lg font-extrabold ${
                          isToday
                            ? "text-kore-emerald-deep"
                            : "text-kore-ink"
                        }`}
                      >
                        {d.getDate()}
                      </span>
                      {count > 0 && (
                        <span className="flex gap-0.5">
                          {Array.from({ length: Math.min(count, 3) }).map(
                            (_, i) => (
                              <span
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-kore-emerald"
                              />
                            ),
                          )}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Time grid */}
              <div className="max-h-[520px] overflow-y-auto">
                {HOURS.map((hour) => {
                  const selectedDayIdx = weekDates.findIndex((d) =>
                    isSameDay(d, selectedDay),
                  );
                  const dayKey = selectedDayIdx >= 0 ? selectedDayIdx : 0;
                  const dayList = appointmentsByDay[dayKey];
                  const hourAppts = (dayList ?? []).filter((a) => {
                    return new Date(a.start_time).getHours() === hour;
                  });

                  return (
                    <div
                      key={hour}
                      className="grid grid-cols-[60px_1fr] border-b border-kore-border/50 min-h-[56px]"
                    >
                      <div className="flex items-start justify-end pr-3 pt-1">
                        <span className="text-[10px] font-bold text-kore-muted tabular-nums">
                          {formatHour(hour)}
                        </span>
                      </div>
                      <div className="border-l border-kore-border/50 px-2 py-1 space-y-1">
                        {hourAppts.map((appt) => {
                          const statusBadge = getStatusBadge(appt.status);
                          const typeBadge = getTypeBadge(appt.type);
                          return (
                            <div
                              key={appt.id}
                              className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-kore-emerald-soft/50 border border-kore-emerald/20 text-xs"
                            >
                              <span className="font-bold text-kore-ink truncate flex-1">
                                {appt.client_name ??
                                  appt.title ??
                                  "Consulta"}
                              </span>
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold ${typeBadge.colors}`}
                              >
                                {typeBadge.label}
                              </span>
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold ${statusBadge.colors}`}
                              >
                                {statusBadge.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Right Sidebar: Consultas de Hoje ────────────── */}
            <aside className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-4 space-y-4 self-start">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-kore-ink">
                  Consultas de Hoje
                </h2>
                <span className="text-xs font-bold text-kore-muted">
                  {todayAppointments.length} agenda
                  {todayAppointments.length !== 1 ? "s" : ""}
                </span>
              </div>

              {todayAppointments.length > 0 ? (
                <div className="space-y-3">
                  {todayAppointments.map((appt) => {
                    const statusBadge = getStatusBadge(appt.status);
                    const typeBadge = getTypeBadge(appt.type);
                    const isExpanded = expandedId === appt.id;
                    return (
                      <div
                        key={appt.id}
                        className="p-3 rounded-xl bg-kore-bg/80 border border-kore-border/50 hover:border-kore-emerald/30 transition"
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-kore-emerald/10 grid place-items-center overflow-hidden">
                            {appt.client_avatar_url ? (
                              <img
                                src={appt.client_avatar_url}
                                alt={appt.client_name ?? ""}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-bold text-kore-emerald-deep">
                                {getInitials(appt.client_name)}
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <p className="text-sm font-bold text-kore-ink truncate">
                              {appt.client_name ??
                                appt.title ??
                                "Paciente"}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-kore-muted">
                              <Clock size={11} />
                              <span className="font-semibold tabular-nums">
                                {formatTime(appt.start_time)}
                                {appt.end_time &&
                                  ` – ${formatTime(appt.end_time)}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${typeBadge.colors}`}
                              >
                                {typeBadge.label}
                              </span>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge.colors}`}
                              >
                                {statusBadge.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quick actions */}
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-kore-emerald hover:brightness-110 transition shadow-sm"
                          >
                            <PlayCircle size={12} />
                            Iniciar Atendimento
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-kore-subink bg-kore-card border border-kore-border hover:border-kore-emerald/30 hover:text-kore-ink transition"
                          >
                            <RotateCcw size={12} />
                            Reagendar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 grid place-items-center mb-3">
                    <CalendarDays
                      size={24}
                      className="text-emerald-400"
                    />
                  </div>
                  <p className="text-sm font-bold text-kore-ink">
                    Nenhuma consulta agendada para hoje
                  </p>
                  <p className="text-xs text-kore-muted mt-1">
                    Aproveite para planejar a semana ou atualizar planos
                    alimentares.
                  </p>
                </div>
              )}
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}