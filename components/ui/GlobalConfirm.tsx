"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useState } from "react";

export function GlobalConfirm() {
  const { isOpen, options, closeConfirm } = useConfirmStore();
  const [isLoading, setIsLoading] = useState(false);

  if (!options) return null;

  async function handleConfirm() {
    setIsLoading(true);
    try {
      await options?.onConfirm();
    } finally {
      setIsLoading(false);
      closeConfirm();
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isLoading ? closeConfirm : undefined}
            className="absolute inset-0 bg-kore-bg/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-kore-card border border-kore-border rounded-2xl shadow-2xl overflow-hidden p-6"
          >
            <div className="flex gap-4">
              <div
                className={`shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${
                  options.danger
                    ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-kore-emerald/20 text-kore-emerald-deep"
                }`}
              >
                <AlertTriangle size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-kore-ink">
                  {options.title}
                </h2>
                <p className="text-sm text-kore-muted mt-1">
                  {options.message}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeConfirm}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl text-sm font-bold text-kore-muted hover:text-kore-ink hover:bg-kore-bg transition disabled:opacity-50"
              >
                {options.cancelText || "Cancelar"}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 min-w-[100px] ${
                  options.danger
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-kore-emerald hover:bg-kore-emerald-deep"
                }`}
              >
                {isLoading && (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {!isLoading && (options.confirmText || "Confirmar")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
