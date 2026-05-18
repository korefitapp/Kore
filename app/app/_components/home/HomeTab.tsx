"use client";

import { motion } from "framer-motion";
import { Bell, Moon, Sun } from "lucide-react";
import { useKore } from "../store";
import { MacrosCard } from "./MacrosCard";
import { StreakCalendar } from "./StreakCalendar";
import { TrainingCard } from "./TrainingCard";
import { WaterBar } from "./WaterBar";

export function HomeTab() {
  const user = useKore((s) => s.user);
  const theme = useKore((s) => s.theme);
  const toggleTheme = useKore((s) => s.toggleTheme);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const firstName = user.name.split(" ")[0] ?? user.name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted">{greeting},</p>
          <h1 className="text-2xl font-extrabold text-kore tracking-tight truncate flex items-center gap-1.5">
            {firstName} <span aria-hidden>👋</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-2xl bg-kore-card border border-kore flex items-center justify-center text-kore active:scale-95 transition"
            aria-label="Alternar tema"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button
            className="relative w-10 h-10 rounded-2xl bg-kore-card border border-kore flex items-center justify-center text-kore active:scale-95 transition"
            aria-label="Notificações"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[rgb(var(--kore-card))]" />
          </button>
        </div>
      </header>

      <StreakCalendar />
      <TrainingCard />
      <MacrosCard />
      <WaterBar />
    </motion.div>
  );
}
