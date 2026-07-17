"use client";

import { useMemo, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  Search,
  Building2,
} from "lucide-react";
import { MobileSidebar, Sidebar } from "../../_components/Sidebar";
import { Topbar } from "../../_components/Topbar";
import type { Transaction, Payout } from "@/app/actions/financial-actions";

/* ── Types ──────────────────────────────────────────────────── */
export type PayoutStatus = "concluido" | "pendente" | "processando" | "falhou";

/* ── Helpers ────────────────────────────────────────────────── */
function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatShortId(id: string): string {
  return id.toUpperCase();
}

function getPayoutStatusConfig(status: PayoutStatus) {
  switch (status) {
    case "concluido":
      return {
        label: "Concluído",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        text: "text-emerald-700 dark:text-emerald-400",
        dot: "bg-emerald-500",
      };
    case "pendente":
      return {
        label: "Pendente",
        bg: "bg-amber-50 dark:bg-amber-900/20",
        text: "text-amber-700 dark:text-amber-400",
        dot: "bg-amber-500",
      };
    case "processando":
      return {
        label: "Processando",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        text: "text-blue-700 dark:text-blue-400",
        dot: "bg-blue-500",
      };
    case "falhou":
      return {
        label: "Falhou",
        bg: "bg-rose-50 dark:bg-rose-900/20",
        text: "text-rose-700 dark:text-rose-400",
        dot: "bg-rose-500",
      };
  }
}

