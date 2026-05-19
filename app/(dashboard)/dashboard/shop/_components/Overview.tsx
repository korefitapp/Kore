"use client";

import { motion } from "framer-motion";
import { OWNER } from "./data";
import { InventoryAlerts } from "./InventoryAlerts";
import { KpiGrid } from "./KpiGrid";
import { OrdersTable } from "./OrdersTable";
import { TopProducts } from "./TopProducts";
import { WeeklyRevenueChart } from "./WeeklyRevenueChart";

export function Overview({ shopName }: { shopName: string }) {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-[1440px] mx-auto">
      <Header shopName={shopName} />
      <KpiGrid />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <OrdersTable />
          <WeeklyRevenueChart />
        </div>
        <div className="space-y-6">
          <InventoryAlerts />
          <TopProducts />
        </div>
      </div>
    </div>
  );
}

function Header({ shopName }: { shopName: string }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const firstName = shopName.split(" ")[0] ?? OWNER.name.split(" ")[0];

  return (
    <motion.header
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className="flex items-end justify-between gap-4 flex-wrap"
    >
      <div>
        <p className="text-xs text-kore-muted font-semibold">
          {greeting}, {firstName} 👋
        </p>
        <h1 className="text-3xl font-extrabold text-kore-ink tracking-tight mt-0.5">
          Você tem <span className="text-kore-emerald-deep">12 pedidos</span>{" "}
          aguardando preparo
        </h1>
        <p className="text-sm text-kore-muted mt-1">
          Resumo da loja · 27 pedidos hoje ·{" "}
          <span className="font-semibold text-kore-subink">⭐ 4.88</span> de
          avaliação média
        </p>
      </div>
    </motion.header>
  );
}
