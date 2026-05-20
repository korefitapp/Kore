"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  ChevronRight,
  ClipboardList,
  HeartPulse,
  LogOut,
  Mail,
  Settings,
  ShieldCheck,
  Star,
} from "lucide-react";
import { signOutAction } from "@/lib/auth/actions";
import { useKore } from "../store";
import type { ProfileView } from "../store";
import { HealthView } from "./views/HealthView";
import { OrdersView } from "./views/OrdersView";
import { NotificationsView } from "./views/NotificationsView";
import { PrivacyView } from "./views/PrivacyView";
import { SettingsView } from "./views/SettingsView";

interface MenuItem {
  id: ProfileView;
  label: string;
  hint?: string;
  Icon: typeof Bell;
  tint: string;
  bg: string;
}

const ITEMS: MenuItem[] = [
  {
    id: "health",
    label: "Dados de Saúde",
    hint: "Peso, altura, condições e objetivos",
    Icon: HeartPulse,
    tint: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-500/10",
  },
  {
    id: "orders",
    label: "Histórico de Pedidos",
    hint: "Compras no marketplace e assinaturas",
    Icon: ClipboardList,
    tint: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
  },
  {
    id: "notifications",
    label: "Notificações",
    hint: "Lembretes, streaks e WhatsApp",
    Icon: Bell,
    tint: "text-sky-500",
    bg: "bg-sky-50 dark:bg-sky-500/10",
  },
  {
    id: "privacy",
    label: "Privacidade & LGPD",
    hint: "Permissões de dados e exportação",
    Icon: ShieldCheck,
    tint: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  {
    id: "settings",
    label: "Configurações",
    hint: "Idioma, unidades, tema e mais",
    Icon: Settings,
    tint: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-500/10",
  },
];

const VIEW_MAP: Record<ProfileView, React.ComponentType | null> = {
  menu: null,
  health: HealthView,
  orders: OrdersView,
  notifications: NotificationsView,
  privacy: PrivacyView,
  settings: SettingsView,
};

export function PerfilTab() {
  const user = useKore((s) => s.user);
  const streak = useKore((s) => s.streak);
  const profileView = useKore((s) => s.profileView);
  const setProfileView = useKore((s) => s.setProfileView);

  const ActiveView = VIEW_MAP[profileView];

  return (
    <AnimatePresence mode="wait">
      {ActiveView ? (
        <ActiveView key={profileView} />
      ) : (
        <motion.div
          key="menu"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="space-y-5"
        >
          <header>
            <p className="text-xs text-muted">Minha conta</p>
            <h1 className="text-2xl font-extrabold text-kore tracking-tight">
              Perfil
            </h1>
          </header>

          <section className="rounded-3xl border border-kore bg-kore-card p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <motion.div
                whileTap={{ scale: 0.96 }}
                className="relative w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-lg shadow-emerald-500/30"
                style={{
                  background:
                    "linear-gradient(135deg, rgb(var(--kore-emerald)) 0%, rgb(var(--kore-emerald-deep)) 100%)",
                }}
              >
                <span className="drop-shadow-sm">{user.avatar}</span>
                <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-amber-400 text-amber-900 text-[10px] font-extrabold shadow flex items-center gap-0.5">
                  <Star size={10} className="fill-amber-700 text-amber-700" />
                  {user.plan}
                </span>
              </motion.div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-extrabold text-kore truncate">
                  {user.name}
                </h2>
                <p className="text-sm text-muted truncate flex items-center gap-1.5">
                  <Mail size={13} /> {user.email}
                </p>
                <p className="text-[11px] text-muted mt-0.5">
                  Membro desde {user.memberSince}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-kore-bg/60 border border-kore py-2.5">
                <p className="text-[10px] uppercase tracking-wider text-muted font-bold">
                  Streak
                </p>
                <p className="text-lg font-extrabold text-kore">🔥 {streak}</p>
              </div>
              <div className="rounded-2xl bg-kore-bg/60 border border-kore py-2.5">
                <p className="text-[10px] uppercase tracking-wider text-muted font-bold">
                  Treinos
                </p>
                <p className="text-lg font-extrabold text-kore">128</p>
              </div>
              <div className="rounded-2xl bg-kore-bg/60 border border-kore py-2.5">
                <p className="text-[10px] uppercase tracking-wider text-muted font-bold">
                  Conquistas
                </p>
                <p className="text-lg font-extrabold text-kore">17</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-kore bg-kore-card overflow-hidden">
            {ITEMS.map((it, i) => (
              <button
                key={it.id}
                onClick={() => setProfileView(it.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-kore-bg transition ${
                  i !== ITEMS.length - 1 ? "border-b border-kore" : ""
                }`}
              >
                <span
                  className={`w-10 h-10 rounded-2xl ${it.bg} ${it.tint} flex items-center justify-center flex-shrink-0`}
                >
                  <it.Icon size={18} />
                </span>
                <span className="flex-1 min-w-0">
                  <p className="font-semibold text-kore text-sm">{it.label}</p>
                  {it.hint && (
                    <p className="text-[11px] text-muted truncate">{it.hint}</p>
                  )}
                </span>
                <ChevronRight size={18} className="text-muted flex-shrink-0" />
              </button>
            ))}
          </section>

          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full rounded-3xl border border-rose-200 dark:border-rose-700/50 bg-rose-50 dark:bg-rose-500/10 text-rose-600 font-bold py-3.5 flex items-center justify-center gap-2 active:scale-[0.98] transition"
            >
              <LogOut size={18} />
              Sair da conta
            </button>
          </form>

          <p className="text-center text-[11px] text-muted pb-2">
            KORE Super App · v0.1.0 · feito com 💚
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}