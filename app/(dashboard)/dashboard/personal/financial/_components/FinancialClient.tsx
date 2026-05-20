"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  TrendingUp,
  Wallet,
  Clock,
  Download,
  Filter,
  Search,
} from "lucide-react";
import { MobileSidebar, Sidebar } from "../../_components/Sidebar";
import { Topbar } from "../../_components/Topbar";

/* ── Types ──────────────────────────────────────────────────── */
export type TransactionStatus = "concluido" | "pendente" | "estornado";

export interface Transaction {
  id: string;
  created_at: string;
  student_name: string;
  service: string;
  gross_amount: number;
  net_amount: number;
  status: TransactionStatus;
}

/* ── Mock Data ──────────────────────────────────────────────── */
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "txn-001",
    created_at: "2026-05-19T14:30:00Z",
    student_name: "Ana Beatriz Silva",
    service: "Plano Trimestral",
    gross_amount: 897.0,
    net_amount: 807.3,
    status: "concluido",
  },
  {
    id: "txn-002",
    created_at: "2026-05-18T10:15:00Z",
    student_name: "Carlos Eduardo Santos",
    service: "Plano Mensal",
    gross_amount: 349.0,
    net_amount: 314.1,
    status: "concluido",
  },
  {
    id: "txn-003",
    created_at: "2026-05-18T09:00:00Z",
    student_name: "Fernanda Oliveira",
    service: "Plano Semestral",
    gross_amount: 1494.0,
    net_amount: 1344.6,
    status: "pendente",
  },
  {
    id: "txn-004",
    created_at: "2026-05-17T16:45:00Z",
    student_name: "Gabriel Costa",
    service: "Consulta Avulsa",
    gross_amount: 150.0,
    net_amount: 135.0,
    status: "concluido",
  },
  {
    id: "txn-005",
    created_at: "2026-05-16T11:20:00Z",
    student_name: "Isabela Rodrigues",
    service: "Plano Mensal",
    gross_amount: 349.0,
    net_amount: 314.1,
    status: "concluido",
  },
  {
    id: "txn-006",
    created_at: "2026-05-15T08:00:00Z",
    student_name: "Lucas Mendes",
    service: "Plano Trimestral",
    gross_amount: 897.0,
    net_amount: 807.3,
    status: "estornado",
  },
  {
    id: "txn-007",
    created_at: "2026-05-14T15:30:00Z",
    student_name: "Mariana Ferreira",
    service: "Plano Mensal",
    gross_amount: 349.0,
    net_amount: 314.1,
    status: "concluido",
  },
  {
    id: "txn-008",
    created_at: "2026-05-13T12:00:00Z",
    student_name: "Pedro Henrique Almeida",
    service: "Plano Anual",
    gross_amount: 3588.0,
    net_amount: 3229.2,
    status: "concluido",
  },
  {
    id: "txn-009",
    created_at: "2026-05-12T09:45:00Z",
    student_name: "Juliana Costa",
    service: "Consulta Avulsa",
    gross_amount: 150.0,
    net_amount: 135.0,
    status: "concluido",
  },
  {
    id: "txn-010",
    created_at: "2026-05-10T17:00:00Z",
    student_name: "Rafael Souza",
    service: "Plano Mensal",
    gross_amount: 349.0,
    net_amount: 314.1,
    status: "pendente",
  },
  {
    id: "txn-011",
    created_at: "2026-05-08T14:10:00Z",
    student_name: "Camila Santos",
    service: "Plano Trimestral",
    gross_amount: 897.0,
    net_amount: 807.3,
    status: "concluido",
  },
  {
    id: "txn-012",
    created_at: "2026-05-05T10:30:00Z",
    student_name: "Bruno Lima",
    service: "Plano Mensal",
    gross_amount: 349.0,
    net_amount: 314.1,
    status: "concluido",
  },
];

const MOCK_REVENUE_BY_MONTH: { month: string; gross: number; net: number }[] = [
  { month: "Dez", gross: 8200, net: 7380 },
  { month: "Jan", gross: 9400, net: 8460 },
  { month: "Fev", gross: 8800, net: 7920 },
  { month: "Mar", gross: 11200, net: 10080 },
  { month: "Abr", gross: 10500, net: 9450 },
  { month: "Mai", gross: 12800, net: 11520 },
];

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

function getStatusConfig(status: TransactionStatus) {
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
    case "estornado":
      return {
        label: "Estornado",
        bg: "bg-rose-50 dark:bg-rose-900/20",
        text: "text-rose-700 dark:text-rose-400",
        dot: "bg-rose-500",
      };
  }
}

