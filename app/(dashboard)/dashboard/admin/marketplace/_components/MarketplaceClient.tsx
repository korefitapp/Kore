"use client";

import { useState, useMemo } from "react";
import {
  CalendarDays,
  Eye,
  Package,
  Search,
  ShoppingCart,
  Tag,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { MobileSidebar, Sidebar } from "../../_components/Sidebar";
import { Topbar } from "../../_components/Topbar";
import type { ListingRow } from "../page";
import { deleteMarketplaceListing } from "@/app/actions/marketplace-actions";
import { ListingAdminModal } from "./ListingAdminModal";

/* ── Status helpers ──────────────────────────────────────────── */
const STATUS_LABEL: Record<string, string> = {
  published: "Publicado",
  paused: "Pausado",
  draft: "Rascunho",
  banned: "Banido",
};

const STATUS_STYLES: Record<string, { dot: string; badge: string }> = {
  published: {
    dot: "bg-emerald-500",
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  draft: {
    dot: "bg-slate-400",
    badge:
      "bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-300",
  },
  paused: {
    dot: "bg-amber-500",
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
  banned: {
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
};

const SELLER_TYPE_LABEL: Record<string, string> = {
  trainer: "Personal",
  nutritionist: "Nutricionista",
  merchant: "Loja",
};

const CATEGORY_COLOR: Record<string, string> = {
  Suplementos:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  Treinos:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "Planos Alimentares":
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  Consultoria:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Acessórios:
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

import { toast } from "@/store/useToastStore";
import { confirmAction } from "@/store/useConfirmStore";

/* ── Component ───────────────────────────────────────────────── */
export function MarketplaceClient({
  listings,
}: {
  listings: ListingRow[];
}) {
  const [search, setSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [viewingListing, setViewingListing] = useState<ListingRow | null>(null);

  function handleDelete(id: string) {
    confirmAction({
      title: "Remover Anúncio",
      message: "Deseja realmente remover este anúncio?",
      danger: true,
      onConfirm: async () => {
        setIsDeleting(id);
        const res = await deleteMarketplaceListing(id);
        if (res?.success === false) {
          toast.error(res.message);
        } else {
          toast.success("Anúncio removido com sucesso!");
        }
        setIsDeleting(null);
      },
    });
  }

  /* ── Metric calculations ───────────────────────────────────── */
  const activeCount = listings.filter(
    (l) => l.status === "published",
  ).length;
  const totalSales30d = listings.reduce((sum, l) => sum + l.total_sales, 0);
  const avgTicket =
    listings.length > 0
      ? listings.reduce((sum, l) => sum + l.price, 0) / listings.length
      : 0;

  const metrics = [
    {
      label: "Produtos Ativos",
      value: activeCount.toLocaleString("pt-BR"),
      icon: Package,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      label: "Vendas (30d)",
      value: totalSales30d.toLocaleString("pt-BR"),
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Ticket Médio",
      value: formatCurrency(avgTicket),
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
  ];

  /* ── Filtered list ─────────────────────────────────────────── */
  const filtered = useMemo(() => {
    if (!search.trim()) return listings;
    const q = search.toLowerCase();
    return listings.filter(
      (l) =>
        l.product_name.toLowerCase().includes(q) ||
        l.seller_name.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q),
    );
  }, [listings, search]);

  return (
    <div className="min-h-screen flex bg-kore-bg text-kore-ink">
      <Sidebar />
      <MobileSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />

        <main className="flex-1 px-3 sm:px-6 py-6 space-y-6">
          {/* ── Header ─────────────────────────────────────────── */}
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Catálogo do Marketplace
            </h1>
            <p className="text-sm text-kore-muted mt-1">
              {filtered.length} anúncio{filtered.length !== 1 && "s"} encontrado
              {filtered.length !== 1 && "s"}
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
                      {m.value}
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
              placeholder="Buscar por produto, vendedor ou categoria…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-kore-card border border-kore-border text-sm text-kore-ink placeholder:text-kore-muted focus:outline-none focus:border-kore-emerald/60 focus:ring-2 focus:ring-kore-emerald/15 transition"
            />
          </div>

          {/* ── Desktop Table ──────────────────────────────────── */}
          <div className="hidden md:block rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-kore-border bg-kore-bg/50">
                    {[
                      "Nome do Produto",
                      "Vendedor",
                      "Categoria",
                      "Preço",
                      "Vendas Totais",
                      "Status",
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
                        colSpan={7}
                        className="text-center py-12 text-kore-muted text-sm"
                      >
                        Nenhum anúncio encontrado.
                      </td>
                    </tr>
                  )}
                  {filtered.map((l) => {
                    const st =
                      (STATUS_STYLES[l.status] ?? STATUS_STYLES.published)!;
                    return (
                      <tr
                        key={l.id}
                        className="border-b border-kore-border/50 last:border-0 hover:bg-kore-bg/40 transition-colors"
                      >
                        {/* Nome do Produto */}
                        <td className="px-5 py-3.5">
                          <span className="font-semibold text-kore-ink">
                            {l.product_name}
                          </span>
                        </td>

                        {/* Vendedor */}
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col">
                            <span className="text-kore-ink font-medium">
                              {l.seller_name}
                            </span>
                            <span className="text-[11px] text-kore-muted">
                              {SELLER_TYPE_LABEL[l.seller_type] ??
                                l.seller_type}
                            </span>
                          </div>
                        </td>

                        {/* Categoria */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                              CATEGORY_COLOR[l.category] ??
                              "bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-300"
                            }`}
                          >
                            <Tag size={11} />
                            {l.category}
                          </span>
                        </td>

                        {/* Preço */}
                        <td className="px-5 py-3.5 font-mono text-kore-ink font-semibold">
                          {formatCurrency(l.price)}
                        </td>

                        {/* Vendas Totais */}
                        <td className="px-5 py-3.5 text-kore-subink">
                          {l.total_sales.toLocaleString("pt-BR")}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${st.badge}`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${st.dot}`}
                            />
                            {STATUS_LABEL[l.status] ?? l.status}
                          </span>
                        </td>

                        {/* Ações */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              title="Ver Anúncio"
                              onClick={() => setViewingListing(l)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-kore-card border border-kore-border text-xs font-bold text-kore-ink hover:border-kore-emerald/40 hover:text-kore-emerald-deep transition"
                            >
                              <Eye size={13} />
                              Ver
                            </button>
                            <button
                              type="button"
                              title="Remover Anúncio"
                              onClick={() => handleDelete(l.id)}
                              disabled={isDeleting === l.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition disabled:opacity-50"
                            >
                              {isDeleting === l.id ? (
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 size={13} />
                              )}
                              Remover
                            </button>
                          </div>
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
                Nenhum anúncio encontrado.
              </p>
            )}
            {filtered.map((l) => {
              const st =
                (STATUS_STYLES[l.status] ?? STATUS_STYLES.published)!;
              return (
                <div
                  key={l.id}
                  className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-4 space-y-3"
                >
                  {/* Header: product name + status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-kore-ink leading-snug">
                        {l.product_name}
                      </p>
                      <p className="text-xs text-kore-muted mt-0.5">
                        {l.seller_name} ·{" "}
                        {SELLER_TYPE_LABEL[l.seller_type] ?? l.seller_type}
                      </p>
                    </div>
                    <span
                      className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold ${st.badge}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${st.dot}`}
                      />
                      {STATUS_LABEL[l.status] ?? l.status}
                    </span>
                  </div>

                  {/* Info row */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg font-bold ${
                        CATEGORY_COLOR[l.category] ??
                        "bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-300"
                      }`}
                    >
                      <Tag size={10} />
                      {l.category}
                    </span>
                    <span className="font-mono font-bold text-kore-ink">
                      {formatCurrency(l.price)}
                    </span>
                    <span className="text-kore-muted">
                      {l.total_sales.toLocaleString("pt-BR")} vendas
                    </span>
                    <span className="inline-flex items-center gap-1 text-kore-muted ml-auto">
                      <CalendarDays size={12} />
                      {formatDate(l.created_at)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setViewingListing(l)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-xs font-bold text-kore-ink hover:border-kore-emerald/40 transition"
                    >
                      <Eye size={14} />
                      Ver Anúncio
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(l.id)}
                      disabled={isDeleting === l.id}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition disabled:opacity-50"
                    >
                      {isDeleting === l.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                      Remover
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      <ListingAdminModal 
        listing={viewingListing} 
        onClose={() => setViewingListing(null)} 
      />
    </div>
  );
}