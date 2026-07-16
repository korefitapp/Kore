"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  LifeBuoy,
  MessageSquare,
  Settings,
  Users,
  Wallet,
  Dumbbell,
} from "lucide-react";
import { MobileNavDrawer } from "@/components/MobileNavDrawer";
import { SidebarUserCard } from "@/components/SidebarUserCard";
import { OWNER } from "./data";
import { usePersonal } from "./store";
import type { SidebarKey } from "./types";
import { HelpCenterModal } from "./HelpCenterModal";

interface Item {
  key: SidebarKey;
  label: string;
  href: string;
  Icon: typeof Users;
  badge?: number;
}

const WORKSPACE: Item[] = [
  { key: "overview", label: "Visão Geral", href: "/dashboard/personal", Icon: LayoutDashboard },
  { key: "students", label: "Alunos", href: "/dashboard/personal/students", Icon: Users },
  { key: "workouts", label: "Treinos", href: "/dashboard/personal/workouts", Icon: Dumbbell },
  { key: "library", label: "Biblioteca de Exercícios", href: "/dashboard/personal/library", Icon: BookOpen },
  { key: "agenda", label: "Agenda", href: "/dashboard/personal/agenda", Icon: CalendarDays },
  { key: "messages", label: "Mensagens", href: "/dashboard/personal/messages", Icon: MessageSquare },
];

const ACCOUNT: Item[] = [
  { key: "finance", label: "Financeiro", href: "/dashboard/personal/financial", Icon: Wallet },
  { key: "settings", label: "Configurações", href: "/dashboard/personal/settings", Icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-[248px] flex-shrink-0 self-start sticky top-0 h-screen border-r border-kore-border bg-kore-card/60 backdrop-blur-sm">
      <SidebarBody />
    </aside>
  );
}

export function MobileSidebar() {
  const open = usePersonal((s) => s.mobileNavOpen);
  const setOpen = usePersonal((s) => s.setMobileNavOpen);
  return (
    <MobileNavDrawer
      open={open}
      onClose={() => setOpen(false)}
      label="Menu do Personal"
    >
      <SidebarBody onItemClick={() => setOpen(false)} />
    </MobileNavDrawer>
  );
}

function SidebarBody({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();
  const setSection = usePersonal((s) => s.setSection);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [counts, setCounts] = useState({ students: 0, messages: 0 });

  useEffect(() => {
    import("@/app/actions/personal-actions").then((mod) => {
      mod.getSidebarCounts().then(setCounts);
    });
  }, []);

  const isActive = (item: Item) => {
    if (item.href === "/dashboard/personal") {
      return pathname === "/dashboard/personal";
    }
    return pathname.startsWith(item.href);
  };

  const handle = (k: SidebarKey) => {
    setSection(k);
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
            Coach Dashboard
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
            if (it.key === "students") badgeCount = counts.students;
            if (it.key === "messages") badgeCount = counts.messages;
            
            return (
              <NavItem
                key={it.key}
                item={{ ...it, badge: badgeCount > 0 ? badgeCount : undefined }}
                active={isActive(it)}
                onClick={() => handle(it.key)}
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
              active={isActive(it)}
              onClick={() => handle(it.key)}
            />
          ))}
        </ul>
      </nav>

      <div className="p-3 space-y-3">
        <button
          type="button"
          onClick={() => setIsHelpOpen(true)}
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

      <HelpCenterModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
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
  const { Icon, label, badge, href } = item;
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
          active
            ? "text-kore-ink bg-kore-emerald-soft"
            : "text-kore-subink hover:text-kore-ink hover:bg-kore-bg"
        }`}
      >
        {active && (
          <motion.span
            layoutId="personal-sidebar-active"
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
      </Link>
    </li>
  );
}
