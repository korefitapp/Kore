"use client";

import { AlertTriangle, Plus } from "lucide-react";
import { INVENTORY_ALERTS } from "./data";

export function InventoryAlerts() {
  return (
    <section className="card p-5">
      <header className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-300 grid place-items-center ring-1 ring-rose-200/70 dark:ring-rose-500/30">
          <AlertTriangle size={16} strokeWidth={2.4} />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-kore-ink tracking-tight">
            Estoque crítico
          </h2>
          <p className="text-[11px] text-kore-muted mt-0.5">
            {INVENTORY_ALERTS.length} SKUs precisam de reposição
          </p>
        </div>
      </header>

      <ul className="space-y-2">
        {INVENTORY_ALERTS.map((a) => (
          <li
            key={a.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-kore-bg/60 border border-kore-border hover:border-kore-emerald/40 transition"
          >
            <div className="w-9 h-9 rounded-xl bg-kore-emerald-soft text-lg grid place-items-center flex-shrink-0">
              {a.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-kore-ink truncate">
                {a.name}
              </p>
              <p className="text-[11px] text-kore-muted truncate">
                {a.sku} · {a.category}
              </p>
            </div>
            <StockChip stock={a.stock} threshold={a.threshold} />
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-kore-border text-sm font-bold text-kore-subink py-2.5 hover:border-kore-emerald hover:text-kore-emerald-deep transition"
      >
        <Plus size={15} strokeWidth={2.5} />
        Repor estoque em lote
      </button>
    </section>
  );
}

function StockChip({ stock, threshold }: { stock: number; threshold: number }) {
  const cls =
    stock === 0
      ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"
      : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
  return (
    <span
      className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${cls} whitespace-nowrap tabular-nums`}
    >
      {stock} / {threshold}
    </span>
  );
}
