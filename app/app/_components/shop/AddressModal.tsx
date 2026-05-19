"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Navigation, X } from "lucide-react";
import { useEffect, useState } from "react";

const SUGGESTIONS = [
  "Av. Paulista, 1578 — Bela Vista, SP",
  "R. Augusta, 2840 — Consolação, SP",
  "Av. Brig. Faria Lima, 4500 — Itaim Bibi, SP",
  "R. Oscar Freire, 379 — Jardins, SP",
];

export function AddressModal({
  open,
  current,
  onClose,
  onSave,
}: {
  open: boolean;
  current: string;
  onClose: () => void;
  onSave: (a: string) => void;
}) {
  const [value, setValue] = useState(current);

  useEffect(() => {
    if (open) setValue(current);
  }, [open, current]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-3xl bg-kore-card border-t border-kore p-5 shadow-2xl"
          >
            <div className="mx-auto w-12 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mb-4" />
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted font-semibold">
                  Entregar em
                </p>
                <h2 className="text-lg font-extrabold text-kore">
                  Alterar endereço
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-2xl bg-kore-bg border border-kore flex items-center justify-center"
                aria-label="Fechar"
              >
                <X size={16} className="text-kore" />
              </button>
            </div>

            <div className="relative">
              <MapPin
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Digite o endereço de entrega"
                className="w-full rounded-2xl bg-kore-bg border border-kore pl-10 pr-3 py-3 text-sm font-medium text-kore focus:outline-none focus:ring-2 ring-kore-emerald"
              />
            </div>

            <button
              onClick={() => {
                onSave(value || current);
                onClose();
              }}
              className="mt-3 w-full rounded-2xl bg-kore-emerald text-white font-bold py-3 flex items-center justify-center gap-1.5 active:scale-[0.98] transition shadow-sm shadow-emerald-500/20"
            >
              <Navigation size={16} />
              Usar este endereço
            </button>

            <p className="text-[11px] uppercase tracking-wider text-muted font-semibold mt-5 mb-2">
              Sugestões
            </p>
            <ul className="space-y-1.5 max-h-56 overflow-y-auto">
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button
                    onClick={() => {
                      onSave(s);
                      onClose();
                    }}
                    className="w-full text-left rounded-2xl border border-kore bg-kore-bg/40 hover:bg-kore-bg px-3 py-2.5 flex items-center gap-2 transition"
                  >
                    <MapPin
                      size={16}
                      className="text-kore-emerald flex-shrink-0"
                    />
                    <span className="text-sm text-kore truncate">{s}</span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
