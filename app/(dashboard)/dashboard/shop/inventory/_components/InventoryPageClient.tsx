"use client";

import { useCallback, useState } from "react";
import { Minus, Package, Plus, SlidersHorizontal } from "lucide-react";
import { MobileSidebar, Sidebar } from "../../_components/Sidebar";
import { Topbar } from "../../_components/Topbar";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type StockStatus = "normal" | "baixo" | "esgotado";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  qty: number;
  minQty: number;
  emoji: string;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const INITIAL_ITEMS: InventoryItem[] = [
  { id: "inv-001", name: "Whey Protein Blend 900g", sku: "WHEY-BLD-900", qty: 48, minQty: 12, emoji: "🥛" },
  { id: "inv-002", name: "Whey Protein Isolado 1kg", sku: "WHEY-ISO-1000", qty: 31, minQty: 10, emoji: "🍫" },
  { id: "inv-003", name: "Creatina Monohidratada 300g", sku: "CREA-MONO-300", qty: 5, minQty: 15, emoji: "💪" },
  { id: "inv-004", name: "BCAA 2:1:1 · 300g", sku: "BCAA-300", qty: 0, minQty: 8, emoji: "💊" },
  { id: "inv-005", name: "Pré-Treino Citrus 300g", sku: "PRE-CIT-300", qty: 3, minQty: 10, emoji: "⚡" },
  { id: "inv-006", name: "Pré-Treino Berry Blast 300g", sku: "PRE-BRY-300", qty: 18, minQty: 10, emoji: "🫐" },
  { id: "inv-007", name: "Multivitamínico 90 cápsulas", sku: "MULTI-90CAP", qty: 62, minQty: 15, emoji: "🟠" },
  { id: "inv-008", name: "Vitamina D3 2000UI 60 caps", sku: "VIT-D3-2000", qty: 40, minQty: 10, emoji: "☀️" },
  { id: "inv-009", name: "Camiseta Dry-Fit · Preta M", sku: "TEE-BLK-M", qty: 4, minQty: 15, emoji: "👕" },
  { id: "inv-010", name: "Camiseta Dry-Fit · Branca M", sku: "TEE-WHT-M", qty: 22, minQty: 15, emoji: "👕" },
  { id: "inv-011", name: "Legging Compressão · Preta P", sku: "LEG-BLK-P", qty: 14, minQty: 8, emoji: "🩳" },
  { id: "inv-012", name: "Shaker 450ml · KORE", sku: "SHK-KORE-450", qty: 86, minQty: 20, emoji: "🥤" },
  { id: "inv-013", name: "Faixa Elástica Resistência", sku: "BAND-RES-SET", qty: 0, minQty: 10, emoji: "🏋️" },
  { id: "inv-014", name: "Luva de Treino Pro · Preta", sku: "GLV-PRO-BLK", qty: 7, minQty: 8, emoji: "🧤" },
  { id: "inv-015", name: "Garrafa Térmica 1L · KORE", sku: "BOT-KORE-1000", qty: 33, minQty: 10, emoji: "🧊" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStockStatus(qty: number, minQty: number): StockStatus {
  if (qty === 0) return "esgotado";
  if (qty < minQty) return "baixo";
  return "normal";
}

const STATUS_CONFIG: Record<StockStatus, { label: string; cls: string; rowCls: string }> = {
  normal: {
    label: "Normal",
    cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300 ring-emerald-200/70 dark:ring-emerald-500/30",
    rowCls: "",
  },
  baixo: {
    label: "Estoque Baixo",
    cls: "bg-amber-50 text-amber-700 dark:bg-amber-500/12 dark:text-amber-300 ring-amber-200/70 dark:ring-amber-500/30",
    rowCls: "bg-amber-50/50 dark:bg-amber-500/5",
  },
  esgotado: {
    label: "Esgotado",
    cls: "bg-rose-50 text-rose-700 dark:bg-rose-500/12 dark:text-rose-300 ring-rose-200/70 dark:ring-rose-500/30",
    rowCls: "bg-rose-50/50 dark:bg-rose-500/5",
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function InventoryPageClient() {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_ITEMS);

  const updateQty = useCallback((id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, qty: Math.max(0, item.qty + delta) }
          : item,
      ),
    );
  }, []);

  const setQty = useCallback((id: string, value: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(0, value) } : item,
      ),
    );
  }, []);

  const summary = {
    total: items.length,
    normal: items.filter((i) => getStockStatus(i.qty, i.minQty) === "normal").length,
    baixo: items.filter((i) => getStockStatus(i.qty, i.minQty) === "baixo").length,
    esgotado: items.filter((i) => getStockStatus(i.qty, i.minQty) === "esgotado").length,
  };

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
                Controle de Estoque
              </h1>
              <p className="text-sm text-kore-muted mt-1">
                Monitore e ajuste o estoque dos seus produtos
              </p>
            </div>
            <button type="button" className="btn-emerald text-sm px-5 py-2.5">
              <SlidersHorizontal size={16} strokeWidth={2.5} />
              Ajuste Manual
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider font-bold text-kore-muted">Total de SKUs</p>
              <p className="text-2xl font-extrabold text-kore-ink mt-1">{summary.total}</p>
            </div>
            <div className="card px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider font-bold text-kore-muted">Normal</p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{summary.normal}</p>
            </div>
            <div className="card px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider font-bold text-kore-muted">Estoque Baixo</p>
              <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{summary.baixo}</p>
            </div>
            <div className="card px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider font-bold text-kore-muted">Esgotados</p>
              <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{summary.esgotado}</p>
            </div>
          </div>

          {/* Inventory table */}
          <section className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-kore-muted font-bold bg-kore-bg/60 border-y border-kore-border">
                    <th className="text-left font-bold py-3 px-5">Produto</th>
                    <th className="text-left font-bold py-3 px-3">SKU</th>
                    <th className="text-right font-bold py-3 px-3">Qtd. Atual</th>
                    <th className="text-right font-bold py-3 px-3">Qtd. Mínima</th>
                    <th className="text-left font-bold py-3 px-3">Status</th>
                    <th className="text-center font-bold py-3 px-5 w-36">Ajuste Rápido</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const status = getStockStatus(item.qty, item.minQty);
                    const cfg = STATUS_CONFIG[status];

                    return (
                      <tr
                        key={item.id}
                        className={`border-b border-kore-border last:border-b-0 transition ${cfg.rowCls} hover:brightness-95`}
                      >
                        {/* Product name */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-kore-emerald-soft text-lg grid place-items-center flex-shrink-0">
                              {item.emoji}
                            </div>
                            <p className="font-semibold text-kore-ink text-sm truncate max-w-[220px]">
                              {item.name}
                            </p>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="py-3.5 px-3">
                          <span className="font-mono text-xs text-kore-subink">{item.sku}</span>
                        </td>

                        {/* Qty current */}
                        <td className="py-3.5 px-3 text-right">
                          <span className={`text-sm font-bold tabular-nums ${
                            status === "esgotado"
                              ? "text-rose-600 dark:text-rose-400"
                              : status === "baixo"
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-kore-ink"
                          }`}>
                            {item.qty}
                          </span>
                        </td>

                        {/* Qty min */}
                        <td className="py-3.5 px-3 text-right">
                          <span className="text-sm font-medium text-kore-subink tabular-nums">
                            {item.minQty}
                          </span>
                        </td>

                        {/* Status badge */}
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2.5 py-0.5 uppercase tracking-wider whitespace-nowrap ring-1 ring-inset ${cfg.cls}`}
                          >
                            <Package size={10} strokeWidth={2.8} />
                            {cfg.label}
                          </span>
                        </td>

                        {/* Quick adjust */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateQty(item.id, -1)}
                              disabled={item.qty === 0}
                              className="w-8 h-8 grid place-items-center rounded-lg border border-kore-border bg-kore-card text-kore-muted hover:text-kore-ink hover:border-kore-emerald/40 transition disabled:opacity-30 disabled:cursor-not-allowed"
                              aria-label="Diminuir"
                            >
                              <Minus size={14} strokeWidth={2.5} />
                            </button>
                            <input
                              type="number"
                              min={0}
                              value={item.qty}
                              onChange={(e) => {
                                const v = parseInt(e.target.value, 10);
                                if (!isNaN(v)) setQty(item.id, v);
                              }}
                              className="w-14 h-8 text-center text-sm font-bold tabular-nums rounded-lg border border-kore-border bg-kore-card text-kore-ink focus:outline-none focus:ring-2 focus:ring-kore-emerald/40 focus:border-kore-emerald transition"
                            />
                            <button
                              type="button"
                              onClick={() => updateQty(item.id, 1)}
                              className="w-8 h-8 grid place-items-center rounded-lg border border-kore-border bg-kore-card text-kore-muted hover:text-kore-ink hover:border-kore-emerald/40 transition"
                              aria-label="Aumentar"
                            >
                              <Plus size={14} strokeWidth={2.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-kore-border flex items-center justify-between text-xs text-kore-muted">
              <span>{items.length} SKUs monitorados</span>
              <span className="font-medium">Última atualização: agora</span>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}