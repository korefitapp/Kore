"use client";

import { useMemo, useState } from "react";
import { Edit2, Plus, Search, Slash } from "lucide-react";
import { MobileSidebar, Sidebar } from "../../_components/Sidebar";
import { Topbar } from "../../_components/Topbar";
import { formatBrl } from "../../_components/data";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ProductStatus = "ativo" | "inativo";
type ProductCategory = "Suplementos" | "Vestuário" | "Acessórios" | "Vitaminas" | "Pré-treino";

interface Product {
  id: string;
  name: string;
  emoji: string;
  sku: string;
  price: number;
  category: ProductCategory;
  status: ProductStatus;
}

/* ------------------------------------------------------------------ */
/*  Mock data – fitness niche                                          */
/* ------------------------------------------------------------------ */

const PRODUCTS: Product[] = [
  {
    id: "prod-001",
    name: "Whey Protein Blend 900g",
    emoji: "🥛",
    sku: "WHEY-BLD-900",
    price: 149.9,
    category: "Suplementos",
    status: "ativo",
  },
  {
    id: "prod-002",
    name: "Creatina Monohidratada 300g",
    emoji: "💪",
    sku: "CREA-MONO-300",
    price: 79.9,
    category: "Suplementos",
    status: "ativo",
  },
  {
    id: "prod-003",
    name: "Whey Protein Isolado 1kg",
    emoji: "🍫",
    sku: "WHEY-ISO-1000",
    price: 219.9,
    category: "Suplementos",
    status: "ativo",
  },
  {
    id: "prod-004",
    name: "BCAA 2:1:1 · 300g",
    emoji: "💊",
    sku: "BCAA-300",
    price: 64.9,
    category: "Suplementos",
    status: "inativo",
  },
  {
    id: "prod-005",
    name: "Pré-Treino Citrus 300g",
    emoji: "⚡",
    sku: "PRE-CIT-300",
    price: 89.9,
    category: "Pré-treino",
    status: "ativo",
  },
  {
    id: "prod-006",
    name: "Pré-Treino Berry Blast 300g",
    emoji: "🫐",
    sku: "PRE-BRY-300",
    price: 89.9,
    category: "Pré-treino",
    status: "ativo",
  },
  {
    id: "prod-007",
    name: "Multivitamínico 90 cápsulas",
    emoji: "🟠",
    sku: "MULTI-90CAP",
    price: 59.9,
    category: "Vitaminas",
    status: "ativo",
  },
  {
    id: "prod-008",
    name: "Vitamina D3 2000UI 60 caps",
    emoji: "☀️",
    sku: "VIT-D3-2000",
    price: 39.9,
    category: "Vitaminas",
    status: "ativo",
  },
  {
    id: "prod-009",
    name: "Camiseta Dry-Fit · Preta M",
    emoji: "👕",
    sku: "TEE-BLK-M",
    price: 89.9,
    category: "Vestuário",
    status: "ativo",
  },
  {
    id: "prod-010",
    name: "Camiseta Dry-Fit · Branca M",
    emoji: "👕",
    sku: "TEE-WHT-M",
    price: 89.9,
    category: "Vestuário",
    status: "inativo",
  },
  {
    id: "prod-011",
    name: "Legging Compressão · Preta P",
    emoji: "🩳",
    sku: "LEG-BLK-P",
    price: 129.9,
    category: "Vestuário",
    status: "ativo",
  },
  {
    id: "prod-012",
    name: "Shaker 450ml · KORE",
    emoji: "🥤",
    sku: "SHK-KORE-450",
    price: 29.9,
    category: "Acessórios",
    status: "ativo",
  },
  {
    id: "prod-013",
    name: "Faixa Elástica Resistência",
    emoji: "🏋️",
    sku: "BAND-RES-SET",
    price: 49.9,
    category: "Acessórios",
    status: "ativo",
  },
  {
    id: "prod-014",
    name: "Luva de Treino Pro · Preta",
    emoji: "🧤",
    sku: "GLV-PRO-BLK",
    price: 69.9,
    category: "Acessórios",
    status: "ativo",
  },
  {
    id: "prod-015",
    name: "Garrafa Térmica 1L · KORE",
    emoji: "🧊",
    sku: "BOT-KORE-1000",
    price: 59.9,
    category: "Acessórios",
    status: "ativo",
  },
];

/* ------------------------------------------------------------------ */
/*  Filter & style config                                              */
/* ------------------------------------------------------------------ */

