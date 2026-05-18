"use client";

import { motion } from "framer-motion";
import { Bell, Moon, Sun } from "lucide-react";
import { useKore } from "../store";
import { MacrosCard } from "./MacrosCard";
import { StreakCalendar } from "./StreakCalendar";
import { TrainingCard } from "./TrainingCard";
import { WaterBar } from "./WaterBar";

const WEEK_DAYS_PT = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];
const MONTHS_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function formatTodayPt(): string {
  const d = new Date();
  const weekday = WEEK_DAYS_PT[d.getDay()] ?? "";
  const day = d.getDate();
  const month = MONTHS_PT[d.getMonth()] ?? "";
  return `${weekday}, ${day} ${month}`;
}

export function HomeTab() {
  const user = useKore((s) => s.user);
  const theme = useKore((s) => s.theme);
  const toggleTheme = useKore((s) => s.toggleTheme);

  const firstName = user.name.split(" ")[0] ?? user.name;
  const today = formatTodayPt();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted">{today}</p>
          <h1 className="text-2xl font-extrabold text-kore tracking-tight truncate flex items-center gap-1.5">
            <span>Olá,</span>
            <span className="text-kore-emerald">{firstName}</span>
            <span aria-hidden>👋</span>
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
