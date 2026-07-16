"use client";

import { useState, useMemo } from "react";
import {
  BarChart3,
  CalendarDays,
  Edit3,
  Percent,
  Plus,
  Repeat,
  Search,
  Tag,
  Target,
  ToggleLeft,
  TrendingUp,
  Users,
} from "lucide-react";
import { MobileSidebar, Sidebar } from "../../_components/Sidebar";
import { Topbar } from "../../_components/Topbar";
import { CreateCouponModal } from "./CreateCouponModal";
import { EditCouponModal } from "./EditCouponModal";
import type { AcquisitionMetrics, CouponRow } from "../page";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

/* ── Status helpers ──────────────────────────────────────────── */
const STATUS_LABEL: Record<string, string> = {
  active: "Ativo",
  expired: "Expirado",
  disabled: "Desativado",
};

const STATUS_STYLES: Record<string, { dot: string; badge: string }> = {
  active: {
    dot: "bg-emerald-500",
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  expired: {
    dot: "bg-slate-400",
    badge:
      "bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-300",
  },
  disabled: {
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
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

/* ── Component ───────────────────────────────────────────────── */
export function GrowthClient({
  coupons,
  metrics,
}: {
  coupons: CouponRow[];
  metrics: AcquisitionMetrics;
}) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponRow | null>(null);

  /* ── Filtered list ─────────────────────────────────────────── */
  const filtered = useMemo(() => {
    if (!search.trim()) return coupons;
    const q = search.toLowerCase();
    return coupons.filter((c) => c.code.toLowerCase().includes(q));
  }, [coupons, search]);

  /* ── Handlers ──────────────────────────────────────────────── */
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const { toast } = require("@/store/useToastStore");
    const newStatus = currentStatus === "disabled" ? "active" : "disabled";
    const { error } = await supabase
      .from("coupons")
      .update({ status: newStatus })
      .eq("id", id);
      
    if (error) {
      console.error(error);
      toast.error("Erro ao alterar status do cupom.");
    } else {
      toast.success("Status atualizado!");
      router.refresh();
    }
  };

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
                Growth e Campanhas
              </h1>
              <p className="text-sm text-kore-muted mt-1">
                Métricas de aquisição, cupons e campanhas de marketing
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-kore-emerald text-white text-sm font-bold hover:brightness-110 transition self-start sm:self-auto"
            >
              <Plus size={16} />
              Criar Novo Cupom
            </button>
          </div>

          {/* ── Acquisition Metrics ────────────────────────────── */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-kore-emerald" />
              <h2 className="text-lg font-bold">Métricas de Aquisição</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* CAC */}
              <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 grid place-items-center">
                  <Target size={22} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-bold text-kore-muted">
                    CAC (Custo de Aquisição)
                  </p>
                  <p className="text-2xl font-extrabold tracking-tight mt-0.5">
                    {formatCurrency(metrics.cac)}
                  </p>
                  <p className="text-[11px] text-kore-muted mt-0.5">
                    por cliente adquirido
                  </p>
                </div>
              </div>

              {/* LTV */}
              <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 grid place-items-center">
                  <TrendingUp size={22} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-bold text-kore-muted">
                    LTV (Lifetime Value)
                  </p>
                  <p className="text-2xl font-extrabold tracking-tight mt-0.5">
                    {formatCurrency(metrics.ltv)}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                    LTV/CAC: {(metrics.ltv / metrics.cac).toFixed(1)}x
                  </p>
                </div>
              </div>

              {/* Conversão */}
              <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 grid place-items-center">
                  <Percent size={22} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-bold text-kore-muted">
                    Taxa de Conversão
                  </p>
                  <p className="text-2xl font-extrabold tracking-tight mt-0.5">
                    {metrics.conversion_rate}%
                  </p>
                  <p className="text-[11px] text-kore-muted mt-0.5">
                    visitantes → cadastros
                  </p>
                </div>
              </div>

              {/* Total Usuários */}
              <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-900/20 grid place-items-center">
                  <Users size={22} className="text-violet-600" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-bold text-kore-muted">
                    Total de Usuários
                  </p>
                  <p className="text-2xl font-extrabold tracking-tight mt-0.5">
                    {metrics.total_users.toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>

              {/* Novos 30d */}
              <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 grid place-items-center">
                  <Plus size={22} className="text-cyan-600" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-bold text-kore-muted">
                    Novos (30 dias)
                  </p>
                  <p className="text-2xl font-extrabold tracking-tight mt-0.5">
                    +{metrics.new_users_30d.toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>

              {/* Churn */}
              <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 grid place-items-center">
                  <Repeat size={22} className="text-red-600" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-bold text-kore-muted">
                    Taxa de Churn
                  </p>
                  <p className="text-2xl font-extrabold tracking-tight mt-0.5">
                    {metrics.churn_rate}%
                  </p>
                  <p className="text-[11px] text-kore-muted mt-0.5">
                    mensal
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Coupons Section ────────────────────────────────── */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Tag size={18} className="text-kore-emerald" />
                <h2 className="text-lg font-bold">Cupons de Desconto</h2>
                <span className="text-xs text-kore-muted font-medium">
                  ({filtered.length} cupom{filtered.length !== 1 && "s"})
                </span>
              </div>

              <div className="relative max-w-xs w-full">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted"
                />
                <input
                  type="text"
                  placeholder="Buscar cupom…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-kore-card border border-kore-border text-sm text-kore-ink placeholder:text-kore-muted focus:outline-none focus:border-kore-emerald/60 focus:ring-2 focus:ring-kore-emerald/15 transition"
                />
              </div>
            </div>

            {/* ── Desktop Table ──────────────────────────────── */}
            <div className="hidden md:block rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-kore-border bg-kore-bg/50">
                      {[
                        "Código",
                        "Tipo",
                        "Valor",
                        "Uso Máximo",
                        "Utilizados",
                        "Validade",
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
                          colSpan={8}
                          className="text-center py-12 text-kore-muted text-sm"
                        >
                          Nenhum cupom encontrado.
                        </td>
                      </tr>
                    )}
                    {filtered.map((c) => {
                      const st =
                        (STATUS_STYLES[c.status] ?? STATUS_STYLES.active)!;
                      const usagePct =
                        c.max_uses > 0
                          ? Math.round((c.used_count / c.max_uses) * 100)
                          : 0;
                      return (
                        <tr
                          key={c.id}
                          className="border-b border-kore-border/50 last:border-0 hover:bg-kore-bg/40 transition-colors"
                        >
                          {/* Código */}
                          <td className="px-5 py-3.5">
                            <span className="font-mono font-bold text-kore-ink bg-kore-bg/60 px-2.5 py-1 rounded-lg text-xs">
                              {c.code}
                            </span>
                          </td>

                          {/* Tipo */}
                          <td className="px-5 py-3.5 text-kore-subink font-medium">
                            {c.type === "percent" ? "Percentual" : "Fixo"}
                          </td>

                          {/* Valor */}
                          <td className="px-5 py-3.5 font-mono font-semibold text-kore-ink">
                            {c.type === "percent"
                              ? `${c.value}%`
                              : formatCurrency(c.value)}
                          </td>

                          {/* Uso Máximo */}
                          <td className="px-5 py-3.5 text-kore-subink">
                            {c.max_uses.toLocaleString("pt-BR")}
                          </td>

                          {/* Utilizados */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-kore-bg rounded-full overflow-hidden max-w-[80px]">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    usagePct >= 90
                                      ? "bg-red-500"
                                      : usagePct >= 50
                                        ? "bg-amber-500"
                                        : "bg-kore-emerald"
                                  }`}
                                  style={{ width: `${usagePct}%` }}
                                />
                              </div>
                              <span className="text-xs font-mono font-bold text-kore-subink">
                                {c.used_count}/{c.max_uses}
                              </span>
                            </div>
                          </td>

                          {/* Validade */}
                          <td className="px-5 py-3.5 text-kore-subink whitespace-nowrap">
                            {formatDate(c.valid_until)}
                          </td>

                          {/* Status */}
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${st.badge}`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${st.dot}`}
                              />
                              {STATUS_LABEL[c.status] ?? c.status}
                            </span>
                          </td>

                          {/* Ações */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                title="Editar"
                                onClick={() => setEditingCoupon(c)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-kore-card border border-kore-border text-xs font-bold text-kore-ink hover:border-kore-emerald/40 hover:text-kore-emerald-deep transition"
                              >
                                <Edit3 size={13} />
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(c.id, c.status)}
                                title={
                                  c.status === "disabled"
                                    ? "Reativar"
                                    : "Desativar"
                                }
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition ${
                                  c.status === "disabled"
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300"
                                    : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
                                }`}
                              >
                                <ToggleLeft size={13} />
                                {c.status === "disabled"
                                  ? "Reativar"
                                  : "Desativar"}
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

            {/* ── Mobile Cards ───────────────────────────────── */}
            <div className="md:hidden space-y-3">
              {filtered.length === 0 && (
                <p className="text-center py-12 text-kore-muted text-sm">
                  Nenhum cupom encontrado.
                </p>
              )}
              {filtered.map((c) => {
                const st =
                  (STATUS_STYLES[c.status] ?? STATUS_STYLES.active)!;
                const usagePct =
                  c.max_uses > 0
                    ? Math.round((c.used_count / c.max_uses) * 100)
                    : 0;
                return (
                  <div
                    key={c.id}
                    className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-4 space-y-3"
                  >
                    {/* Header: code + status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-kore-ink bg-kore-bg/60 px-2.5 py-1 rounded-lg text-xs">
                        {c.code}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold ${st.badge}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${st.dot}`}
                        />
                        {STATUS_LABEL[c.status] ?? c.status}
                      </span>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-kore-muted font-medium mb-0.5">
                          Tipo
                        </p>
                        <p className="font-bold text-kore-ink">
                          {c.type === "percent" ? "Percentual" : "Fixo"}
                        </p>
                      </div>
                      <div>
                        <p className="text-kore-muted font-medium mb-0.5">
                          Valor
                        </p>
                        <p className="font-mono font-bold text-kore-ink">
                          {c.type === "percent"
                            ? `${c.value}%`
                            : formatCurrency(c.value)}
                        </p>
                      </div>
                    </div>

                    {/* Usage bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-kore-muted font-medium">
                          Utilizados
                        </span>
                        <span className="font-mono font-bold text-kore-subink">
                          {c.used_count}/{c.max_uses}
                        </span>
                      </div>
                      <div className="h-2 bg-kore-bg rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            usagePct >= 90
                              ? "bg-red-500"
                              : usagePct >= 50
                                ? "bg-amber-500"
                                : "bg-kore-emerald"
                          }`}
                          style={{ width: `${usagePct}%` }}
                        />
                      </div>
                    </div>

                    {/* Validity */}
                    <div className="flex items-center gap-1 text-xs text-kore-muted">
                      <CalendarDays size={12} />
                      Válido até {formatDate(c.valid_until)}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingCoupon(c)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-xs font-bold text-kore-ink hover:border-kore-emerald/40 transition"
                      >
                        <Edit3 size={14} />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(c.id, c.status)}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition ${
                          c.status === "disabled"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300"
                            : "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
                        }`}
                      >
                        <ToggleLeft size={14} />
                        {c.status === "disabled" ? "Reativar" : "Desativar"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>

      <CreateCouponModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      {editingCoupon && (
        <EditCouponModal
          isOpen={!!editingCoupon}
          onClose={() => setEditingCoupon(null)}
          coupon={editingCoupon}
        />
      )}
    </div>
  );
}