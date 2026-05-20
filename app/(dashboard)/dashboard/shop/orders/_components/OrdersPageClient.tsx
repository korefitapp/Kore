"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ChevronRight,
  Clock,
  MoreHorizontal,
  Package,
  Printer,
  RefreshCw,
  Search,
  Truck,
} from "lucide-react";
import { MobileSidebar, Sidebar } from "../../_components/Sidebar";
import { Topbar } from "../../_components/Topbar";
import {
  formatBrl,
  statusLabel,
} from "../../_components/data";
import type { Order } from "../../_components/types";

/* ------------------------------------------------------------------ */
/*  Mock data – extended for the orders page                           */
/* ------------------------------------------------------------------ */

const ORDERS: Order[] = [
  {
    id: "ord-1042",
    code: "#1042",
    customerName: "Helena Prado",
    customerAvatar: "🥗",
    itemsCount: 3,
    totalBrl: 312.4,
    placedAt: "19/05/2026",
    status: "pendente",
    paymentMethod: "Pix",
    delta24h: 0,
  },
  {
    id: "ord-1041",
    code: "#1041",
    customerName: "Renan Castro",
    customerAvatar: "🍳",
    itemsCount: 2,
    totalBrl: 189.9,
    placedAt: "19/05/2026",
    status: "pendente",
    paymentMethod: "Crédito",
  },
  {
    id: "ord-1040",
    code: "#1040",
    customerName: "Diego Martins",
    customerAvatar: "🧑‍🏫",
    itemsCount: 5,
    totalBrl: 612.0,
    placedAt: "19/05/2026",
    status: "preparando",
    paymentMethod: "Pix",
  },
  {
    id: "ord-1039",
    code: "#1039",
    customerName: "Ana Souza",
    customerAvatar: "🍇",
    itemsCount: 1,
    totalBrl: 89.9,
    placedAt: "18/05/2026",
    status: "preparando",
    paymentMethod: "Crédito",
  },
  {
    id: "ord-1038",
    code: "#1038",
    customerName: "Júlia Sant'Anna",
    customerAvatar: "👩🏼‍⚕️",
    itemsCount: 2,
    totalBrl: 254.0,
    placedAt: "18/05/2026",
    status: "enviado",
    paymentMethod: "Pix",
  },
  {
    id: "ord-1037",
    code: "#1037",
    customerName: "Marcos Figueiredo",
    customerAvatar: "🥩",
    itemsCount: 4,
    totalBrl: 478.6,
    placedAt: "17/05/2026",
    status: "enviado",
    paymentMethod: "Boleto",
  },
  {
    id: "ord-1036",
    code: "#1036",
    customerName: "Beatriz Lopes",
    customerAvatar: "🥕",
    itemsCount: 2,
    totalBrl: 162.4,
    placedAt: "16/05/2026",
    status: "entregue",
    paymentMethod: "Pix",
  },
  {
    id: "ord-1035",
    code: "#1035",
    customerName: "Felipe Carvalho",
    customerAvatar: "🥥",
    itemsCount: 3,
    totalBrl: 295.0,
    placedAt: "15/05/2026",
    status: "entregue",
    paymentMethod: "Crédito",
  },
  {
    id: "ord-1034",
    code: "#1034",
    customerName: "Camila Rodrigues",
    customerAvatar: "🏃‍♀️",
    itemsCount: 6,
    totalBrl: 847.2,
    placedAt: "15/05/2026",
    status: "entregue",
    paymentMethod: "Pix",
  },
  {
    id: "ord-1033",
    code: "#1033",
    customerName: "Thiago Mendes",
    customerAvatar: "🏋️",
    itemsCount: 1,
    totalBrl: 129.9,
    placedAt: "14/05/2026",
    status: "entregue",
    paymentMethod: "Boleto",
  },
  {
    id: "ord-1032",
    code: "#1032",
    customerName: "Patrícia Almeida",
    customerAvatar: "🧘",
    itemsCount: 4,
    totalBrl: 536.0,
    placedAt: "14/05/2026",
    status: "entregue",
    paymentMethod: "Crédito",
  },
  {
    id: "ord-1031",
    code: "#1031",
    customerName: "Lucas Oliveira",
    customerAvatar: "💪",
    itemsCount: 2,
    totalBrl: 218.5,
    placedAt: "13/05/2026",
    status: "entregue",
    paymentMethod: "Pix",
  },
];

