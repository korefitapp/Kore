"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  FileText,
  Plus,
  Search,
  ShieldBan,
  TrendingUp,
  UserCheck,
  UserX,
  XCircle,
} from "lucide-react";
import { MobileSidebar, Sidebar } from "../../_components/Sidebar";
import { Topbar } from "../../_components/Topbar";
import type { ProfessionalRow } from "../page";

/* ── Tab / Filter types ──────────────────────────────────────── */
type StatusTab = "all" | "active" | "pending" | "paused";

const TABS: { key: StatusTab; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "active", label: "Ativos" },
  { key: "pending", label: "Pendentes" },
  { key: "paused", label: "Suspensos" },
];

/* ── Role helpers ────────────────────────────────────────────── */
const ROLE_LABEL: Record<string, string> = {
  trainer: "Personal Trainer",
  nutritionist: "Nutricionista",
  merchant: "Lojista",
};

const ROLE_EMOJI: Record<string, string> = {
  trainer: "🏋️",
  nutritionist: "🥗",
  merchant: "🛒",
};

const ROLE_COLOR: Record<string, string> = {
  trainer:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  nutritionist:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  merchant:
    "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
};

/* ── Status helpers ──────────────────────────────────────────── */
const STATUS_LABEL: Record<string, string> = {
  active: "Ativo",
  pending: "Pendente",
  paused: "Suspenso",
  churned: "Inativo",
};

