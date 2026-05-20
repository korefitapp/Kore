"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, MessageSquare, Smartphone } from "lucide-react";
import { useKore } from "../../store";

interface NotifSetting {
  id: string;
  label: string;
  description: string;
  icon: typeof Bell;
  color: string;
  bgColor: string;
}

const SETTINGS: NotifSetting[] = [
  {
    id: "lembretes",
    label: "Lembretes",
    description: "Notificações de treino, refeições e hidratação",
    icon: Bell,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  {
    id: "mensagens",
    label: "Mensagens",
    description: "Mensagens do seu nutricionista e personal trainer",
    icon: MessageSquare,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-500/10",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    description: "Receber resumos e lembretes via WhatsApp",
    icon: Smartphone,
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-500/10",
  },
];

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-12 h-7 rounded-full transition-colors duration-200 flex-shrink-0 ${
        on ? "bg-emerald-500" : "bg-kore-border"
      }`}
      aria-pressed={on}
    >
      <motion.span
        layout
        className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm"
        animate={{ x: on ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

export function NotificationsView() {
  const setProfileView = useKore((s) => s.setProfileView);
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    lembretes: true,
    mensagens: true,
    whatsapp: false,
  });

  function toggle(id: string) {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      <header className="flex items-center gap-3">
        <button
          onClick={() => setProfileView("menu")}
          className="w-10 h-10 rounded-2xl border border-kore bg-kore-card flex items-center justify-center active:scale-95 transition"
        >
          <ArrowLeft size={18} className="text-kore" />
        </button>
        <div>
          <p className="text-xs text-muted">Perfil</p>
          <h1 className="text-xl font-extrabold text-kore tracking-tight">
            Notificações
          </h1>
        </div>
      </header>

      <section className="rounded-3xl border border-kore bg-kore-card p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Bell size={26} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-kore">Preferências</h2>
            <p className="text-sm text-muted">
              Escolha como deseja receber suas notificações
            </p>
          </div>
        </div>
      </section>

      <div className="space-y-3">
        {SETTINGS.map((setting) => {
          const Icon = setting.icon;
          return (
            <motion.div
              key={setting.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-kore bg-kore-card p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl ${setting.bgColor} ${setting.color} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-kore text-sm">
                    {setting.label}
                  </p>
                  <p className="text-[11px] text-muted leading-snug">
                    {setting.description}
                  </p>
                </div>
                <Toggle
                  on={toggles[setting.id] ?? false}
                  onToggle={() => toggle(setting.id)}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}