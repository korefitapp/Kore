"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Video,
  User,
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
const DAY_LABELS_FULL = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00 – 20:00

const TYPE_BADGE: Record<string, { label: string; colors: string }> = {
  treino: {
    label: "Treino Presencial",
    colors:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300 ring-1 ring-inset ring-emerald-200/70 dark:ring-emerald-500/30",
  },
  consultoria: {
    label: "Consultoria Online",
    colors:
      "bg-blue-50 text-blue-700 dark:bg-blue-500/12 dark:text-blue-300 ring-1 ring-inset ring-blue-200/70 dark:ring-blue-500/30",
  },
  avaliacao: {
    label: "Avaliação Física",
    colors:
      "bg-violet-50 text-violet-700 dark:bg-violet-500/12 dark:text-violet-300 ring-1 ring-inset ring-violet-200/70 dark:ring-violet-500/30",
  },
  online: {
    label: "Consultoria Online",
    colors:
      "bg-blue-50 text-blue-700 dark:bg-blue-500/12 dark:text-blue-300 ring-1 ring-inset ring-blue-200/70 dark:ring-blue-500/30",
  },
};

const DEFAULT_BADGE = {
  label: "Agendamento",
  colors:
    "bg-slate-50 text-slate-700 dark:bg-slate-500/12 dark:text-slate-300 ring-1 ring-inset ring-slate-200/70 dark:ring-slate-500/30",
};

/* ── Helpers ────────────────────────────────────────────────── */
function getWeekDates(base: Date): Date[] {
  const start = new Date(base);
  start.setDate(base.getDate() - base.getDay()); // domingo
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function ensureArray<T>(arr: T[] | undefined): T[] {
  return arr ?? [];
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

function formatDateShort(d: Date): string {
  return `${d.getDate()}/${d.getMonth() + 1}`;
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
export function AgendaClient({
  appointments,
}: {
  appointments: Appointment[];
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const today = useMemo(() => new Date(), []);

  const baseDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [today, weekOffset]);

  const weekDates = useMemo(() => getWeekDates(baseDate), [baseDate]);
  const weekStart = weekDates[0] ?? today;
  const weekEnd = weekDates[6] ?? today;
  const [selectedDay, setSelectedDay] = useState<Date>(today);

  // Appointments do dia selecionado
  const dayAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const d = new Date(a.start_time);
      return isSameDay(d, selectedDay);
    });
  }, [appointments, selectedDay]);

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

  const getTypeBadge = (type: string | null) => {
    if (!type) return DEFAULT_BADGE;
    return TYPE_BADGE[type.toLowerCase()] ?? DEFAULT_BADGE;
  };

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
                  Minha Agenda
                </h1>
                <p className="text-sm text-kore-muted mt-0.5">
                  {appointments.length} compromissos esta semana
                </p>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-kore-emerald hover:brightness-110 transition shadow-kore-emerald"
            >
              <Plus size={16} strokeWidth={2.5} />
              Novo Agendamento
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
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
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
                  const selectedDayIdx = weekDates.findIndex((d) => isSameDay(d, selectedDay));
                  const dayKey = selectedDayIdx >= 0 ? selectedDayIdx : 0;
                  const dayList = appointmentsByDay[dayKey];
                  const hourAppts = (dayList ?? []).filter((a) => {
                    const h = new Date(a.start_time).getHours();
                    return h === hour;
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
                          const badge = getTypeBadge(appt.type);
                          return (
                            <div
                              key={appt.id}
                              className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-kore-emerald-soft/50 border border-kore-emerald/20 text-xs"
                            >
                              <span className="font-bold text-kore-ink truncate flex-1">
                                {appt.client_name ??
                                  appt.title ??
                                  "Agendamento"}
                              </span>
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold ${badge.colors}`}
                              >
                                {badge.label}
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

            {/* ── Right Sidebar: Próximos Compromissos ───────── */}
            <aside className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-4 space-y-4 self-start">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-kore-ink">
                  Compromissos do Dia
                </h2>
                <span className="text-xs font-bold text-kore-muted">
                  {selectedDay.toLocaleDateString("pt-BR", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </div>

              {dayAppointments.length > 0 ? (
                <div className="space-y-3">
                  {dayAppointments
                    .sort(
                      (a, b) =>
                        new Date(a.start_time).getTime() -
                        new Date(b.start_time).getTime(),
                    )
                    .map((appt) => {
                      const badge = getTypeBadge(appt.type);
                      return (
                        <div
                          key={appt.id}
                          className="flex items-start gap-3 p-3 rounded-xl bg-kore-bg/80 border border-kore-border/50 hover:border-kore-emerald/30 transition"
                        >
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
                              {appt.client_name ?? appt.title ?? "Aluno"}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-kore-muted">
                              <Clock size={11} />
                              <span className="font-semibold tabular-nums">
                                {formatTime(appt.start_time)}
                                {appt.end_time &&
                                  ` – ${formatTime(appt.end_time)}`}
                              </span>
                            </div>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.colors}`}
                            >
                              {badge.label}
                            </span>
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
                    Sua agenda está livre para hoje!
                  </p>
                  <p className="text-xs text-kore-muted mt-1">
                    Aproveite para revisar treinos ou descansar.
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