const STATUS_STYLES: Record<string, { dot: string; badge: string }> = {
  active: {
    dot: "bg-emerald-500",
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  pending: {
    dot: "bg-amber-500",
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
  paused: {
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
  churned: {
    dot: "bg-slate-400",
    badge:
      "bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-300",
  },
};

function documentFor(p: ProfessionalRow): string {
  if (p.role === "trainer") return p.cref ?? "—";
  if (p.role === "nutritionist") return p.crn ?? "—";
  return p.cnpj ?? "—";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ── Component ───────────────────────────────────────────────── */
export function ProfessionalsClient({
  professionals,
}: {
  professionals: ProfessionalRow[];
}) {
  const [tab, setTab] = useState<StatusTab>("all");
  const [search, setSearch] = useState("");

  /* ── Metric calculations ───────────────────────────────────── */
  const totalActive = professionals.filter(
    (p) => p.status === "active",
  ).length;
  const totalPending = professionals.filter(
    (p) => p.status === "pending",
  ).length;
  const totalPaused = professionals.filter(
    (p) => p.status === "paused",
  ).length;

  const metrics = [
    {
      label: "Total Ativos",
      value: totalActive,
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      label: "Aguardando Aprovação",
      value: totalPending,
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      label: "Rejeitados / Suspensos",
      value: totalPaused,
      icon: UserX,
      color: "text-red-600",
      bg: "bg-red-50 dark:bg-red-900/20",
    },
  ];

  /* ── Filtered list ─────────────────────────────────────────── */
  const filtered = useMemo(() => {
    let list = professionals;

    /* Status tab filter */
    if (tab === "active") list = list.filter((p) => p.status === "active");
    else if (tab === "pending")
      list = list.filter((p) => p.status === "pending");
    else if (tab === "paused")
      list = list.filter((p) => p.status === "paused" || p.status === "churned");

    /* Search */
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.full_name.toLowerCase().includes(q) ||
          documentFor(p).toLowerCase().includes(q),
      );
    }

    return list;
  }, [professionals, tab, search]);

  return (
    <div className="min-h-screen flex bg-kore-bg text-kore-ink">
      <Sidebar />
      <MobileSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />

        <main className="flex-1 px-3 sm:px-6 py-6 space-y-6">
          {/* ── Header ─────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Profissionais e Lojistas
              </h1>
              <p className="text-sm text-kore-muted mt-1">
                {filtered.length} registro{filtered.length !== 1 && "s"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 sm:w-64">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted"
                />
                <input
                  type="text"
                  placeholder="Buscar nome ou documento…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-kore-card border border-kore-border text-sm text-kore-ink placeholder:text-kore-muted focus:outline-none focus:border-kore-emerald/60 focus:ring-2 focus:ring-kore-emerald/15 transition"
                />
              </div>

              {/* Add new button */}
              <button
                type="button"
                className="flex-shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-kore-emerald text-white text-sm font-bold hover:brightness-110 transition shadow-kore-emerald"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span className="hidden sm:inline">Adicionar Novo</span>
              </button>
            </div>
          </div>

          {/* ── Metric Cards ───────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {metrics.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.label}
                  className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5 flex items-center gap-4"
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${m.bg} grid place-items-center`}
                  >
                    <Icon size={22} className={m.color} />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider font-bold text-kore-muted">
                      {m.label}
                    </p>
                    <p className="text-2xl font-extrabold tracking-tight mt-0.5">
                      {m.value.toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Status Tabs ────────────────────────────────────── */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`relative flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  tab === t.key
                    ? "text-white"
                    : "text-kore-subink bg-kore-card border border-kore-border hover:border-kore-emerald/40 hover:text-kore-ink"
                }`}
              >
                {tab === t.key && (
                  <motion.span
                    layoutId="professionals-tab-pill"
                    className="absolute inset-0 rounded-xl bg-kore-emerald"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{t.label}</span>
              </button>
            ))}
          </div>

          {/* ── Desktop Table ──────────────────────────────────── */}
          <div className="hidden md:block rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-kore-border bg-kore-bg/50">
                    {[
                      "Nome",
                      "Especialidade / Tipo",
                      "Documento",
                      "Status",
                      "Data de Cadastro",
                      "Ações",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left font-bold text-kore-muted uppercase tracking-wider text-[11px] px-5 py-3.5"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-12 text-kore-muted text-sm"
                      >
                        Nenhum profissional encontrado.
                      </td>
                    </tr>
                  )}
                  {filtered.map((p) => {
                    const st =
                      (STATUS_STYLES[p.status] ?? STATUS_STYLES.active)!;
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-kore-border/50 last:border-0 hover:bg-kore-bg/40 transition-colors"
                      >
                        {/* Nome */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {p.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={p.avatar_url}
                                alt={p.full_name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-kore-emerald/15 text-kore-emerald-deep grid place-items-center text-xs font-bold">
                                {p.full_name
                                  .split(" ")
                                  .map((w) => w[0])
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase()}
                              </div>
                            )}
                            <span className="font-semibold text-kore-ink">
                              {p.full_name}
                            </span>
                          </div>
                        </td>

                        {/* Especialidade */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                              ROLE_COLOR[p.role] ?? ROLE_COLOR.trainer
                            }`}
                          >
                            {ROLE_EMOJI[p.role] ?? "👤"}{" "}
                            {ROLE_LABEL[p.role] ?? p.role}
                          </span>
                        </td>

                        {/* Documento */}
                        <td className="px-5 py-3.5 text-kore-subink font-mono text-xs">
                          <span className="inline-flex items-center gap-1.5">
                            <FileText size={13} className="text-kore-muted" />
                            {documentFor(p)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${st.badge}`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${st.dot}`}
                            />
                            {STATUS_LABEL[p.status] ?? p.status}
                          </span>
                        </td>

                        {/* Data */}
                        <td className="px-5 py-3.5 text-kore-subink whitespace-nowrap">
                          {formatDate(p.created_at)}
                        </td>

                        {/* Ações */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            {(p.status === "pending" || p.status === "paused") && (
                              <button
                                type="button"
                                title="Aprovar"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
                              >
                                <CheckCircle2 size={14} />
                                Aprovar
                              </button>
                            )}
                            {p.status === "active" && (
                              <button
                                type="button"
                                title="Suspender"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition"
                              >
                                <ShieldBan size={14} />
                                Suspender
                              </button>
                            )}
                            {p.status === "pending" && (
                              <button
                                type="button"
                                title="Rejeitar"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-300 text-red-600 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                              >
                                <XCircle size={14} />
                                Rejeitar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Mobile Cards ───────────────────────────────────── */}
          <div className="md:hidden space-y-3">
            {filtered.length === 0 && (
              <p className="text-center py-12 text-kore-muted text-sm">
                Nenhum profissional encontrado.
              </p>
            )}
            {filtered.map((p) => {
              const st = (STATUS_STYLES[p.status] ?? STATUS_STYLES.active)!;
              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-4 space-y-3"
                >
                  {/* Top row: avatar + name + status */}
                  <div className="flex items-center gap-3">
                    {p.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.avatar_url}
                        alt={p.full_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-kore-emerald/15 text-kore-emerald-deep grid place-items-center text-sm font-bold">
                        {p.full_name
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-kore-ink truncate">
                        {p.full_name}
                      </p>
                      <p className="text-xs text-kore-muted truncate flex items-center gap-1">
                        <FileText size={11} /> {documentFor(p)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-bold ${st.badge}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${st.dot}`}
                      />
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                  </div>

                  {/* Info row */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg font-bold ${
                        ROLE_COLOR[p.role] ?? ROLE_COLOR.trainer
                      }`}
                    >
                      {ROLE_EMOJI[p.role] ?? "👤"}{" "}
                      {ROLE_LABEL[p.role] ?? p.role}
                    </span>
                    <span className="inline-flex items-center gap-1 text-kore-muted ml-auto">
                      <CalendarDays size={12} />
                      {formatDate(p.created_at)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    {(p.status === "pending" || p.status === "paused") && (
                      <button
                        type="button"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
                      >
                        <CheckCircle2 size={14} />
                        Aprovar
                      </button>
                    )}
                    {p.status === "active" && (
                      <button
                        type="button"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition"
                      >
                        <ShieldBan size={14} />
                        Suspender
                      </button>
                    )}
                    {p.status === "pending" && (
                      <button
                        type="button"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-red-300 text-red-600 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      >
                        <XCircle size={14} />
                        Rejeitar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}