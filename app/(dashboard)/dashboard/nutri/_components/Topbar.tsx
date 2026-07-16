"use client";

import { useState } from "react";
import { Bell, Menu, Plus, Search } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNutri } from "./store";
import { CreatePatientModal } from "./CreatePatientModal";
import { NotificationsSheet } from "@/components/NotificationsSheet";

export function Topbar() {
  const setMobileNavOpen = useNutri((s) => s.setMobileNavOpen);
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-kore-bg/85 backdrop-blur supports-[backdrop-filter]:bg-kore-bg/70 border-b border-kore-border">
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 lg:px-8 py-3 sm:py-3.5">
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Abrir menu"
          className="lg:hidden w-10 h-10 grid place-items-center rounded-xl border border-kore-border bg-kore-card text-kore-subink hover:border-kore-emerald/60 hover:text-kore-ink transition"
        >
          <Menu size={18} />
        </button>

        <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted"
            />
            <input
              type="search"
              placeholder="Buscar paciente, alimento ou cardápio…"
              className="w-full pl-9 pr-14 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:ring-2 focus:ring-kore-emerald/40 focus:border-kore-emerald transition"
            />
            <kbd className="hidden lg:inline-flex absolute right-2 top-1/2 -translate-y-1/2 items-center text-[10px] font-bold text-kore-muted bg-kore-bg border border-kore-border rounded px-1.5 py-0.5">
              ⌘K
            </kbd>
          </div>
        </div>
        <div className="flex-1 md:hidden" />
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setPatientModalOpen(true)}
            className="btn-emerald text-sm px-3 sm:px-4 py-2"
          >
            <Plus size={16} strokeWidth={2.8} />
            <span className="hidden sm:inline">Novo Paciente</span>
            <span className="sm:hidden">Novo</span>
          </button>

          <ThemeToggle />

          <button
            type="button"
            onClick={() => setNotificationsOpen(true)}
            aria-label="Notificações"
            className="relative w-10 h-10 rounded-xl bg-kore-card border border-kore-border flex items-center justify-center text-kore-subink hover:text-kore-ink hover:border-kore-emerald/60 active:scale-95 transition"
          >
            <Bell size={16} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-kore-card" />
          </button>
        </div>
      </div>

      <CreatePatientModal
        open={patientModalOpen}
        onOpenChange={setPatientModalOpen}
      />
      <NotificationsSheet
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </header>
  );
}
