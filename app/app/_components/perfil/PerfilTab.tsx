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
          className="bg-slate-50 dark:bg-[#121212] min-h-[100dvh] text-slate-900 dark:text-white -mx-4 -mt-4 px-5 pt-8 overflow-y-auto pb-24 space-y-5"
        >
          <header className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Profile
              </h1>
            </div>
          </header>

          <section className="rounded-[28px] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 dark:bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
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
              <div className="min-w-0 flex-1 relative z-10">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white truncate">
                  {user.name}
                </h2>
                <p className="text-sm text-slate-500 dark:text-zinc-400 truncate flex items-center gap-1.5">
                  <Mail size={13} /> {user.email}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium tracking-wide mt-0.5">
                  Membro desde {user.memberSince}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 text-center relative z-10">
              <div className="rounded-[20px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 py-3 shadow-sm dark:shadow-none">
                <p className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold mb-0.5">
                  Streak
                </p>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white">🔥 {streak}</p>
              </div>
              <div className="rounded-[20px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 py-3 shadow-sm dark:shadow-none">
                <p className="text-[10px] uppercase tracking-wider text-purple-600 dark:text-purple-400 font-bold mb-0.5">
                  Treinos
                </p>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white">128</p>
              </div>
              <div className="rounded-[20px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 py-3 shadow-sm dark:shadow-none">
                <p className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold mb-0.5">
                  Conquistas
                </p>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white">17</p>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden shadow-sm">
            {ITEMS.map((it, i) => (
              <button
                key={it.id}
                onClick={() => setProfileView(it.id)}
                className={`w-full flex items-center gap-4 px-4 py-4 text-left active:bg-slate-50 dark:active:bg-white/5 transition-colors ${
                  i !== ITEMS.length - 1 ? "border-b border-slate-100 dark:border-white/5" : ""
                }`}
              >
                <span
                  className={`w-12 h-12 rounded-[20px] ${it.bg} ${it.tint} flex items-center justify-center flex-shrink-0 shadow-inner`}
                >
                  <it.Icon size={20} />
                </span>
                <span className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white text-[15px]">{it.label}</p>
                  {it.hint && (
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">{it.hint}</p>
                  )}
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                  <ChevronRight size={18} className="text-slate-400 dark:text-zinc-500" />
                </div>
              </button>
            ))}
          </section>

          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full rounded-[24px] border border-rose-500/20 bg-rose-500/10 text-rose-500 font-extrabold py-4 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-[0_0_15px_rgba(244,63,94,0.1)]"
            >
              <LogOut size={18} />
              SAIR DA CONTA
            </button>
          </form>

          <p className="text-center text-[10px] uppercase font-bold tracking-widest text-zinc-600 pb-2">
            PulseUp Fitness · v1.0.0
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}