/* ------------------------------------------------------------------ */
/*  Types & helpers                                                    */
/* ------------------------------------------------------------------ */

type OrderFilter = "all" | "pendente_pagamento" | "aguardando_envio" | "em_transito" | "entregue";

interface FilterTab {
  key: OrderFilter;
  label: string;
}

const FILTERS: FilterTab[] = [
  { key: "all", label: "Todos" },
  { key: "pendente_pagamento", label: "Pagamento Pendente" },
  { key: "aguardando_envio", label: "Aguardando Envio" },
  { key: "em_transito", label: "Em Trânsito" },
  { key: "entregue", label: "Entregues" },
];

const PAYMENT_STYLES: Record<Order["paymentMethod"], string> = {
  Pix: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  Crédito: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
  Boleto:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
};

const STATUS_STYLES: Record<
  Order["status"],
  { cls: string; Icon: typeof Clock }
> = {
  pendente: {
    cls: "bg-amber-50 text-amber-700 dark:bg-amber-500/12 dark:text-amber-300 ring-amber-200/70 dark:ring-amber-500/30",
    Icon: Clock,
  },
  preparando: {
    cls: "bg-sky-50 text-sky-700 dark:bg-sky-500/12 dark:text-sky-300 ring-sky-200/70 dark:ring-sky-500/30",
    Icon: Package,
  },
  enviado: {
    cls: "bg-violet-50 text-violet-700 dark:bg-violet-500/12 dark:text-violet-300 ring-violet-200/70 dark:ring-violet-500/30",
    Icon: Truck,
  },
  entregue: {
    cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300 ring-emerald-200/70 dark:ring-emerald-500/30",
    Icon: Package,
  },
};

