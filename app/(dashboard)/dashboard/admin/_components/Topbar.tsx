"use client";

import { Bell, Command, Menu, Search, ShieldAlert } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAdmin } from "./store";
import { useState } from "react";
import { NotificationsSheet } from "@/components/NotificationsSheet";

export function Topbar() {
  const setMobileNavOpen = useAdmin((s) => s.setMobileNavOpen);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-kore-border bg-kore-card/70 backdrop-blur-md">
      <div className="h-14 sm:h-16 px-3 sm:px-6 flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Abrir menu"
          className="lg:hidden w-10 h-10 grid place-items-center rounded-xl border border-kore-border bg-kore-card text-kore-subink hover:border-kore-emerald/60 hover:text-kore-ink transition"
        >
          <Menu size={18} />
        </button>

        <div className="relative flex-1 max-w-xl">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-kore-muted"
          />
          <input
            type="search"
            placeholder="Buscar usuário, profissional, pedido ou disputa…"
            className="w-full h-10 pl-10 pr-3 sm:pr-16 rounded-xl bg-kore-bg border border-kore-border text-sm text-kore-ink placeholder:text-kore-muted focus:outline-none focus:border-kore-emerald/60 focus:ring-2 focus:ring-kore-emerald/15 transition"
          />
          <span className="hidden sm:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center gap-1 text-[10px] font-bold text-kore-muted bg-kore-card border border-kore-border rounded-md px-1.5 py-0.5">
            <Command size={10} /> K
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            className="hidden md:inline-flex btn-ghost text-sm"
          >
            <ShieldAlert size={15} className="text-amber-500" />
            <span>Painel de incidentes</span>
            <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/15 text-amber-600 text-[10px] font-bold">
              2
            </span>
          </button>

          <ThemeToggle />

          <button
            type="button"
            onClick={() => setIsNotificationsOpen(true)}
            aria-label="Notificações"
            className="relative w-10 h-10 grid place-items-center rounded-xl border border-kore-border bg-kore-card text-kore-subink hover:border-kore-emerald/60 hover:text-kore-ink transition"
          >
            <Bell size={16} />
            <span className="absolute -top-1 -right-1 w-4 h-4 grid place-items-center rounded-full bg-red-500 text-white text-[9px] font-bold ring-2 ring-kore-card">
              5
            </span>
          </button>
        </div>
      </div>
      
      <NotificationsSheet
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </header>
  );
}
