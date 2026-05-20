"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  Boxes,
  LayoutDashboard,
  LifeBuoy,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  Tag,
  Users,
  Wallet,
} from "lucide-react";
import { MobileNavDrawer } from "@/components/MobileNavDrawer";
import { SidebarUserCard } from "@/components/SidebarUserCard";
import { OWNER } from "./data";
import { useShop } from "./store";

interface Item {
  key: string;
  label: string;
  href: string;
  Icon: typeof Package;
  badge?: number;
}

const WORKSPACE: Item[] = [
  { key: "overview", label: "Visão Geral", href: "/dashboard/shop", Icon: LayoutDashboard },
  { key: "orders", label: "Pedidos", href: "/dashboard/shop/orders", Icon: ShoppingBag, badge: 12 },
  { key: "products", label: "Produtos", href: "/dashboard/shop/products", Icon: BookOpen },
  { key: "inventory", label: "Estoque", href: "/dashboard/shop/inventory", Icon: Boxes, badge: 6 },
  { key: "promotions", label: "Promoções", href: "/dashboard/shop/promotions", Icon: Tag },
  { key: "customers", label: "Clientes", href: "/dashboard/shop/customers", Icon: Users },
  { key: "messages", label: "Mensagens", href: "/dashboard/shop/messages", Icon: MessageSquare, badge: 9 },
];

const ACCOUNT: Item[] = [
  { key: "finance", label: "Financeiro", href: "/dashboard/shop/financial", Icon: Wallet },
  { key: "settings", label: "Configurações", href: "/dashboard/shop/settings", Icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-[248px] flex-shrink-0 self-start sticky top-0 h-screen border-r border-kore-border bg-kore-card/60 backdrop-blur-sm">
      <SidebarBody />
    </aside>
  );
}

export function MobileSidebar() {
  const open = useShop((s) => s.mobileNavOpen);
  const setOpen = useShop((s) => s.setMobileNavOpen);
  return (
    <MobileNavDrawer
      open={open}
      onClose={() => setOpen(false)}
      label="Menu do Lojista"
    >
      <SidebarBody onItemClick={() => setOpen(false)} />
    </MobileNavDrawer>
  );
}

function SidebarBody({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard/shop") {
      return pathname === "/dashboard/shop";
    }
    return pathname.startsWith(href);
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
            Shop Dashboard
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
          {WORKSPACE.map((it) => (
            <NavItem
              key={it.key}
              item={it}
              active={isActive(it.href)}
              onClick={onItemClick}
            />
          ))}
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
              onClick={onItemClick}
            />
          ))}
        </ul>
      </nav>

      <div className="p-3 space-y-3">
        <button
          type="button"
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
  onClick?: () => void;
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
            layoutId="shop-sidebar-active"
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