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
  Video,
  MapPin
} from "lucide-react";
import { MobileSidebar, Sidebar } from "../../_components/Sidebar";
import { Topbar } from "../../_components/Topbar";
import { CreateAppointmentModal } from "./CreateAppointmentModal";

/* ── Types ──────────────────────────────────────────────────── */
interface Appointment {
  id: string;
  title: string | null;
  focus?: string | null;
  modality?: string | null;
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

function getStatusBadge(status: string | null) {
  if (!status) return DEFAULT_STATUS_BADGE;
  return STATUS_BADGE[status.toLowerCase()] ?? DEFAULT_STATUS_BADGE;
}

function getTypeBadge(focus: string | null) {
  if (!focus) return DEFAULT_TYPE_BADGE;
  const f = focus.toLowerCase();
  if (f.includes('primeira')) return TYPE_BADGE.primeira;
  if (f.includes('retorno')) return TYPE_BADGE.retorno;
  if (f.includes('acompanhamento')) return TYPE_BADGE.acompanhamento;
  if (f.includes('avalia')) return TYPE_BADGE.avaliacao;
  return { label: focus, colors: DEFAULT_TYPE_BADGE.colors };
}

function getModalityBadge(modality: string | null) {
  if (!modality) return null;
  const m = modality.toLowerCase();
  if (m.includes('online')) {
    return { label: "Online", icon: <Video size={10} className="mr-1" />, colors: "bg-blue-50 text-blue-700 dark:bg-blue-500/12 dark:text-blue-300 ring-1 ring-inset ring-blue-200/70 dark:ring-blue-500/30" };
  }
  return { label: "Presencial", icon: <MapPin size={10} className="mr-1" />, colors: "bg-slate-50 text-slate-700 dark:bg-slate-500/12 dark:text-slate-300 ring-1 ring-inset ring-slate-200/70 dark:ring-slate-500/30" };
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

export function AppointmentsPageClient({
  appointments,
  patients,
}: {
  appointments: Appointment[];
  patients: { id: string; name: string; avatar: string }[];
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const today = useMemo(() => new Date(), []);


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
              onClick={() => setIsModalOpen(true)}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-kore-emerald hover:brightness-110 transition shadow-kore-emerald self-start sm:self-auto"
            >
              <Plus size={16} strokeWidth={2.5} />
              Agendar Nova Consulta
            </button>
          </div>

          {/* ── Week Navigator ───────────────────────────────── */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold text-kore-ink tracking-tight capitalize">
              {weekStart.toLocaleDateString("pt-BR", { month: "long" })}{" "}
              <span className="text-kore-muted font-medium">
                {weekStart.getFullYear()}
              </span>
            </h2>

            <div className="flex items-center gap-1 sm:gap-2 bg-kore-card border border-kore-border/60 p-1 rounded-xl shadow-sm">
              <button
                type="button"
                onClick={() => setWeekOffset((o) => o - 1)}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-kore-bg text-kore-muted hover:text-kore-ink transition"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => setWeekOffset(0)}
                className="px-2 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-kore-ink hover:bg-kore-bg rounded-lg transition whitespace-nowrap"
              >
                {weekStart.getDate()} {weekStart.toLocaleDateString("pt-BR", { month: "short" })} 
                {" – "}
                {weekEnd.getDate()} {weekEnd.toLocaleDateString("pt-BR", { month: "short" })}
              </button>
              <button
                type="button"
                onClick={() => setWeekOffset((o) => o + 1)}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-kore-bg text-kore-muted hover:text-kore-ink transition"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* ── Two-column layout ────────────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">
            {/* ── Daily Calendar View ────────────────────────────── */}
            <div className="rounded-3xl border border-kore-border bg-kore-card shadow-sm overflow-hidden flex flex-col">
              
              {/* Day Tabs (Week Grid) */}
              <div className="grid grid-cols-7 border-b border-kore-border/60 bg-kore-bg/30">
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
                      className={`flex flex-col items-center justify-center gap-1 sm:gap-2 py-4 px-1 sm:px-2 transition relative group ${
                        isSelected ? "bg-kore-bg" : "hover:bg-kore-bg/50"
                      }`}
                    >
                      {isSelected && (
                        <span
                          aria-hidden
                          className="absolute top-0 inset-x-0 h-1 bg-kore-emerald"
                        />
                      )}
                      
                      <span
                        className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                          isSelected
                            ? "text-kore-emerald"
                            : isToday ? "text-kore-ink" : "text-kore-muted"
                        }`}
                      >
                        {DAY_LABELS[idx]}
                      </span>
                      
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-extrabold transition-all duration-300 ${
                        isSelected 
                          ? "bg-kore-emerald text-white shadow-md shadow-emerald-500/20 scale-110" 
                          : isToday 
                            ? "bg-kore-emerald/10 text-kore-emerald-deep"
                            : "text-kore-ink group-hover:bg-kore-border/30"
                      }`}>
                        {d.getDate()}
                      </div>

                      <div className="h-2 flex items-center justify-center gap-0.5 mt-1">
                        {count > 0 ? (
                          Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                            <span
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-kore-emerald" : "bg-kore-muted/50"}`}
                            />
                          ))
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Time grid (Daily Timeline) */}
              <div className="flex-1 overflow-y-auto max-h-[600px] p-2 sm:p-4 bg-kore-bg/20 relative">
                
                {/* Current Time Indicator (Only if selected day is today) */}
                {isSameDay(selectedDay, today) && (
                  <div 
                    className="absolute left-0 right-0 border-t-2 border-red-500/70 z-10 pointer-events-none flex items-center"
                    style={{ 
                      top: `${Math.max(0, ((today.getHours() - 7) * 80) + (today.getMinutes() / 60 * 80) + 16)}px` // 80px per hour + 16px padding
                    }}
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                  </div>
                )}

                <div className="space-y-0">
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
                        className="flex min-h-[80px] group relative"
                      >
                        {/* Hour Label */}
                        <div className="w-16 flex-shrink-0 flex items-start justify-end pr-4 pt-2 border-r border-kore-border/40">
                          <span className="text-[11px] font-bold text-kore-muted tabular-nums group-hover:text-kore-ink transition-colors">
                            {formatHour(hour)}
                          </span>
                        </div>
                        
                        {/* Grid Line */}
                        <div className="absolute left-16 right-0 top-0 border-t border-dashed border-kore-border/30 group-hover:border-kore-border/60 transition-colors z-0"></div>

                        {/* Appointments Area */}
                        <div className="flex-1 pl-4 pr-2 pt-2 pb-2 relative z-0 flex flex-col gap-2">
                          {hourAppts.map((appt) => {
                            const statusBadge = getStatusBadge(appt.status);
                            const typeBadge = getTypeBadge(appt.focus);
                            const modalityBadge = getModalityBadge(appt.modality);
                            
                            return (
                              <div
                                key={appt.id}
                                className="group/card relative flex flex-col gap-2 p-3 sm:p-4 rounded-2xl border border-kore-border/50 bg-white dark:bg-kore-bg shadow-sm hover:shadow-md hover:border-kore-emerald/30 transition-all cursor-pointer"
                              >
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl bg-kore-emerald"></div>
                                
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-kore-bg border border-kore-border overflow-hidden grid place-items-center flex-shrink-0">
                                      {appt.client_avatar_url ? (
                                        <img src={appt.client_avatar_url} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <span className="text-xs font-bold text-kore-ink">
                                          {getInitials(appt.client_name)}
                                        </span>
                                      )}
                                    </div>
                                    <div>
                                      <h3 className="font-bold text-sm text-kore-ink line-clamp-1">
                                        {appt.client_name ?? appt.title ?? "Consulta"}
                                      </h3>
                                      <div className="flex items-center gap-1.5 text-xs text-kore-muted mt-0.5">
                                        <Clock size={12} />
                                        <span className="font-medium tabular-nums">
                                          {formatTime(appt.start_time)}
                                          {appt.end_time && ` - ${formatTime(appt.end_time)}`}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide ${statusBadge.colors}`}>
                                      {statusBadge.label}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${typeBadge.colors}`}>
                                        {typeBadge.label}
                                      </span>
                                      {modalityBadge && (
                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${modalityBadge.colors}`}>
                                          {modalityBadge.icon}
                                          {modalityBadge.label}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Right Sidebar: Consultas de Hoje ────────────── */}
            <aside className="rounded-3xl border border-kore-border bg-kore-card p-5 sm:p-6 space-y-6 self-start shadow-sm">
              <div className="flex items-center justify-between border-b border-kore-border/50 pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-kore-ink">
                    Consultas de Hoje
                  </h2>
                  <p className="text-xs font-medium text-kore-muted mt-1">
                    {todayAppointments.length} agendamento{todayAppointments.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-kore-bg flex items-center justify-center text-kore-emerald">
                  <CalendarDays size={18} />
                </div>
              </div>

              {todayAppointments.length > 0 ? (
                <div className="space-y-3">
                  {todayAppointments.map((appt) => {
                    const statusBadge = getStatusBadge(appt.status);
                    const typeBadge = getTypeBadge(appt.focus);
                    const modalityBadge = getModalityBadge(appt.modality);
                    
                    return (
                      <div
                        key={appt.id}
                        className="p-4 rounded-2xl bg-kore-bg/50 border border-kore-border hover:border-kore-emerald/40 hover:shadow-md transition-all group/sidebar"
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-kore-emerald/10 grid place-items-center overflow-hidden border border-kore-emerald/20">
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
                            <div className="flex items-center gap-2 text-[11px] text-kore-muted pb-1">
                              <Clock size={11} />
                              <span className="font-semibold tabular-nums">
                                {formatTime(appt.start_time)}
                                {appt.end_time &&
                                  ` – ${formatTime(appt.end_time)}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase ${statusBadge.colors}`}
                              >
                                {statusBadge.label}
                              </span>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase ${typeBadge.colors}`}
                              >
                                {typeBadge.label}
                              </span>
                              {modalityBadge && (
                                <span
                                  className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase ${modalityBadge.colors}`}
                                >
                                  {modalityBadge.icon}
                                  {modalityBadge.label}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quick actions */}
                        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-kore-border/50">
                          <button
                            type="button"
                            className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold text-white bg-kore-emerald hover:bg-emerald-600 transition shadow-sm"
                          >
                            <PlayCircle size={14} />
                            Iniciar
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-kore-subink bg-kore-bg hover:bg-kore-card border border-kore-border hover:border-kore-border/80 transition"
                          >
                            <RotateCcw size={14} />
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

      <CreateAppointmentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        patients={patients}
      />
    </div>
  );
}