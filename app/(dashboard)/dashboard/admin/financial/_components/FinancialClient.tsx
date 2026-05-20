"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  CreditCard,
  Download,
  Search,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { MobileSidebar, Sidebar } from "../../_components/Sidebar";
import { Topbar } from "../../_components/Topbar";
import type { DailyRevenue, TransactionRow } from "../page";

/* ── Status helpers ──────────────────────────────────────────── */
const STATUS_LABEL: Record<string, string> = {
  completed: "Concluído",
  refunded: "Estornado",
  processing: "Processando",
};

const STATUS_STYLES: Record<string, { dot: string; badge: string }> = {
  completed: {
    dot: "bg-emerald-500",
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  refunded: {
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
  processing: {
    dot: "bg-amber-500",
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
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

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ── Simple Bar Chart ────────────────────────────────────────── */
function RevenueChart({ data }: { data: DailyRevenue[] }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-kore-ink">
          Faturamento — Últimos 7 dias
        </h3>
        <span className="text-xs text-kore-muted font-medium">
          Total:{" "}
          {formatCurrency(data.reduce((s, d) => s + d.revenue, 0))}
        </span>
      </div>

      <div className="flex items-end gap-2 h-40">
        {data.map((d, i) => {
          const pct = (d.revenue / max) * 100;
          return (
            <div
              key={d.day}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <span className="text-[10px] font-mono font-bold text-kore-muted">
                {formatCurrency(d.revenue)}
              </span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${pct}%` }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.08,
                  ease: "easeOut",
                }}
                className="w-full rounded-t-lg bg-gradient-to-t from-kore-emerald to-emerald-400 dark:from-emerald-700 dark:to-emerald-500 min-h-[4px]"
              />
              <span className="text-[10px] font-medium text-kore-muted">
                {d.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Component ───────────────────────────────────────────────── */
export function FinancialClient({
  transactions,
  dailyRevenue,
}: {
  transactions: TransactionRow[];
  dailyRevenue: DailyRevenue[];
}) {
  const [search, setSearch] = useState("");

  /* ── Metric calculations ───────────────────────────────────── */
  const totalGross = transactions.reduce((s, t) => s + t.gross_amount, 0);
  const totalFee = transactions.reduce((s, t) => s + t.platform_fee, 0);
  const totalNet = transactions.reduce((s, t) => s + t.net_amount, 0);

  const metrics = [
    {
      label: "Receita Bruta",
      value: formatCurrency(totalGross),
      icon: CreditCard,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Lucro da Plataforma",
      value: formatCurrency(totalFee),
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      label: "A Repassar",
      value: formatCurrency(totalNet),
      icon: Wallet,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
  ];

  /* ── Filtered list ─────────────────────────────────────────── */
  const filtered = useMemo(() => {
    if (!search.trim()) return transactions;
    const q = search.toLowerCase();
    return transactions.filter(
      (t) =>
        t.recipient.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q),
    );
  }, [transactions, search]);

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
                Controle Financeiro e Repasses
              </h1>
              <p className="text-sm text-kore-muted mt-1">
                Visão geral das transações e split de pagamentos
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-kore-emerald text-white text-sm font-bold hover:brightness-110 transition self-start sm:self-auto"
            >
              <Download size={16} />
              Exportar Relatório
            </button>
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
                      {m.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Chart ──────────────────────────────────────────── */}
          <RevenueChart data={dailyRevenue} />

          {/* ── Search ─────────────────────────────────────────── */}
          <div className="relative max-w-md">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted"
            />
            <input
              type="text"
              placeholder="Buscar por ID ou destinatário…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-kore-card border border-kore-border text-sm text-kore-ink placeholder:text-kore-muted focus:outline-none focus:border-kore-emerald/60 focus:ring-2 focus:ring-kore-emerald/15 transition"
            />
          </div>

          {/* ── Transactions Header ────────────────────────────── */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Transações Recentes</h2>
            <span className="text-xs text-kore-muted font-medium">
              {filtered.length} transaç{filtered.length !== 1 && "ões"}
              {filtered.length === 1 && "ão"}
            </span>
          </div>

          {/* ── Desktop Table ──────────────────────────────────── */}
          <div className="hidden md:block rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-kore-border bg-kore-bg/50">
                    {[
                      "ID",
                      "Data",
                      "Valor Total",
                      "Taxa Plataforma",
                      "Valor Repassado",
                      "Destinatário",
                      "Status",
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
                        colSpan={7}
                        className="text-center py-12 text-kore-muted text-sm"
                      >
                        Nenhuma transação encontrada.
                      </td>
                    </tr>
                  )}
                  {filtered.map((t) => {
                    const st =
                      (STATUS_STYLES[t.status] ?? STATUS_STYLES.completed)!;
                    return (
                      <tr
                        key={t.id}
                        className="border-b border-kore-border/50 last:border-0 hover:bg-kore-bg/40 transition-colors"
                      >
                        {/* ID */}
                        <td className="px-5 py-3.5 font-mono text-kore-subink font-bold text-xs">
                          {t.id}
                        </td>

                        {/* Data */}
                        <td className="px-5 py-3.5 text-kore-subink whitespace-nowrap">
                          <div className="flex flex-col">
                            <span>{formatDate(t.date)}</span>
                            <span className="text-[11px] text-kore-muted">
                              {formatTime(t.date)}
                            </span>
                          </div>
                        </td>

                        {/* Valor Total */}
                        <td className="px-5 py-3.5 font-mono font-semibold text-kore-ink">
                          {formatCurrency(t.gross_amount)}
                        </td>

                        {/* Taxa Plataforma */}
                        <td className="px-5 py-3.5 font-mono text-kore-subink">
                          <span className="text-emerald-600 font-semibold">
                            {formatCurrency(t.platform_fee)}
                          </span>
                        </td>

                        {/* Valor Repassado */}
                        <td className="px-5 py-3.5 font-mono font-semibold text-kore-ink">
                          <div className="flex items-center gap-1">
                            <ArrowUpRight
                              size={13}
                              className="text-emerald-500"
                            />
                            {formatCurrency(t.net_amount)}
                          </div>
                        </td>

                        {/* Destinatário */}
                        <td className="px-5 py-3.5 font-medium text-kore-ink">
                          {t.recipient}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${st.badge}`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${st.dot}`}
                            />
                            {STATUS_LABEL[t.status] ?? t.status}
                          </span>
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
                Nenhuma transação encontrada.
              </p>
            )}
            {filtered.map((t) => {
              const st =
                (STATUS_STYLES[t.status] ?? STATUS_STYLES.completed)!;
              return (
                <div
                  key={t.id}
                  className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-4 space-y-3"
                >
                  {/* Header: ID + status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-kore-subink">
                      {t.id}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold ${st.badge}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${st.dot}`}
                      />
                      {STATUS_LABEL[t.status] ?? t.status}
                    </span>
                  </div>

                  {/* Recipient */}
                  <p className="text-sm font-bold text-kore-ink">
                    {t.recipient}
                  </p>

                  {/* Amounts */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-kore-muted font-medium mb-0.5">
                        Total
                      </p>
                      <p className="font-mono font-bold text-kore-ink">
                        {formatCurrency(t.gross_amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-kore-muted font-medium mb-0.5">
                        Taxa
                      </p>
                      <p className="font-mono font-bold text-emerald-600">
                        {formatCurrency(t.platform_fee)}
                      </p>
                    </div>
                    <div>
                      <p className="text-kore-muted font-medium mb-0.5">
                        Repasse
                      </p>
                      <p className="font-mono font-bold text-kore-ink">
                        {formatCurrency(t.net_amount)}
                      </p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-1 text-xs text-kore-muted">
                    <CalendarDays size={12} />
                    {formatDate(t.date)} às {formatTime(t.date)}
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