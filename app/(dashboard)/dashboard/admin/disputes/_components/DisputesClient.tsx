"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  Search,
  ShieldAlert,
} from "lucide-react";
import { MobileSidebar, Sidebar } from "../../_components/Sidebar";
import { Topbar } from "../../_components/Topbar";
import type { DisputeRow } from "../page";

/* ── Filter tabs ─────────────────────────────────────────────── */
type StatusTab = "all" | "open" | "under_review" | "resolved";

const TABS: { key: StatusTab; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "open", label: "Abertas" },
  { key: "under_review", label: "Em Análise" },
  { key: "resolved", label: "Resolvidas" },
];

/* ── Status helpers ──────────────────────────────────────────── */
const STATUS_LABEL: Record<string, string> = {
  open: "Aberta",
  under_review: "Em Análise",
  resolved: "Resolvida",
};

const STATUS_STYLES: Record<string, { dot: string; badge: string }> = {
  open: {
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
  under_review: {
    dot: "bg-amber-500",
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
  resolved: {
    dot: "bg-emerald-500",
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
};

/* ── Reason helpers ──────────────────────────────────────────── */
const REASON_COLOR: Record<string, string> = {
  Estorno:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "Não comparecimento":
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  "Produto com defeito":
    "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ── Component ───────────────────────────────────────────────── */
export function DisputesClient({
  disputes,
}: {
  disputes: DisputeRow[];
}) {
  const [tab, setTab] = useState<StatusTab>("all");
  const [search, setSearch] = useState("");

  /* ── Metric calculations ───────────────────────────────────── */
  const openCount = disputes.filter((d) => d.status === "open").length;
  const reviewCount = disputes.filter(
    (d) => d.status === "under_review",
  ).length;
  const resolvedCount = disputes.filter(
    (d) => d.status === "resolved",
  ).length;

  const metrics = [
    {
      label: "Abertas",
      value: openCount,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50 dark:bg-red-900/20",
    },
    {
      label: "Em Análise",
      value: reviewCount,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      label: "Resolvidas",
      value: resolvedCount,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
  ];

  /* ── Filtered list ─────────────────────────────────────────── */
  const filtered = useMemo(() => {
    let list = disputes;

    /* Status tab filter */
    if (tab === "open") list = list.filter((d) => d.status === "open");
    else if (tab === "under_review")
      list = list.filter((d) => d.status === "under_review");
    else if (tab === "resolved")
      list = list.filter((d) => d.status === "resolved");

    /* Search */
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.buyer_name.toLowerCase().includes(q) ||
          d.seller_name.toLowerCase().includes(q) ||
          d.reason.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q),
      );
    }

    return list;
  }, [disputes, tab, search]);

  return (
    <div className="min-h-screen flex bg-kore-bg text-kore-ink">
      <Sidebar />
      <MobileSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />

        <main className="flex-1 px-3 sm:px-6 py-6 space-y-6">
          {/* ── Header ─────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight">
                Central de Disputas
              </h1>
              {openCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs font-bold">
                  <ShieldAlert size={13} />
                  {openCount} aberta{openCount !== 1 && "s"}
                </span>
              )}
            </div>

            <p className="text-sm text-kore-muted">
              {filtered.length} disputa{filtered.length !== 1 && "s"}
            </p>
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

          {/* ── Search ─────────────────────────────────────────── */}
          <div className="relative max-w-md">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted"
            />
            <input
              type="text"
              placeholder="Buscar por ID, cliente, profissional ou motivo…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-kore-card border border-kore-border text-sm text-kore-ink placeholder:text-kore-muted focus:outline-none focus:border-kore-emerald/60 focus:ring-2 focus:ring-kore-emerald/15 transition"
            />
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
                    layoutId="disputes-tab-pill"
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
                      "ID",
                      "Cliente",
                      "Profissional",
                      "Motivo",
                      "Valor",
                      "Status",
                      "Data",
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
                        colSpan={8}
                        className="text-center py-12 text-kore-muted text-sm"
                      >
                        Nenhuma disputa encontrada.
                      </td>
                    </tr>
                  )}
                  {filtered.map((d) => {
                    const st =
                      (STATUS_STYLES[d.status] ?? STATUS_STYLES.open)!;
                    return (
                      <tr
                        key={d.id}
                        className="border-b border-kore-border/50 last:border-0 hover:bg-kore-bg/40 transition-colors"
                      >
                        {/* ID */}
                        <td className="px-5 py-3.5 font-mono text-kore-subink font-bold text-xs">
                          {d.id}
                        </td>

                        {/* Cliente */}
                        <td className="px-5 py-3.5 font-medium text-kore-ink">
                          {d.buyer_name}
                        </td>

                        {/* Profissional */}
                        <td className="px-5 py-3.5 text-kore-ink">
                          {d.seller_name}
                        </td>

                        {/* Motivo */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${
                              REASON_COLOR[d.reason] ??
                              "bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-300"
                            }`}
                          >
                            {d.reason}
                          </span>
                        </td>

                        {/* Valor */}
                        <td className="px-5 py-3.5 font-mono font-semibold text-kore-ink">
                          {formatCurrency(d.amount)}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${st.badge}`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${st.dot}`}
                            />
                            {STATUS_LABEL[d.status] ?? d.status}
                          </span>
                        </td>

                        {/* Data */}
                        <td className="px-5 py-3.5 text-kore-subink whitespace-nowrap">
                          {formatDate(d.created_at)}
                        </td>

                        {/* Ações */}
                        <td className="px-5 py-3.5">
                          <button
                            type="button"
                            title="Analisar Caso"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-kore-card border border-kore-border text-xs font-bold text-kore-ink hover:border-kore-emerald/40 hover:text-kore-emerald-deep transition"
                          >
                            <Eye size={13} />
                            Analisar Caso
                          </button>
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
                Nenhuma disputa encontrada.
              </p>
            )}
            {filtered.map((d) => {
              const st = (STATUS_STYLES[d.status] ?? STATUS_STYLES.open)!;
              return (
                <div
                  key={d.id}
                  className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-4 space-y-3"
                >
                  {/* Header: ID + status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-kore-subink">
                      {d.id}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold ${st.badge}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${st.dot}`}
                      />
                      {STATUS_LABEL[d.status] ?? d.status}
                    </span>
                  </div>

                  {/* Buyer → Seller */}
                  <div>
                    <p className="text-sm font-bold text-kore-ink">
                      {d.buyer_name}
                    </p>
                    <p className="text-xs text-kore-muted">
                      contra {d.seller_name}
                    </p>
                  </div>

                  {/* Info row */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg font-bold ${
                        REASON_COLOR[d.reason] ??
                        "bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-300"
                      }`}
                    >
                      {d.reason}
                    </span>
                    <span className="font-mono font-bold text-kore-ink">
                      {formatCurrency(d.amount)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-kore-muted ml-auto">
                      <CalendarDays size={12} />
                      {formatDate(d.created_at)}
                    </span>
                  </div>

                  {/* Action */}
                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-xs font-bold text-kore-ink hover:border-kore-emerald/40 transition"
                  >
                    <Eye size={14} />
                    Analisar Caso
                  </button>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}