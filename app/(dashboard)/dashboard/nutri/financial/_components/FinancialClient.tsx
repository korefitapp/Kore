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
  Plus,
  Search,
} from "lucide-react";
import { MobileSidebar, Sidebar } from "../../_components/Sidebar";
import { Topbar } from "../../_components/Topbar";

/* ── Types ──────────────────────────────────────────────────── */
export type TransactionStatus = "concluido" | "pendente" | "recusado";

export interface Transaction {
  id: string;
  created_at: string;
  patient_name: string;
  description: string;
  gross_amount: number;
  net_amount: number;
  status: TransactionStatus;
}

/* ── Mock Data ──────────────────────────────────────────────── */
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "TX-1024",
    created_at: "2026-05-19T14:30:00Z",
    patient_name: "Ana Carolina Silva",
    description: "Plano Trimestral — Consulta + Acompanhamento",
    gross_amount: 897.0,
    net_amount: 807.3,
    status: "concluido",
  },
  {
    id: "TX-1023",
    created_at: "2026-05-18T10:15:00Z",
    patient_name: "Bruno Costa Oliveira",
    description: "Consulta Avulsa — Avaliação Nutricional",
    gross_amount: 189.0,
    net_amount: 170.1,
    status: "concluido",
  },
  {
    id: "TX-1022",
    created_at: "2026-05-18T09:00:00Z",
    patient_name: "Camila Ferreira Santos",
    description: "Plano Semestral — Emagrecimento Saudável",
    gross_amount: 1494.0,
    net_amount: 1344.6,
    status: "pendente",
  },
  {
    id: "TX-1021",
    created_at: "2026-05-17T16:45:00Z",
    patient_name: "Diego Almeida Lima",
    description: "Consulta Avulsa — Intolerância Alimentar",
    gross_amount: 189.0,
    net_amount: 170.1,
    status: "concluido",
  },
  {
    id: "TX-1020",
    created_at: "2026-05-16T11:20:00Z",
    patient_name: "Elena Rodrigues Pereira",
    description: "Plano Mensal — Nutrição Esportiva",
    gross_amount: 349.0,
    net_amount: 314.1,
    status: "concluido",
  },
  {
    id: "TX-1019",
    created_at: "2026-05-15T08:00:00Z",
    patient_name: "Felipe Souza Martins",
    description: "Plano Trimestral — Ganho de Massa Muscular",
    gross_amount: 897.0,
    net_amount: 807.3,
    status: "recusado",
  },
  {
    id: "TX-1018",
    created_at: "2026-05-14T15:30:00Z",
    patient_name: "Gabriela Mendes Rocha",
    description: "Plano Mensal — Nutrição Gestacional",
    gross_amount: 399.0,
    net_amount: 359.1,
    status: "concluido",
  },
  {
    id: "TX-1017",
    created_at: "2026-05-13T12:00:00Z",
    patient_name: "Hugo Nascimento Barbosa",
    description: "Plano Anual — Acompanhamento Completo",
    gross_amount: 3588.0,
    net_amount: 3229.2,
    status: "concluido",
  },
  {
    id: "TX-1016",
    created_at: "2026-05-12T09:45:00Z",
    patient_name: "Isabela Rocha Costa",
    description: "Consulta Avulsa — Revisão de Plano Alimentar",
    gross_amount: 149.0,
    net_amount: 134.1,
    status: "concluido",
  },
  {
    id: "TX-1015",
    created_at: "2026-05-10T17:00:00Z",
    patient_name: "João Pedro Almeida",
    description: "Plano Mensal — Controle de Diabetes",
    gross_amount: 399.0,
    net_amount: 359.1,
    status: "pendente",
  },
  {
    id: "TX-1014",
    created_at: "2026-05-08T14:10:00Z",
    patient_name: "Karina Lopes Ferreira",
    description: "Plano Trimestral — Reeducação Alimentar",
    gross_amount: 897.0,
    net_amount: 807.3,
    status: "concluido",
  },
  {
    id: "TX-1013",
    created_at: "2026-05-05T10:30:00Z",
    patient_name: "Lucas Mendes Souza",
    description: "Consulta Avulsa — Pós-operatório Bariátrica",
    gross_amount: 249.0,
    net_amount: 224.1,
    status: "concluido",
  },
];

