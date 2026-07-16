"use client";

import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  MessageCircle,
  MoreHorizontal,
  Search,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { statusLabel } from "./data";
import { StudentDetailsSheet } from "./StudentDetailsSheet";
import { usePersonal, type StudentFilter } from "./store";
import type { Student } from "./types";

const FILTERS: { key: StudentFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "em-dia", label: "Em dia" },
  { key: "renovar", label: "Renovar" },
  { key: "atencao", label: "Atenção" },
];

export function StudentsTable({ students = [] }: { students?: Student[] }) {
  const filter = usePersonal((s) => s.studentFilter);
  const setFilter = usePersonal((s) => s.setStudentFilter);
  const query = usePersonal((s) => s.studentQuery);
  const setQuery = usePersonal((s) => s.setStudentQuery);

  const sourceData = students;

  const filtered = sourceData.filter((s) => {
    if (filter !== "all" && s.status !== filter) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      if (
        !s.name.toLowerCase().includes(q) &&
        !s.goal.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <section className="card overflow-hidden">
      <header className="px-5 pt-5 pb-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-base font-extrabold text-kore-ink tracking-tight">
            Alunos ativos
          </h2>
          <p className="text-xs text-kore-muted mt-0.5">
            {sourceData.length} no plano · {filtered.length} filtrados
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-kore-muted"
            />
            <input
              placeholder="Filtrar"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-kore-bg border border-kore-border text-xs font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:border-kore-emerald transition w-36"
            />
          </div>
          <div className="flex items-center bg-kore-bg rounded-lg p-0.5 border border-kore-border">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`relative px-2.5 py-1 text-[11px] font-bold rounded-md transition ${
                  filter === f.key
                    ? "text-kore-ink"
                    : "text-kore-muted hover:text-kore-ink"
                }`}
              >
                {filter === f.key && (
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-kore-card rounded-md shadow-kore-soft"
                  />
                )}
                <span className="relative">{f.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-kore-muted font-bold bg-kore-bg/60 border-y border-kore-border">
              <th className="text-left font-bold py-2.5 px-5">Aluno</th>
              <th className="text-left font-bold py-2.5 px-3">Plano</th>
              <th className="text-left font-bold py-2.5 px-3">
                Aderência (8 sem)
              </th>
              <th className="text-right font-bold py-2.5 px-3">Carga</th>
              <th className="text-left font-bold py-2.5 px-3">Último treino</th>
              <th className="text-left font-bold py-2.5 px-3">Status</th>
              <th className="text-right font-bold py-2.5 px-5 w-20" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <StudentRow key={s.id} student={s} />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-10 px-5 text-center text-sm text-kore-muted"
                >
                  Nenhum aluno corresponde ao filtro atual.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StudentRow({ student }: { student: Student }) {
  const [editOpen, setEditOpen] = useState(false);
  const positive = student.loadDeltaPct >= 0;
  const planExpiringSoon = student.planExpiresInDays <= 14;
  const sparkData = student.adherence8w.map((v, i) => ({ i, v }));
  const tone = sparklineTone(student);
  const status = student.status;

  return (
    <>
      <StudentDetailsSheet open={editOpen} onOpenChange={setEditOpen} student={student} />
      <tr 
        onClick={() => setEditOpen(true)}
        className="border-b border-kore-border last:border-b-0 cursor-pointer hover:bg-kore-bg/60 transition group"
      >
        <td className="py-3 px-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-kore-emerald-soft text-xl grid place-items-center flex-shrink-0">
            {student.avatar}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-kore-ink text-sm truncate flex items-center gap-1.5">
              {student.name}
              {student.unreadMessages ? (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-300">
                  <MessageCircle size={11} fill="currentColor" />
                  {student.unreadMessages}
                </span>
              ) : null}
            </p>
            <p className="text-[11px] text-kore-muted truncate">
              {student.goal}
            </p>
          </div>
        </div>
      </td>
      <td className="py-3 px-3">
        <p className="text-xs font-semibold text-kore-ink">{student.plan}</p>
        <p
          className={`text-[11px] font-medium ${
            planExpiringSoon
              ? "text-amber-600 dark:text-amber-300"
              : "text-kore-muted"
          }`}
        >
          vence em {student.planExpiresInDays}d
        </p>
      </td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-3">
          <div className="w-28">
            <Sparkline data={sparkData} tone={tone} />
          </div>
          <p
            className={`text-sm font-bold tabular-nums ${
              tone === "rose"
                ? "text-rose-600 dark:text-rose-300"
                : "text-kore-ink"
            }`}
          >
            {student.adherenceCurrent}%
          </p>
        </div>
      </td>
      <td className="py-3 px-3 text-right">
        <p
          className={`inline-flex items-center gap-0.5 text-xs font-bold tabular-nums ${
            positive
              ? "text-emerald-600 dark:text-emerald-300"
              : "text-rose-600 dark:text-rose-300"
          }`}
        >
          {positive ? (
            <ArrowUpRight size={12} strokeWidth={2.8} />
          ) : (
            <ArrowDownRight size={12} strokeWidth={2.8} />
          )}
          {positive ? "+" : ""}
          {student.loadDeltaPct.toFixed(1)}%
        </p>
      </td>
      <td className="py-3 px-3 text-xs text-kore-subink whitespace-nowrap">
        {student.lastWorkout}
      </td>
      <td className="py-3 px-3">
        <StatusChip status={status} />
      </td>
      <td className="py-3 px-5 text-right">
        <div className="inline-flex items-center gap-1.5 text-kore-muted">
          <button
            type="button"
            aria-label="Mais ações"
            className="w-7 h-7 grid place-items-center rounded-lg hover:bg-kore-bg hover:text-kore-ink transition"
            onClick={(e) => {
              e.stopPropagation();
              setEditOpen(true);
            }}
          >
            <MoreHorizontal size={15} />
          </button>
          <ChevronRight
            size={15}
            className="opacity-0 group-hover:opacity-100 transition"
          />
        </div>
      </td>
    </tr>
    </>
  );
}

function sparklineTone(student: Student): "emerald" | "rose" {
  const arr = student.adherence8w;
  const first = arr[0] ?? 0;
  const last = arr[arr.length - 1] ?? 0;
  if (last < first) return "rose";
  if (student.adherenceCurrent < 70) return "rose";
  return "emerald";
}

function Sparkline({
  data,
  tone,
}: {
  data: { i: number; v: number }[];
  tone: "emerald" | "rose";
}) {
  const stroke =
    tone === "rose" ? "rgb(244 63 94)" : "rgb(var(--kore-emerald))";
  const fillBase = tone === "rose" ? "244 63 94" : "16 185 129";
  const gradientId = `spark-${tone}`;
  return (
    <div style={{ height: 36, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={`rgb(${fillBase} / 0.35)`} />
              <stop offset="100%" stopColor={`rgb(${fillBase} / 0)`} />
            </linearGradient>
          </defs>
          <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
          <Area
            type="monotone"
            dataKey="v"
            stroke={stroke}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatusChip({ status }: { status: Student["status"] }) {
  const styles: Record<Student["status"], string> = {
    "em-dia":
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300 ring-1 ring-inset ring-emerald-200/70 dark:ring-emerald-500/30",
    renovar:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/12 dark:text-amber-300 ring-1 ring-inset ring-amber-200/70 dark:ring-amber-500/30",
    atencao:
      "bg-rose-50 text-rose-700 dark:bg-rose-500/12 dark:text-rose-300 ring-1 ring-inset ring-rose-200/70 dark:ring-rose-500/30",
    aguardando:
      "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300 ring-1 ring-inset ring-slate-200/70 dark:ring-white/20",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}
    >
      {statusLabel(status)}
    </span>
  );
}