/** Map business filter → internal status(es) */
function matchesFilter(order: Order, filter: OrderFilter): boolean {
  if (filter === "all") return true;
  if (filter === "pendente_pagamento") return order.status === "pendente";
  if (filter === "aguardando_envio") return order.status === "preparando";
  if (filter === "em_transito") return order.status === "enviado";
  if (filter === "entregue") return order.status === "entregue";
  return true;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function OrdersPageClient() {
  const [filter, setFilter] = useState<OrderFilter>("all");
  const [query, setQuery] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return ORDERS.filter((o) => {
      if (!matchesFilter(o, filter)) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (
          !o.customerName.toLowerCase().includes(q) &&
          !o.code.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [filter, query]);

  const toggleMenu = useCallback((id: string) => {
    setOpenMenu((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div className="min-h-screen flex bg-kore-bg text-kore-ink">
      <Sidebar />
      <MobileSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />

        <main className="flex-1 px-3 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-kore-ink">
                Pedidos
              </h1>
              <p className="text-sm text-kore-muted mt-1">
                Gerencie todos os pedidos da sua loja
              </p>
            </div>

            {/* Search bar */}
            <div className="relative w-full sm:w-80">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted"
              />
              <input
                type="text"
                placeholder="Buscar por ID ou nome do cliente…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:ring-2 focus:ring-kore-emerald/40 focus:border-kore-emerald transition"
              />
            </div>
          </div>

          {/* Quick filter tabs */}
          <div className="flex items-center bg-kore-card rounded-xl p-1 border border-kore-border w-fit overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`relative px-4 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                  filter === f.key
                    ? "text-kore-ink"
                    : "text-kore-muted hover:text-kore-ink"
                }`}
              >
                {filter === f.key && (
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-kore-bg rounded-lg shadow-kore-soft"
                  />
                )}
                <span className="relative">{f.label}</span>
              </button>
            ))}
          </div>

          {/* Orders table */}
          <section className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-kore-muted font-bold bg-kore-bg/60 border-y border-kore-border">
                    <th className="text-left font-bold py-3 px-5">
                      ID do Pedido
                    </th>
                    <th className="text-left font-bold py-3 px-3">Data</th>
                    <th className="text-left font-bold py-3 px-3">Cliente</th>
                    <th className="text-right font-bold py-3 px-3">
                      Total (R$)
                    </th>
                    <th className="text-left font-bold py-3 px-3">
                      Método de Pagamento
                    </th>
                    <th className="text-left font-bold py-3 px-3">Status</th>
                    <th className="text-right font-bold py-3 px-5 w-20" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <OrderRow
                      key={o.id}
                      order={o}
                      menuOpen={openMenu === o.id}
                      onToggleMenu={toggleMenu}
                      onCloseMenu={() => setOpenMenu(null)}
                    />
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 px-5 text-center text-sm text-kore-muted"
                      >
                        Nenhum pedido corresponde ao filtro atual.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-kore-border flex items-center justify-between text-xs text-kore-muted">
              <span>
                {ORDERS.length} pedidos no total · {filtered.length} exibidos
              </span>
              <span className="font-medium">Página 1 de 1</span>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Row component                                                      */
/* ------------------------------------------------------------------ */

function OrderRow({
  order,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
}: {
  order: Order;
  menuOpen: boolean;
  onToggleMenu: (id: string) => void;
  onCloseMenu: () => void;
}) {
  const { cls, Icon } = STATUS_STYLES[order.status];

  return (
    <tr className="border-b border-kore-border last:border-b-0 cursor-pointer hover:bg-kore-bg/60 transition group">
      {/* ID */}
      <td className="py-3.5 px-5">
        <p className="font-bold text-kore-ink text-sm tabular-nums">
          {order.code}
        </p>
      </td>

      {/* Data */}
      <td className="py-3.5 px-3">
        <p className="text-sm text-kore-subink whitespace-nowrap">
          {order.placedAt}
        </p>
      </td>

      {/* Cliente */}
      <td className="py-3.5 px-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-kore-emerald-soft text-lg grid place-items-center flex-shrink-0">
            {order.customerAvatar}
          </div>
          <p className="font-semibold text-kore-ink text-sm truncate">
            {order.customerName}
          </p>
        </div>
      </td>

      {/* Total */}
      <td className="py-3.5 px-3 text-right">
        <p className="text-sm font-bold text-kore-ink tabular-nums">
          {formatBrl(order.totalBrl)}
        </p>
      </td>

      {/* Método de pagamento */}
      <td className="py-3.5 px-3">
        <span
          className={`inline-block text-[10px] font-bold rounded-full px-2.5 py-0.5 ${PAYMENT_STYLES[order.paymentMethod]}`}
        >
          {order.paymentMethod}
        </span>
      </td>

      {/* Status badge */}
      <td className="py-3.5 px-3">
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2.5 py-0.5 uppercase tracking-wider whitespace-nowrap ring-1 ring-inset ${cls}`}
        >
          <Icon size={10} strokeWidth={2.8} />
          {statusLabel(order.status)}
        </span>
      </td>

      {/* Actions */}
      <td className="py-3.5 px-5 text-right">
        <div className="relative inline-flex items-center gap-1.5 text-kore-muted">
          <button
            type="button"
            aria-label="Mais ações"
            className="w-8 h-8 grid place-items-center rounded-lg hover:bg-kore-bg hover:text-kore-ink transition"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMenu(order.id);
            }}
          >
            <MoreHorizontal size={16} />
          </button>
          <ChevronRight
            size={15}
            className="opacity-0 group-hover:opacity-100 transition"
          />

          {/* Dropdown menu */}
          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl bg-kore-card border border-kore-border shadow-lg py-1 animate-in fade-in slide-in-from-top-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-kore-ink hover:bg-kore-bg transition"
                onClick={() => {
                  onCloseMenu();
                  /* placeholder – print label */
                }}
              >
                <Printer size={14} className="text-kore-muted" />
                Imprimir Etiqueta
              </button>
              <button
                type="button"
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-kore-ink hover:bg-kore-bg transition"
                onClick={() => {
                  onCloseMenu();
                  /* placeholder – update status */
                }}
              >
                <RefreshCw size={14} className="text-kore-muted" />
                Atualizar Status
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}