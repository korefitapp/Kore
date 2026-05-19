"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  LifeBuoy,
  LineChart,
  Megaphone,
  ScaleIcon,
  Settings,
  Shield,
  Store,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { SidebarUserCard } from "@/components/SidebarUserCard";
import { OWNER } from "./data";
import { useAdmin } from "./store";
import type { SidebarKey } from "./types";

interface Item {
  key: SidebarKey;
  label: string;
  Icon: typeof Users;
  badge?: number;
}

const PRIMARY: Item[] = [
  { key: "overview", label: "Visão Geral", Icon: LayoutDashboard },
  { key: "users", label: "Usuários", Icon: Users, badge: 8247 },
  { key: "professionals", label: "Profissionais", Icon: UserCheck, badge: 23 },
  { key: "marketplace", label: "Marketplace", Icon: Store },
  { key: "disputes", label: "Disputas", Icon: ScaleIcon, badge: 4 },
];

const SECONDARY: Item[] = [
  { key: "finance", label: "Financeiro", Icon: Wallet },
  { key: "growth", label: "Growth", Icon: LineChart },
  { key: "settings", label: "Configurações", Icon: Settings },
];

export function Sidebar() {
  const section = useAdmin((s) => s.section);
  const setSection = useAdmin((s) => s.setSection);

  return (
    <aside className="hidden lg:flex flex-col w-[252px] flex-shrink-0 self-start sticky top-0 h-screen border-r border-kore-border bg-kore-card/60 backdrop-blur-sm">
      <div className="px-5 pt-6 pb-5 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-2xl grid place-items-center text-white font-black text-base shadow-kore-emerald"
          style={{
            background:
              "linear-gradient(135deg, rgb(var(--kore-emerald)) 0%, rgb(var(--kore-emerald-deep)) 100%)",
          }}
        >
          K
        </div>
        <div className="leading-tight">
          <p className="text-[10px] uppercase tracking-[0.18em] text-kore-muted font-bold flex items-center gap-1.5">
            <Shield size={10} strokeWidth={2.5} /> Super Admin
          </p>
          <p className="font-extrabold text-kore-ink text-lg tracking-tight">
            KORE
          </p>
        </div>
      </div>

      <nav className="px-3 flex-1 overflow-y-auto">
        <p className="px-3 mt-2 text-[10px] uppercase tracking-[0.18em] text-kore-muted font-bold mb-2">
          Operação
        </p>
        <ul className="space-y-1">
          {PRIMARY.map((it) => (
            <NavItem
              key={it.key}
              item={it}
              active={section === it.key}
              onClick={() => setSection(it.key)}
            />
          ))}
        </ul>

        <p className="px-3 mt-6 text-[10px] uppercase tracking-[0.18em] text-kore-muted font-bold mb-2">
          Plataforma
        </p>
        <ul className="space-y-1">
          {SECONDARY.map((it) => (
            <NavItem
              key={it.key}
              item={it}
              active={section === it.key}
              onClick={() => setSection(it.key)}
            />
          ))}
        </ul>
      </nav>

      <div className="p-3 space-y-3">
        <button
          type="button"
          className="w-full flex items-center gap-2 text-xs font-semibold text-kore-muted hover:text-kore-ink px-3 py-2 rounded-xl hover:bg-kore-bg transition"
        >
          <Megaphone size={15} /> Status da plataforma
        </button>
        <button
          type="button"
          className="w-full flex items-center gap-2 text-xs font-semibold text-kore-muted hover:text-kore-ink px-3 py-2 rounded-xl hover:bg-kore-bg transition"
        >
          <LifeBuoy size={15} /> Documentação interna
        </button>

        <SidebarUserCard
          name={OWNER.name}
          subtitle={OWNER.role}
          avatar={OWNER.avatar}
        />
      </div>
    </aside>
  );
}

function NavItem({
  item,
  active,
  onClick,
}: {
  item: Item;
  active: boolean;
  onClick: () => void;
}) {
  const { Icon, label, badge } = item;
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
          active
            ? "text-kore-ink bg-kore-emerald-soft"
            : "text-kore-subink hover:text-kore-ink hover:bg-kore-bg"
        }`}
      >
        {active && (
          <motion.span
            layoutId="admin-sidebar-active"
            className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-kore-emerald"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
        <Icon
          size={17}
          strokeWidth={2.2}
          className={active ? "text-kore-emerald-deep" : ""}
        />
        <span className="flex-1 text-left">{label}</span>
        {badge !== undefined && (
          <span
            className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${
              active
                ? "bg-kore-emerald text-white"
                : "bg-kore-bg text-kore-muted"
            }`}
          >
            {badge > 999 ? `${(badge / 1000).toFixed(1)}k` : badge}
          </span>
        )}
      </button>
    </li>
  );
}
