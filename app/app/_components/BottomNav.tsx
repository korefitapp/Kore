"use client";

import { motion } from "framer-motion";
import {
  Dumbbell,
  Home,
  ShoppingCart,
  User,
  UtensilsCrossed,
} from "lucide-react";
import { useKore } from "./store";
import type { Tab } from "./types";

const tabs: { id: Tab; label: string; Icon: any }[] = [
  { id: "home", label: "Home", Icon: Home },
  { id: "treino", label: "Treino", Icon: Dumbbell },
  { id: "dieta", label: "Nutrição", Icon: UtensilsCrossed },
  { id: "shop", label: "Loja", Icon: ShoppingCart },
  { id: "perfil", label: "Perfil", Icon: User },
];

export function BottomNav() {
  const tab = useKore((s) => s.tab);
  const setTab = useKore((s) => s.setTab);
  const setProfileView = useKore((s) => s.setProfileView);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 pb-safe">
      <div className="mx-auto max-w-md flex items-center justify-between px-6 py-4 relative">
        {tabs.map(({ id, label, Icon }) => {
          const active = tab === id;

          return (
            <button
              key={id}
              onClick={() => {
                setTab(id);
                if (id === "perfil") setProfileView("menu");
              }}
              className="relative flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform min-w-[50px]"
            >
              <Icon
                className={`relative z-10 transition-colors ${
                  active ? "text-emerald-600 dark:text-[#34d399]" : "text-slate-400 dark:text-zinc-500"
                }`}
                size={22}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={`text-[9px] font-extrabold uppercase tracking-widest transition-colors ${
                  active ? "text-emerald-600 dark:text-white" : "text-slate-400 dark:text-zinc-500"
                }`}
              >
                {label}
              </span>
              {active && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute -top-3 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