const CATEGORIES: ("Todos" | ProductCategory)[] = [
  "Todos",
  "Suplementos",
  "Vestuário",
  "Acessórios",
  "Vitaminas",
  "Pré-treino",
];

const STATUS_STYLES: Record<ProductStatus, string> = {
  ativo:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300 ring-emerald-200/70 dark:ring-emerald-500/30",
  inativo:
    "bg-gray-100 text-gray-500 dark:bg-gray-500/12 dark:text-gray-400 ring-gray-200/70 dark:ring-gray-500/30",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ProductsPageClient() {
  const [category, setCategory] = useState<"Todos" | ProductCategory>("Todos");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (category !== "Todos" && p.category !== category) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (
          !p.name.toLowerCase().includes(q) &&
          !p.sku.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [category, query]);

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
                Produtos
              </h1>
              <p className="text-sm text-kore-muted mt-1">
                Gerencie o catálogo da sua loja
              </p>
            </div>
            <button type="button" className="btn-emerald text-sm px-5 py-2.5">
              <Plus size={16} strokeWidth={2.8} />
              Adicionar Produto
            </button>
          </div>

          {/* Search + Category filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted"
              />
              <input
                type="text"
                placeholder="Buscar por nome ou SKU…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:ring-2 focus:ring-kore-emerald/40 focus:border-kore-emerald transition"
              />
            </div>

            {/* Category pills */}
            <div className="flex items-center bg-kore-card rounded-xl p-1 border border-kore-border overflow-x-auto">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`relative px-4 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                    category === c
                      ? "text-kore-ink"
                      : "text-kore-muted hover:text-kore-ink"
                  }`}
                >
                  {category === c && (
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-kore-bg rounded-lg shadow-kore-soft"
                    />
                  )}
                  <span className="relative">{c}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Products table */}
          <section className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-kore-muted font-bold bg-kore-bg/60 border-y border-kore-border">
                    <th className="text-left font-bold py-3 px-5 w-14">
                      Imagem
                    </th>
                    <th className="text-left font-bold py-3 px-3">Nome</th>
                    <th className="text-left font-bold py-3 px-3">SKU</th>
                    <th className="text-right font-bold py-3 px-3">
                      Preço de Venda
                    </th>
                    <th className="text-left font-bold py-3 px-3">
                      Categoria
                    </th>
                    <th className="text-left font-bold py-3 px-3">Status</th>
                    <th className="text-right font-bold py-3 px-5 w-36">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-kore-border last:border-b-0 cursor-pointer hover:bg-kore-bg/60 transition group"
                    >
                      {/* Placeholder image */}
                      <td className="py-3.5 px-5">
                        <div className="w-11 h-11 rounded-xl bg-kore-emerald-soft grid place-items-center flex-shrink-0 text-xl">
                          {p.emoji}
                        </div>
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-3">
                        <p className="font-semibold text-kore-ink text-sm truncate max-w-[240px]">
                          {p.name}
                        </p>
                      </td>

                      {/* SKU */}
                      <td className="py-3.5 px-3">
                        <span className="font-mono text-xs text-kore-subink">
                          {p.sku}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-3 text-right">
                        <p className="text-sm font-bold text-kore-ink tabular-nums">
                          {formatBrl(p.price)}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3">
                        <span className="text-xs font-semibold text-kore-subink">
                          {p.category}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2.5 py-0.5 uppercase tracking-wider whitespace-nowrap ring-1 ring-inset ${STATUS_STYLES[p.status]}`}
                        >
                          {p.status === "ativo" ? "Ativo" : "Inativo"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg bg-kore-bg border border-kore-border text-kore-subink hover:text-kore-ink hover:border-kore-emerald/60 transition"
                          >
                            <Edit2 size={12} />
                            Editar
                          </button>
                          <button
                            type="button"
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg border transition ${
                              p.status === "ativo"
                                ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-400"
                                : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400"
                            }`}
                          >
                            <Slash size={12} />
                            {p.status === "ativo" ? "Desativar" : "Ativar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 px-5 text-center text-sm text-kore-muted"
                      >
                        Nenhum produto encontrado para o filtro atual.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-kore-border flex items-center justify-between text-xs text-kore-muted">
              <span>
                {PRODUCTS.length} produtos no total · {filtered.length} exibidos
              </span>
              <span className="font-medium">Página 1 de 1</span>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}