"use client";

import { motion } from "framer-motion";
import {
  Dumbbell,
  Home,
  ShoppingBag,
  User,
  UtensilsCrossed,
} from "lucide-react";
import { useKore } from "./store";
import type { Tab } from "./types";

const tabs: { id: Tab; label: string; Icon: typeof Home }[] = [
  { id: "home", label: "Início", Icon: Home },
  { id: "dieta", label: "Dieta", Icon: UtensilsCrossed },
  { id: "treino", label: "Treino", Icon: Dumbbell },
  { id: "shop", label: "Shop", Icon: ShoppingBag },
  { id: "perfil", label: "Perfil", Icon: User },
];

export function BottomNav() {
  const tab = useKore((s) => s.tab);
  const setTab = useKore((s) => s.setTab);
  const setProfileView = useKore((s) => s.setProfileView);

  return (
    <nav className="sticky bottom-0 left-0 right-0 z-30 bg-kore-card border-t border-kore">
      <div className="mx-auto max-w-md grid grid-cols-5 px-2 pt-2 pb-3">
        {tabs.map(({ id, label, Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => {
                setTab(id);
                if (id === "perfil") setProfileView("menu");
              }}
              className="relative flex flex-col items-center justify-center gap-1 py-1.5"
            >
              {active && (
                <motion.span
                  layoutId="navPill"
                  className="absolute inset-x-2 inset-y-1 rounded-2xl bg-kore-emerald/10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                className={`relative z-10 transition-colors ${
                  active ? "text-kore-emerald" : "text-muted"
                }`}
                size={22}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={`relative z-10 text-[11px] font-medium transition-colors ${
                  active ? "text-kore-emerald" : "text-muted"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
