"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, PauseCircle, Ban, Loader2, Tag, CalendarDays } from "lucide-react";
import type { ListingRow } from "../page";
import { updateMarketplaceListingStatus } from "@/app/actions/marketplace-actions";

export function ListingAdminModal({
  listing,
  onClose,
}: {
  listing: ListingRow | null;
  onClose: () => void;
}) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  if (!listing) return null;

  async function handleStatusChange(newStatus: string) {
    const { confirmAction } = await import("@/store/useConfirmStore");
    const { toast } = await import("@/store/useToastStore");

    confirmAction({
      title: "Alterar Status",
      message: `Deseja realmente alterar o status deste anúncio para ${newStatus}?`,
      onConfirm: async () => {
        setIsUpdating(newStatus);
        const res = await updateMarketplaceListingStatus(listing!.id, newStatus);
        if (res?.success === false) {
          toast.error(res.message);
        } else {
          toast.success("Status atualizado com sucesso!");
        }
        setIsUpdating(null);
        onClose();
      },
    });
  }

  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-kore-bg/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-kore-card border border-kore-border rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-kore-border/50">
            <div>
              <h2 className="text-lg font-bold text-kore-ink">Ações de Administrador</h2>
              <p className="text-xs text-kore-muted mt-0.5">Gerencie o anúncio no marketplace</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-kore-muted hover:text-kore-ink hover:bg-kore-bg rounded-xl transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-6">
            {/* Resumo do produto */}
            <div className="p-4 rounded-xl bg-kore-bg/50 border border-kore-border/50 space-y-3">
              <div>
                <p className="text-sm font-bold text-kore-ink">{listing.product_name}</p>
                <p className="text-xs text-kore-muted mt-0.5">
                  Vendedor: <span className="font-medium text-kore-ink">{listing.seller_name}</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1 text-kore-muted bg-kore-card px-2 py-1 rounded-lg border border-kore-border">
                  <Tag size={12} /> {listing.category}
                </span>
                <span className="font-mono font-bold text-kore-ink bg-kore-card px-2 py-1 rounded-lg border border-kore-border">
                  {formatCurrency(listing.price)}
                </span>
                <span className="inline-flex items-center gap-1 text-kore-muted bg-kore-card px-2 py-1 rounded-lg border border-kore-border">
                  <CalendarDays size={12} /> {formatDate(listing.created_at)}
                </span>
              </div>
            </div>

            {/* Ações */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-kore-ink mb-2">Alterar Status</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleStatusChange("published")}
                  disabled={isUpdating !== null || listing.status === "published"}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-emerald-500/20 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/20 dark:text-emerald-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating === "published" ? <Loader2 size={24} className="animate-spin" /> : <CheckCircle size={24} />}
                  <span className="text-xs font-bold">Publicar</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange("paused")}
                  disabled={isUpdating !== null || listing.status === "paused"}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-500/20 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 dark:text-slate-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating === "paused" ? <Loader2 size={24} className="animate-spin" /> : <PauseCircle size={24} />}
                  <span className="text-xs font-bold">Pausar</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange("banned")}
                  disabled={isUpdating !== null || listing.status === "banned"}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-red-500/20 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 dark:text-red-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating === "banned" ? <Loader2 size={24} className="animate-spin" /> : <Ban size={24} />}
                  <span className="text-xs font-bold">Banir</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
