"use client";

import {
  ChevronRight,
  Clock,
  MoreHorizontal,
  Package,
  Search,
  Truck,
} from "lucide-react";
import { formatBrl, ORDERS, statusLabel } from "./data";
import { useShop, type OrderFilter } from "./store";
import type { Order } from "./types";

const FILTERS: { key: OrderFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "pendente", label: "Pendente" },
  { key: "preparando", label: "Preparando" },
  { key: "enviado", label: "Enviado" },
  { key: "entregue", label: "Entregue" },
];

const PAYMENT_STYLES: Record<Order["paymentMethod"], string> = {
  Pix: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  Crédito: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
  Boleto:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
};

export function OrdersTable() {
  const filter = useShop((s) => s.orderFilter);
  const setFilter = useShop((s) => s.setOrderFilter);
  const query = useShop((s) => s.orderQuery);
  const setQuery = useShop((s) => s.setOrderQuery);

  const filtered = ORDERS.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
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

  return (
    <section className="card overflow-hidden">
      <header className="px-5 pt-5 pb-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-base font-extrabold text-kore-ink tracking-tight">
            Pedidos recentes
          </h2>
          <p className="text-xs text-kore-muted mt-0.5">
            {ORDERS.length} no período · {filtered.length} filtrados
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
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-kore-muted font-bold bg-kore-bg/60 border-y border-kore-border">
              <th className="text-left font-bold py-2.5 px-5">Pedido</th>
              <th className="text-left font-bold py-2.5 px-3">Cliente</th>
              <th className="text-right font-bold py-2.5 px-3">Itens</th>
              <th className="text-right font-bold py-2.5 px-3">Total</th>
              <th className="text-left font-bold py-2.5 px-3">Pagamento</th>
              <th className="text-left font-bold py-2.5 px-3">Status</th>
              <th className="text-left font-bold py-2.5 px-3">Recebido</th>
              <th className="text-right font-bold py-2.5 px-5 w-20" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="py-10 px-5 text-center text-sm text-kore-muted"
                >
                  Nenhum pedido corresponde ao filtro atual.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function OrderRow({ order }: { order: Order }) {
  return (
    <tr className="border-b border-kore-border last:border-b-0 cursor-pointer hover:bg-kore-bg/60 transition group">
      <td className="py-3 px-5">
        <p className="font-bold text-kore-ink text-sm tabular-nums">
          {order.code}
        </p>
      </td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-kore-emerald-soft text-lg grid place-items-center flex-shrink-0">
            {order.customerAvatar}
          </div>
          <p className="font-semibold text-kore-ink text-sm truncate">
            {order.customerName}
          </p>
        </div>
      </td>
      <td className="py-3 px-3 text-right">
        <p className="text-sm font-bold text-kore-ink tabular-nums">
          {order.itemsCount}
        </p>
      </td>
      <td className="py-3 px-3 text-right">
        <p className="text-sm font-bold text-kore-ink tabular-nums">
          {formatBrl(order.totalBrl)}
        </p>
      </td>
      <td className="py-3 px-3">
        <span
          className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${PAYMENT_STYLES[order.paymentMethod]}`}
        >
          {order.paymentMethod}
        </span>
      </td>
      <td className="py-3 px-3">
        <StatusChip status={order.status} />
      </td>
      <td className="py-3 px-3 text-xs text-kore-subink whitespace-nowrap">
        {order.placedAt}
      </td>
      <td className="py-3 px-5 text-right">
        <div className="inline-flex items-center gap-1.5 text-kore-muted">
          <button
            type="button"
            aria-label="Mais ações"
            className="w-7 h-7 grid place-items-center rounded-lg hover:bg-kore-bg hover:text-kore-ink transition"
            onClick={(e) => e.stopPropagation()}
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
  );
}

const STATUS_STYLES: Record<Order["status"], { cls: string; Icon: typeof Clock }> = {
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

function StatusChip({ status }: { status: Order["status"] }) {
  const { cls, Icon } = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-0.5 uppercase tracking-wider whitespace-nowrap ring-1 ring-inset ${cls}`}
    >
      <Icon size={10} strokeWidth={2.8} />
      {statusLabel(status)}
    </span>
  );
}
