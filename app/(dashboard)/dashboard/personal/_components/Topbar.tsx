"use client";

import { Bell, Plus, Search } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Topbar() {
  return (
    <header className="sticky top-0 z-20 bg-kore-bg/85 backdrop-blur supports-[backdrop-filter]:bg-kore-bg/70 border-b border-kore-border">
      <div className="flex items-center gap-3 px-6 lg:px-8 py-3.5">
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted"
            />
            <input
              type="search"
              placeholder="Buscar aluno, exercício ou ficha…"
              className="w-full pl-9 pr-14 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:ring-2 focus:ring-kore-emerald/40 focus:border-kore-emerald transition"
            />
            <kbd className="hidden lg:inline-flex absolute right-2 top-1/2 -translate-y-1/2 items-center text-[10px] font-bold text-kore-muted bg-kore-bg border border-kore-border rounded px-1.5 py-0.5">
              ⌘K
            </kbd>
          </div>
        </div>
        <div className="flex-1 md:hidden" />
        <div className="flex items-center gap-2">
          <button type="button" className="btn-emerald text-sm px-4 py-2">
            <Plus size={16} strokeWidth={2.8} />
            <span className="hidden sm:inline">Montar Novo Treino</span>
            <span className="sm:hidden">Novo</span>
          </button>

          <ThemeToggle />

          <button
            type="button"
            aria-label="Notificações"
            className="relative w-10 h-10 rounded-xl bg-kore-card border border-kore-border flex items-center justify-center text-kore-subink hover:text-kore-ink hover:border-kore-emerald/60 active:scale-95 transition"
          >
            <Bell size={16} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-kore-card" />
          </button>
        </div>
      </div>
    </header>
  );
}