/* ── Area Chart Component ───────────────────────────────────── */
function AreaChart({
  data,
  height = 200,
}: {
  data: { month: string; gross: number; net: number }[];
  height?: number;
}) {
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const width = 600;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const allValues = data.flatMap((d) => [d.gross, d.net]);
  const maxVal = Math.max(...allValues) * 1.1;
  const minVal = 0;

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartWidth,
    y: padding.top + (1 - (d.gross - minVal) / (maxVal - minVal)) * chartHeight,
    xNet: padding.left + (i / (data.length - 1)) * chartWidth,
    yNet: padding.top + (1 - (d.net - minVal) / (maxVal - minVal)) * chartHeight,
    month: d.month,
    gross: d.gross,
    net: d.net,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaD =
    pathD +
    ` L ${points[points.length - 1]?.x ?? 0} ${padding.top + chartHeight} L ${points[0]?.x ?? 0} ${padding.top + chartHeight} Z`;

  const pathNet = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.xNet} ${p.yNet}`)
    .join(" ");

  const areaNet =
    pathNet +
    ` L ${points[points.length - 1]?.xNet ?? 0} ${padding.top + chartHeight} L ${points[0]?.xNet ?? 0} ${padding.top + chartHeight} Z`;

  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    minVal + (i / yTicks) * (maxVal - minVal),
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="areaGradNet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTickValues.map((val) => {
        const y = padding.top + (1 - (val - minVal) / (maxVal - minVal)) * chartHeight;
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

      {/* Area + Line (Gross) */}
      <path d={areaD} fill="url(#areaGrad)" />
      <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Area + Line (Net) */}
      <path d={areaNet} fill="url(#areaGradNet)" />
      <path d={pathNet} fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="6 3" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />

      {/* Points + Labels */}
      {points.map((p) => (
        <g key={p.month}>
          <circle cx={p.x} cy={p.y} r="4" fill="#10b981" stroke="white" strokeWidth="2" />
          <text
            x={p.x}
            y={padding.top + chartHeight + 24}
            textAnchor="middle"
            className="text-[11px] fill-kore-muted font-semibold"
          >
            {p.month}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ── Main Component ─────────────────────────────────────────── */
export function FinancialClient({
  transactions: serverTransactions,
}: {
  transactions: Transaction[];
}) {
  const transactions = serverTransactions.length > 0 ? serverTransactions : MOCK_TRANSACTIONS;
  const revenueData = MOCK_REVENUE_BY_MONTH;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "all">("all");

  // Calculate metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthTransactions = transactions.filter((t) => {
      const d = new Date(t.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.status !== "estornado";
    });

    const grossRevenue = monthTransactions.reduce((acc, t) => acc + t.gross_amount, 0);
    const netRevenue = monthTransactions.reduce((acc, t) => acc + t.net_amount, 0);

    const pendingAmount = transactions
      .filter((t) => t.status === "pendente")
      .reduce((acc, t) => acc + t.net_amount, 0);

    return { grossRevenue, netRevenue, pendingAmount };
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        !searchQuery.trim() ||
        t.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || t.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchQuery, statusFilter]);

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
                    Gestão Financeira
                  </h1>
                  <p className="text-sm text-kore-muted mt-0.5">
                    Acompanhe seus ganhas e transações
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
              {/* Faturamento Bruto */}
              <div className="relative overflow-hidden rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-kore-muted mb-1">
                      Faturamento Bruto
                    </p>
                    <p className="text-xs text-kore-muted mb-2">Mês atual</p>
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
                  <span className="text-xs font-bold text-emerald-600">+18%</span>
                  <span className="text-xs text-kore-muted ml-1">vs. mês anterior</span>
                </div>
                {/* Decorative gradient */}
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500/10 to-transparent" />
              </div>

              {/* Ganhos Líquidos */}
              <div className="relative overflow-hidden rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-kore-muted mb-1">
                      Ganhos Líquidos
                    </p>
                    <p className="text-xs text-kore-muted mb-2">Após taxas KORE + Stripe</p>
                    <p className="text-2xl font-extrabold tracking-tight text-kore-ink">
                      {formatBRL(metrics.netRevenue)}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 grid place-items-center">
                    <Wallet size={20} className="text-emerald-600" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <ArrowUpRight size={14} className="text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-600">+15%</span>
                  <span className="text-xs text-kore-muted ml-1">vs. mês anterior</span>
                </div>
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500/10 to-transparent" />
              </div>

              {/* Saldo a Receber */}
              <div className="relative overflow-hidden rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5 sm:col-span-2 lg:col-span-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-kore-muted mb-1">
                      Saldo a Receber
                    </p>
                    <p className="text-xs text-kore-muted mb-2">Em processamento / pendente</p>
                    <p className="text-2xl font-extrabold tracking-tight text-kore-ink">
                      {formatBRL(metrics.pendingAmount)}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 grid place-items-center">
                    <Clock size={20} className="text-amber-600" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <ArrowDownRight size={14} className="text-amber-500" />
                  <span className="text-xs font-bold text-amber-600">
                    {transactions.filter((t) => t.status === "pendente").length} transações
                  </span>
                  <span className="text-xs text-kore-muted ml-1">aguardando repasse</span>
                </div>
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-amber-500/10 to-transparent" />
              </div>
            </div>

            {/* ── Revenue Trend Chart ──────────────────────────── */}
            <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-base font-extrabold text-kore-ink">
                    Tendência de Faturamento
                  </h2>
                  <p className="text-xs text-kore-muted mt-0.5">
                    Últimos 6 meses — Bruto vs. Líquido
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-0.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-semibold text-kore-muted">Bruto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-0.5 rounded-full bg-emerald-500 opacity-50" style={{ borderTop: "2px dashed #10b981", height: 0 }} />
                    <span className="text-[11px] font-semibold text-kore-muted">Líquido</span>
                  </div>
                </div>
              </div>
              <AreaChart data={revenueData} height={220} />
            </div>

            {/* ── Transactions Table ───────────────────────────── */}
            <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm overflow-hidden">
              {/* Table Header / Filters */}
              <div className="p-5 border-b border-kore-border">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2 className="text-base font-extrabold text-kore-ink">
                    Transações Recentes
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
                          setStatusFilter(e.target.value as TransactionStatus | "all")
                        }
                        className="appearance-none pl-8 pr-8 py-2 rounded-xl bg-kore-bg border border-kore-border text-xs font-semibold text-kore-ink focus:outline-none focus:ring-2 focus:ring-kore-emerald/40 focus:border-kore-emerald transition cursor-pointer"
                      >
                        <option value="all">Todos</option>
                        <option value="concluido">Concluído</option>
                        <option value="pendente">Pendente</option>
                        <option value="estornado">Estornado</option>
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
                        ID da Transação
                      </th>
                      <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-kore-muted">
                        Data
                      </th>
                      <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-kore-muted">
                        Aluno / Serviço
                      </th>
                      <th className="text-right px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-kore-muted">
                        Valor Líquido
                      </th>
                      <th className="text-center px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-kore-muted">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((t) => {
                        const statusConf = getStatusConfig(t.status);
                        return (
                          <tr
                            key={t.id}
                            className="border-b border-kore-border/50 last:border-0 hover:bg-kore-bg/50 transition"
                          >
                            <td className="px-5 py-3.5">
                              <span className="text-xs font-mono font-semibold text-kore-subink">
                                {formatShortId(t.id)}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-xs text-kore-muted font-medium">
                                {formatDate(t.created_at)}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div>
                                <p className="text-sm font-bold text-kore-ink">
                                  {t.student_name}
                                </p>
                                <p className="text-[11px] text-kore-muted mt-0.5">
                                  {t.service}
                                </p>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <span
                                className={`text-sm font-bold tabular-nums ${
                                  t.status === "estornado"
                                    ? "text-rose-500"
                                    : "text-kore-ink"
                                }`}
                              >
                                {t.status === "estornado" ? "- " : ""}
                                {formatBRL(t.net_amount)}
                              </span>
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
                          Nenhuma transação encontrada
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table - Mobile Cards */}
              <div className="md:hidden">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((t) => {
                    const statusConf = getStatusConfig(t.status);
                    return (
                      <div
                        key={t.id}
                        className="border-b border-kore-border/50 last:border-0 p-4 hover:bg-kore-bg/50 transition"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-kore-ink truncate">
                              {t.student_name}
                            </p>
                            <p className="text-[11px] text-kore-muted mt-0.5">
                              {t.service}
                            </p>
                          </div>
                          <span
                            className={`text-sm font-bold tabular-nums flex-shrink-0 ${
                              t.status === "estornado"
                                ? "text-rose-500"
                                : "text-kore-ink"
                            }`}
                          >
                            {t.status === "estornado" ? "- " : ""}
                            {formatBRL(t.net_amount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono font-semibold text-kore-muted">
                              {formatShortId(t.id)}
                            </span>
                            <span className="text-[10px] text-kore-muted">
                              {formatDate(t.created_at)}
                            </span>
                          </div>
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
                    Nenhuma transação encontrada
                  </div>
                )}
              </div>

              {/* Table Footer */}
              <div className="px-5 py-3 border-t border-kore-border flex items-center justify-between">
                <p className="text-xs text-kore-muted font-medium">
                  {filteredTransactions.length} transações
                </p>
                <p className="text-xs text-kore-muted font-medium">
                  Total:{" "}
                  <span className="font-bold text-kore-ink">
                    {formatBRL(
                      filteredTransactions.reduce((acc, t) => acc + t.net_amount, 0),
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