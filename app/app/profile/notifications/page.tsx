"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, MessageSquare, Clock, Smartphone } from "lucide-react";
import Link from "next/link";

interface ToggleItem {
  id: string;
  label: string;
  description: string;
  icon: typeof Bell;
  tint: string;
  bg: string;
}

const TOGGLES: ToggleItem[] = [
  {
    id: "reminders",
    label: "Lembretes",
    description: "Horários de treino, refeições e metas de água",
    icon: Clock,
    tint: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
  },
  {
    id: "messages",
    label: "Mensagens",
    description: "Notificações de novas mensagens do coach e nutricionista",
    icon: MessageSquare,
    tint: "text-sky-500",
    bg: "bg-sky-50 dark:bg-sky-500/10",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    description: "Receber alertas e lembretes via WhatsApp",
    icon: Smartphone,
    tint: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
  },
];

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative w-12 h-7 rounded-full transition-colors duration-200 flex-shrink-0 ${
        checked ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function NotificationsPage() {
  const [state, setState] = useState<Record<string, boolean>>({
    reminders: true,
    messages: true,
    whatsapp: false,
  });

  function toggle(id: string) {
    setState((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen bg-kore-bg px-4 pt-4 pb-28 max-w-lg mx-auto"
    >
      {/* Header */}
      <header className="flex items-center gap-3 mb-6">
        <Link
          href="/app/profile"
          className="w-10 h-10 rounded-2xl border border-kore bg-kore-card flex items-center justify-center active:scale-95 transition"
        >
          <ArrowLeft size={18} className="text-kore" />
        </Link>
        <div>
          <p className="text-xs text-muted">Perfil</p>
          <h1 className="text-xl font-extrabold text-kore tracking-tight">
            Notificações
          </h1>
        </div>
      </header>

      {/* Icon header card */}
      <section className="rounded-3xl border border-kore bg-kore-card p-5 shadow-sm mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-500/10 text-sky-500 flex items-center justify-center">
            <Bell size={26} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-kore">
              Gerencie seus alertas
            </h2>
            <p className="text-sm text-muted">
              Escolha como e quando deseja ser notificado
            </p>
          </div>
        </div>
      </section>

      {/* Toggle list */}
      <section className="rounded-3xl border border-kore bg-kore-card overflow-hidden">
        {TOGGLES.map((item, i) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 px-4 py-4 ${
              i !== TOGGLES.length - 1 ? "border-b border-kore" : ""
            }`}
          >
            <div
              className={`w-10 h-10 rounded-2xl ${item.bg} ${item.tint} flex items-center justify-center flex-shrink-0`}
            >
              <item.icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-kore text-sm">{item.label}</p>
              <p className="text-[11px] text-muted leading-snug">
                {item.description}
              </p>
            </div>
            <Toggle
              checked={state[item.id] ?? false}
              onChange={() => toggle(item.id)}
            />
          </div>
        ))}
      </section>

      {/* Status indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-5 rounded-3xl border border-kore bg-kore-card p-4 text-center"
      >
        <p className="text-xs text-muted">
          {Object.values(state).filter(Boolean).length} de {TOGGLES.length}{" "}
          notificações ativas
        </p>
        <div className="mt-2 h-2 rounded-full bg-kore-bg overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{
              width: `${(Object.values(state).filter(Boolean).length / TOGGLES.length) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}