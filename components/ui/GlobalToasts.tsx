"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { useToastStore, Toast } from "@/store/useToastStore";

const ICONS = {
  success: <CheckCircle className="text-emerald-500" size={20} />,
  error: <AlertCircle className="text-red-500" size={20} />,
  info: <Info className="text-blue-500" size={20} />,
};

const BORDERS = {
  success: "border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-900/10",
  error: "border-red-500/20 bg-red-50/50 dark:bg-red-900/10",
  info: "border-blue-500/20 bg-blue-50/50 dark:bg-blue-900/10",
};

export function GlobalToasts() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none w-full max-w-sm">
      <AnimatePresence>
        {toasts.map((toast: Toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md ${BORDERS[toast.type]}`}
          >
            <div className="shrink-0">{ICONS[toast.type]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-kore-ink">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-kore-muted hover:text-kore-ink transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