const MOCK_REVENUE_BY_MONTH: { month: string; value: number }[] = [
  { month: "Dez", value: 8200 },
  { month: "Jan", value: 9400 },
  { month: "Fev", value: 7800 },
  { month: "Mar", value: 11200 },
  { month: "Abr", value: 10500 },
  { month: "Mai", value: 12800 },
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
  return id.startsWith("#") ? id.toUpperCase() : `#${id.toUpperCase()}`;
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
    case "recusado":
      return {
        label: "Recusado",
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
  data: { month: string; value: number }[];
  height?: number;
}) {
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const width = 600;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map((d) => d.value)) * 1.15;
  const barCount = data.length;
  const barGap = 16;
  const barWidth = (chartWidth - barGap * (barCount + 1)) / barCount;

  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    (i / yTicks) * maxVal,
  );

  // Find max month for highlighting
  const maxIdx = data.reduce(
    (best, d, i) => (d.value > data[best]!.value ? i : best),
    0,
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
        <linearGradient id="barGradLight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.12" />
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
        const x = padding.left + barGap + i * (barWidth + barGap);
        const barH = (d.value / maxVal) * chartHeight;
        const y = padding.top + chartHeight - barH;
        const isMax = i === maxIdx;

        return (
          <g key={d.month}>
            {/* Bar */}
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx={6}
              ry={6}
              fill={isMax ? "url(#barGrad)" : "url(#barGradLight)"}
            />

            {/* Value label on top */}
            <text
              x={x + barWidth / 2}
              y={y - 6}
              textAnchor="middle"
              className={`text-[10px] font-bold ${isMax ? "fill-emerald-600" : "fill-kore-muted"}`}
            >
              {(d.value / 1000).toFixed(1)}k
            </text>

            {/* Month label */}
            <text
              x={x + barWidth / 2}
              y={padding.top + chartHeight + 24}
              textAnchor="middle"
              className="text-[11px] fill-kore-muted font-semibold"
            >
              {d.month}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Main Component ─────────────────────────────────────────── */
export function FinancialClient({
  transactions: serverTransactions,
}: {
  transactions: Transaction[];
}) {
  const transactions =
    serverTransactions.length > 0 ? serverTransactions : MOCK_TRANSACTIONS;
  const revenueData = MOCK_REVENUE_BY_MONTH;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    TransactionStatus | "all"
  >("all");

  // Calculate metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthTransactions = transactions.filter((t) => {
      const d = new Date(t.created_at);
      return (
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear &&
        t.status !== "recusado"
      );
    });

    const grossRevenue = monthTransactions.reduce(
      (acc, t) => acc + t.gross_amount,
      0,
    );
    const netRevenue = monthTransactions.reduce(
      (acc, t) => acc + t.net_amount,
      0,
    );

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
        t.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || t.status === statusFilter;

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
                    Acompanhe seus ganhos, repasses e transações
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-kore-card border border-kore-border text-sm font-semibold text-kore-subink hover:text-kore-ink hover:border-kore-border/80 transition shadow-sm"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Exportar Relatório</span>
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  Nova Transação
                </button>
              </div>
            </div>

            {/* ── KPI Cards ────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {/* Faturamento Mensal */}
              <div className="relative overflow-hidden rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-kore-muted mb-1">
                      Faturamento Mensal
                    </p>
                    <p className="text-xs text-kore-muted mb-2">
                      Consultas e planos — mês atual
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
                    vs. mês anterior
                  </span>
                </div>
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500/10 to-transparent" />
              </div>

              {/* Receita Pendente */}
              <div className="relative overflow-hidden rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-kore-muted mb-1">
                      Receita Pendente
                    </p>
                    <p className="text-xs text-kore-muted mb-2">
                      Consultas agendadas / faturamento a cair
                    </p>
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
                    {transactions.filter((t) => t.status === "pendente").length}{" "}
                    transações
                  </span>
                  <span className="text-xs text-kore-muted ml-1">
                    aguardando confirmação
                  </span>
                </div>
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-amber-500/10 to-transparent" />
              </div>

              {/* Lucro Líquido / Repasses */}
              <div className="relative overflow-hidden rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5 sm:col-span-2 lg:col-span-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-kore-muted mb-1">
                      Lucro Líquido
                    </p>
                    <p className="text-xs text-kore-muted mb-2">
                      Após taxas da plataforma (KORE + Stripe)
                    </p>
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
                  <span className="text-xs font-bold text-emerald-600">
                    +19%
                  </span>
                  <span className="text-xs text-kore-muted ml-1">
                    vs. mês anterior
                  </span>
                </div>
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500/10 to-transparent" />
              </div>
            </div>

            {/* ── Revenue Bar Chart ────────────────────────────── */}
            <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-base font-extrabold text-kore-ink">
                    Evolução do Faturamento
                  </h2>
                  <p className="text-xs text-kore-muted mt-0.5">
                    Últimos 6 meses — Faturamento bruto
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-emerald-500 opacity-90" />
                    <span className="text-[11px] font-semibold text-kore-muted">
                      Mês atual
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-emerald-500/25" />
                    <span className="text-[11px] font-semibold text-kore-muted">
                      Meses anteriores
                    </span>
                  </div>
                </div>
              </div>
              <BarChart data={revenueData} height={220} />
            </div>

            {/* ── Transactions Table ───────────────────────────── */}
            <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm overflow-hidden">
              {/* Table Header / Filters */}
              <div className="p-5 border-b border-kore-border">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2 className="text-base font-extrabold text-kore-ink">
                    Histórico de Transações
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
                        placeholder="Buscar paciente ou ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-52 pl-9 pr-3 py-2 rounded-xl bg-kore-bg border border-kore-border text-xs font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:ring-2 focus:ring-kore-emerald/40 focus:border-kore-emerald transition"
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
                            e.target.value as TransactionStatus | "all",
                          )
                        }
                        className="appearance-none pl-8 pr-8 py-2 rounded-xl bg-kore-bg border border-kore-border text-xs font-semibold text-kore-ink focus:outline-none focus:ring-2 focus:ring-kore-emerald/40 focus:border-kore-emerald transition cursor-pointer"
                      >
                        <option value="all">Todos</option>
                        <option value="concluido">Concluído</option>
                        <option value="pendente">Pendente</option>
                        <option value="recusado">Recusado</option>
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
                        ID Transação
                      </th>
                      <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-kore-muted">
                        Data
                      </th>
                      <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-kore-muted">
                        Paciente / Descrição
                      </th>
                      <th className="text-right px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-kore-muted">
                        Valor Bruto
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
                                  {t.patient_name}
                                </p>
                                <p className="text-[11px] text-kore-muted mt-0.5">
                                  {t.description}
                                </p>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <span className="text-sm font-medium tabular-nums text-kore-muted">
                                {formatBRL(t.gross_amount)}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <span
                                className={`text-sm font-bold tabular-nums ${
                                  t.status === "recusado"
                                    ? "text-rose-500"
                                    : "text-kore-ink"
                                }`}
                              >
                                {t.status === "recusado" ? "- " : ""}
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
                          colSpan={6}
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
                              {t.patient_name}
                            </p>
                            <p className="text-[11px] text-kore-muted mt-0.5">
                              {t.description}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p
                              className={`text-sm font-bold tabular-nums ${
                                t.status === "recusado"
                                  ? "text-rose-500"
                                  : "text-kore-ink"
                              }`}
                            >
                              {t.status === "recusado" ? "- " : ""}
                              {formatBRL(t.net_amount)}
                            </p>
                            <p className="text-[10px] text-kore-muted tabular-nums">
                              Bruto: {formatBRL(t.gross_amount)}
                            </p>
                          </div>
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
                  Total líquido:{" "}
                  <span className="font-bold text-kore-ink">
                    {formatBRL(
                      filteredTransactions.reduce(
                        (acc, t) => acc + t.net_amount,
                        0,
                      ),
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