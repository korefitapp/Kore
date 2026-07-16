"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
  Apple,
  CalendarDays,
  Database,
  LayoutDashboard,
  LifeBuoy,
  MessageSquare,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import { MobileNavDrawer } from "@/components/MobileNavDrawer";
import { SidebarUserCard } from "@/components/SidebarUserCard";
import { HelpCenterModal } from "../../personal/_components/HelpCenterModal";
import { OWNER } from "./data";
import { useNutri } from "./store";
import type { SidebarKey } from "./types";

interface Item {
  key: SidebarKey;
  label: string;
  Icon: typeof Users;
  href: string;
  badge?: number;
}

import { getSidebarCounts } from "@/app/actions/nutri-actions";

const ACCOUNT: Item[] = [
  { key: "finance", label: "Financeiro", Icon: Wallet, href: "/dashboard/nutri/financial" },
  { key: "settings", label: "Configurações", Icon: Settings, href: "/dashboard/nutri/settings" },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-[248px] flex-shrink-0 self-start sticky top-0 h-screen border-r border-kore-border bg-kore-card/60 backdrop-blur-sm">
      <SidebarBody />
    </aside>
  );
}

export function MobileSidebar() {
  const open = useNutri((s) => s.mobileNavOpen);
  const setOpen = useNutri((s) => s.setMobileNavOpen);
  return (
    <MobileNavDrawer
      open={open}
      onClose={() => setOpen(false)}
      label="Menu do Nutricionista"
    >
      <SidebarBody onItemClick={() => setOpen(false)} />
    </MobileNavDrawer>
  );
}

function SidebarBody({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const setSection = useNutri((s) => s.setSection);
  const [helpOpen, setHelpOpen] = useState(false);
  const [counts, setCounts] = useState({ patients: 0, messages: 0 });

  useEffect(() => {
    getSidebarCounts().then(setCounts).catch(() => {});
  }, []);

  const WORKSPACE: Item[] = [
    { key: "overview", label: "Visão Geral", Icon: LayoutDashboard, href: "/dashboard/nutri" },
    { key: "patients", label: "Pacientes", Icon: Users, href: "/dashboard/nutri/patients" },
    { key: "meal-plans", label: "Cardápios", Icon: Apple, href: "/dashboard/nutri/meal-plans" },
    { key: "food-bank", label: "Banco de alimentos", Icon: Database, href: "/dashboard/nutri/food-database" },
    { key: "consultations", label: "Consultas", Icon: CalendarDays, href: "/dashboard/nutri/appointments" },
    { key: "messages", label: "Mensagens", Icon: MessageSquare, href: "/dashboard/nutri/messages" },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard/nutri") {
      return pathname === "/dashboard/nutri";
    }
    return pathname.startsWith(href);
  };

  const handle = (item: Item) => {
    setSection(item.key);
    router.push(item.href);
    onItemClick?.();
  };

  return (
    <>
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
          <p className="text-[10px] uppercase tracking-[0.18em] text-kore-muted font-bold">
            Nutri Dashboard
          </p>
          <p className="font-extrabold text-kore-ink text-lg tracking-tight">
            KORE
          </p>
        </div>
      </div>

      <nav className="px-3 flex-1 overflow-y-auto">
        <p className="px-3 mt-2 text-[10px] uppercase tracking-[0.18em] text-kore-muted font-bold mb-2">
          Workspace
        </p>
        <ul className="space-y-1">
          {WORKSPACE.map((it) => {
            let badgeCount = 0;
            if (it.key === "patients") badgeCount = counts.patients;
            if (it.key === "messages") badgeCount = counts.messages;
            
            return (
              <NavItem
                key={it.key}
                item={{ ...it, badge: badgeCount > 0 ? badgeCount : undefined }}
                active={isActive(it.href)}
                onClick={() => handle(it)}
              />
            );
          })}
        </ul>

        <p className="px-3 mt-6 text-[10px] uppercase tracking-[0.18em] text-kore-muted font-bold mb-2">
          Conta
        </p>
        <ul className="space-y-1">
          {ACCOUNT.map((it) => (
            <NavItem
              key={it.key}
              item={it}
              active={isActive(it.href)}
              onClick={() => handle(it)}
            />
          ))}
        </ul>
      </nav>

      <div className="p-3 space-y-3">
        <button
          type="button"
          onClick={() => setHelpOpen(true)}
          className="w-full flex items-center gap-2 text-xs font-semibold text-kore-muted hover:text-kore-ink px-3 py-2 rounded-xl hover:bg-kore-bg transition"
        >
          <LifeBuoy size={15} /> Centro de ajuda
        </button>

        <SidebarUserCard
          name={OWNER.name}
          subtitle={OWNER.registry}
          avatar={OWNER.avatar}
        />
      </div>

      <HelpCenterModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
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
            layoutId="nutri-sidebar-active"
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
            {badge}
          </span>
        )}
      </button>
    </li>
  );
}