/* ── Bar Chart Component ────────────────────────────────────── */
function BarChart({
  data,
  height = 220,
}: {
  data: { week: string; revenue: number }[];
  height?: number;
}) {
  const padding = { top: 20, right: 20, bottom: 44, left: 60 };
  const width = 600;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map((d) => d.revenue)) * 1.15;
  const barGroupWidth = chartWidth / data.length;
  const barWidth = Math.min(barGroupWidth * 0.55, 60);

  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    (i / yTicks) * maxVal,
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTickValues.map((val) => {
        const y =
          padding.top + (1 - val / maxVal) * chartHeight;
        return (
          <g key={val}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="currentColor"
              className="text-kore-border"
              strokeDasharray="4 4"
              strokeWidth="0.5"
            />
            <text
              x={padding.left - 8}
              y={y + 4}
              textAnchor="end"
              className="text-[10px] fill-kore-muted font-medium"
            >
              {(val / 1000).toFixed(1)}k
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const barHeight = (d.revenue / maxVal) * chartHeight;
        const x =
          padding.left + i * barGroupWidth + (barGroupWidth - barWidth) / 2;
        const y = padding.top + chartHeight - barHeight;
        return (
          <g key={d.week}>
            {/* Bar shadow */}
            <rect
              x={x + 2}
              y={y + 2}
              width={barWidth}
              height={barHeight}
              rx={6}
              fill="#10b981"
              opacity="0.1"
            />
            {/* Bar */}
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={6}
              fill="url(#barGrad)"
            />
            {/* Value label */}
            <text
              x={x + barWidth / 2}
              y={y - 8}
              textAnchor="middle"
              className="text-[10px] fill-kore-ink font-bold"
            >
              {(d.revenue / 1000).toFixed(1)}k
            </text>
            {/* X label */}
            <text
              x={x + barWidth / 2}
              y={padding.top + chartHeight + 24}
              textAnchor="middle"
              className="text-[11px] fill-kore-muted font-semibold"
            >
              {d.week}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Main Component ─────────────────────────────────────────── */
export function FinancialPageClient({
  initialTransactions,
  initialPayouts,
}: {
  initialTransactions: Transaction[];
  initialPayouts: Payout[];
}) {
  const payouts = initialPayouts;
  
  // Calculate dynamic weekly revenue from transactions for the last 4 weeks
  const weeklyRevenue = useMemo(() => {
    const now = new Date();
    const weeks = Array.from({ length: 4 }).map((_, i) => {
      const weekStart = new Date(now.getTime() - (3 - i) * 7 * 24 * 60 * 60 * 1000);
      return { week: `Sem ${i + 1}`, start: weekStart.getTime(), revenue: 0 };
    });

    initialTransactions.forEach(t => {
      if (t.type === 'income') {
        const tTime = new Date(t.created_at).getTime();
        const week = weeks.find(w => tTime >= w.start && tTime < w.start + 7 * 24 * 60 * 60 * 1000);
        if (week) week.revenue += Number(t.amount);
      }
    });

    return weeks.map(w => ({ week: w.week, revenue: w.revenue }));
  }, [initialTransactions]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PayoutStatus | "all">("all");

  // Calculate summary metrics
  const metrics = useMemo(() => {
    const grossRevenue = weeklyRevenue.reduce((acc, w) => acc + w.revenue, 0);
    const marketplaceFee = grossRevenue * 0.08; // 8% marketplace fee
    const gatewayFee = grossRevenue * 0.029; // 2.9% gateway fee
    const totalFees = marketplaceFee + gatewayFee;
    const netBalance = grossRevenue - totalFees;

    return {
      grossRevenue,
      marketplaceFee,
      gatewayFee,
      totalFees,
      netBalance,
    };
  }, [weeklyRevenue]);

  // Filter payouts
  const filteredPayouts = useMemo(() => {
    return payouts.filter((p) => {
      const matchesSearch =
        !searchQuery.trim() ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payouts, searchQuery, statusFilter]);

  return (
    <div className="min-h-screen flex bg-kore-bg text-kore-ink">
      <Sidebar />
      <MobileSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />

        <main className="flex-1 overflow-y-auto">
          <div className="px-3 sm:px-6 pt-6 pb-8 max-w-[1400px] mx-auto">
            {/* ── Header ───────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 grid place-items-center">
                  <DollarSign size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight">
                    Financeiro
                  </h1>
                  <p className="text-sm text-kore-muted mt-0.5">
                    Acompanhe receitas, taxas e repasses da sua loja
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-kore-card border border-kore-border text-sm font-semibold text-kore-subink hover:text-kore-ink hover:border-kore-border/80 transition shadow-sm"
              >
                <Download size={16} />
                Exportar Relatório
              </button>
            </div>

            {/* ── KPI Cards ────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {/* Receita Bruta */}
              <div className="relative overflow-hidden rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-kore-muted mb-1">
                      Receita Bruta
                    </p>
                    <p className="text-xs text-kore-muted mb-2">
                      Últimas 4 semanas
                    </p>
                    <p className="text-2xl font-extrabold tracking-tight text-kore-ink">
                      {formatBRL(metrics.grossRevenue)}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 grid place-items-center">
                    <TrendingUp size={20} className="text-emerald-600" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <ArrowUpRight size={14} className="text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-600">
                    +22%
                  </span>
                  <span className="text-xs text-kore-muted ml-1">
                    vs. 4 semanas anteriores
                  </span>
                </div>
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500/10 to-transparent" />
              </div>

              {/* Taxas (Marketplace/Gateway) */}
              <div className="relative overflow-hidden rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-kore-muted mb-1">
                      Taxas
                    </p>
                    <p className="text-xs text-kore-muted mb-2">
                      Marketplace + Gateway de Pagamento
                    </p>
                    <p className="text-2xl font-extrabold tracking-tight text-kore-ink">
                      {formatBRL(metrics.totalFees)}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 grid place-items-center">
                    <Receipt size={20} className="text-rose-600" />
                  </div>
                </div>
                <div className="flex flex-col gap-1 mt-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span className="text-xs text-kore-muted">
                      Marketplace (8%):{" "}
                      <span className="font-bold text-kore-subink">
                        {formatBRL(metrics.marketplaceFee)}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-300" />
                    <span className="text-xs text-kore-muted">
                      Gateway (2.9%):{" "}
                      <span className="font-bold text-kore-subink">
                        {formatBRL(metrics.gatewayFee)}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-rose-500/10 to-transparent" />
              </div>

              {/* Saldo Líquido Disponível */}
              <div className="relative overflow-hidden rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5 sm:col-span-2 lg:col-span-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-kore-muted mb-1">
                      Saldo Líquido Disponível
                    </p>
                    <p className="text-xs text-kore-muted mb-2">
                      Após todas as taxas
                    </p>
                    <p className="text-2xl font-extrabold tracking-tight text-kore-ink">
                      {formatBRL(metrics.netBalance)}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 grid place-items-center">
                    <Wallet size={20} className="text-emerald-600" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <ArrowUpRight size={14} className="text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-600">
                    Margem{" "}
                    {(
                      (metrics.netBalance / metrics.grossRevenue) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                  <span className="text-xs text-kore-muted ml-1">
                    de receita bruta
                  </span>
                </div>
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500/10 to-transparent" />
              </div>
            </div>

            {/* ── Bar Chart ────────────────────────────────────── */}
            <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-base font-extrabold text-kore-ink">
                    Receitas por Semana
                  </h2>
                  <p className="text-xs text-kore-muted mt-0.5">
                    Últimas 4 semanas — Receita bruta
                  </p>
                </div>
              </div>
              <BarChart data={weeklyRevenue} height={220} />
            </div>

            {/* ── Payouts Table ────────────────────────────────── */}
            <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm overflow-hidden">
              {/* Table Header / Filters */}
              <div className="p-5 border-b border-kore-border">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2 className="text-base font-extrabold text-kore-ink">
                    Últimos Repasses / Saques
                  </h2>
                  <div className="flex items-center gap-2">
                    {/* Search */}
                    <div className="relative flex-1 sm:flex-initial">
                      <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted"
                      />
                      <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-48 pl-9 pr-3 py-2 rounded-xl bg-kore-bg border border-kore-border text-xs font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:ring-2 focus:ring-kore-emerald/40 focus:border-kore-emerald transition"
                      />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                      <Filter
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted pointer-events-none"
                      />
                      <select
                        value={statusFilter}
                        onChange={(e) =>
                          setStatusFilter(
                            e.target.value as PayoutStatus | "all",
                          )
                        }
                        className="appearance-none pl-8 pr-8 py-2 rounded-xl bg-kore-bg border border-kore-border text-xs font-semibold text-kore-ink focus:outline-none focus:ring-2 focus:ring-kore-emerald/40 focus:border-kore-emerald transition cursor-pointer"
                      >
                        <option value="all">Todos</option>
                        <option value="concluido">Concluído</option>
                        <option value="processando">Processando</option>
                        <option value="pendente">Pendente</option>
                        <option value="falhou">Falhou</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table - Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-kore-border">
                      <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-kore-muted">
                        ID
                      </th>
                      <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-kore-muted">
                        Data
                      </th>
                      <th className="text-right px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-kore-muted">
                        Valor
                      </th>
                      <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-kore-muted">
                        Conta de Destino
                      </th>
                      <th className="text-center px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-kore-muted">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayouts.length > 0 ? (
                      filteredPayouts.map((p) => {
                        const statusConf = getPayoutStatusConfig(p.status);
                        return (
                          <tr
                            key={p.id}
                            className="border-b border-kore-border/50 last:border-0 hover:bg-kore-bg/50 transition"
                          >
                            <td className="px-5 py-3.5">
                              <span className="text-xs font-mono font-semibold text-kore-subink">
                                {formatShortId(p.id)}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-xs text-kore-muted font-medium">
                                {formatDate(p.created_at)}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <span className="text-sm font-bold tabular-nums text-kore-ink">
                                {formatBRL(p.amount)}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                <Building2
                                  size={14}
                                  className="text-kore-muted flex-shrink-0"
                                />
                                <span className="text-xs font-medium text-kore-subink">
                                  {p.bank_details?.account || "Conta Bancária"}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${statusConf.bg} ${statusConf.text}`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`}
                                />
                                {statusConf.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-5 py-12 text-center text-sm text-kore-muted"
                        >
                          Nenhum repasse encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table - Mobile Cards */}
              <div className="md:hidden">
                {filteredPayouts.length > 0 ? (
                  filteredPayouts.map((p) => {
                    const statusConf = getPayoutStatusConfig(p.status);
                    return (
                      <div
                        key={p.id}
                        className="border-b border-kore-border/50 last:border-0 p-4 hover:bg-kore-bg/50 transition"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Building2
                                size={14}
                                className="text-kore-muted flex-shrink-0"
                              />
                              <p className="text-sm font-bold text-kore-ink truncate">
                                {p.bank_details?.account || "Conta Bancária"}
                              </p>
                            </div>
                            <p className="text-[11px] text-kore-muted mt-0.5 ml-5">
                              {formatDate(p.created_at)}
                            </p>
                          </div>
                          <span className="text-sm font-bold tabular-nums text-kore-ink flex-shrink-0">
                            {formatBRL(p.amount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between ml-5">
                          <span className="text-[10px] font-mono font-semibold text-kore-muted">
                            {formatShortId(p.id)}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusConf.bg} ${statusConf.text}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`}
                            />
                            {statusConf.label}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-sm text-kore-muted">
                    Nenhum repasse encontrado
                  </div>
                )}
              </div>

              {/* Table Footer */}
              <div className="px-5 py-3 border-t border-kore-border flex items-center justify-between">
                <p className="text-xs text-kore-muted font-medium">
                  {filteredPayouts.length} repasses
                </p>
                <p className="text-xs text-kore-muted font-medium">
                  Total:{" "}
                  <span className="font-bold text-kore-ink">
                    {formatBRL(
                      filteredPayouts.reduce((acc, p) => acc + p.amount, 0),
                    )}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}