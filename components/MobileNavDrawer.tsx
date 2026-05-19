"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  label?: string;
}

export function MobileNavDrawer({
  open,
  onClose,
  children,
  label = "Menu de navegação",
}: MobileNavDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div
      aria-hidden={!open}
      className={`lg:hidden fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
    >
      <button
        type="button"
        aria-label="Fechar menu"
        onClick={onClose}
        className={`absolute inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`absolute inset-y-0 left-0 w-[280px] max-w-[85vw] bg-kore-card border-r border-kore-border shadow-2xl flex flex-col transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar menu"
          className="absolute top-3 right-3 z-10 w-9 h-9 grid place-items-center rounded-xl border border-kore-border bg-kore-card/80 text-kore-subink hover:text-kore-ink hover:border-kore-emerald/60 transition"
        >
          <X size={16} />
        </button>
        {children}
      </aside>
    </div>
  );
}
