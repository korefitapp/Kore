"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ClipboardList,
  Package,
  CheckCircle2,
  Clock,
  Truck,
} from "lucide-react";
import { useKore } from "../../store";

interface Order {
  id: string;
  product: string;
  store: string;
  date: string;
  price: string;
  status: "entregue" | "em_transito" | "processando";
  image: string;
}

const ORDERS: Order[] = [
  {
    id: "PED-20260517",
    product: "Whey Protein Isolado 1kg",
    store: "NutriShop",
    date: "17/05/2026",
    price: "R$ 149,90",
    status: "entregue",
    image: "🥛",
  },
  {
    id: "PED-20260510",
    product: "Creatina Monohidratada 300g",
    store: "FitStore",
    date: "10/05/2026",
    price: "R$ 89,90",
    status: "entregue",
    image: "💪",
  },
  {
    id: "PED-20260503",
    product: "BCAA 2:1:1 - 90 cápsulas",
    store: "NutriShop",
    date: "03/05/2026",
    price: "R$ 64,90",
    status: "em_transito",
    image: "💊",
  },
  {
    id: "PED-20260428",
    product: "Barra Proteica - Caixa 12un",
    store: "HealthBox",
    date: "28/04/2026",
    price: "R$ 119,90",
    status: "entregue",
    image: "🍫",
  },
  {
    id: "PED-20260420",
    product: "Pré-Treino Energy 300g",
    store: "FitStore",
    date: "20/04/2026",
    price: "R$ 99,90",
    status: "processando",
    image: "⚡",
  },
  {
    id: "PED-20260415",
    product: "Multivitamínico 60 caps",
    store: "HealthBox",
    date: "15/04/2026",
    price: "R$ 54,90",
    status: "entregue",
    image: "🌿",
  },
];

function StatusBadge({ status }: { status: Order["status"] }) {
  const map = {
    entregue: {
      label: "Entregue",
      icon: CheckCircle2,
      cls: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    em_transito: {
      label: "Em trânsito",
      icon: Truck,
      cls: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    processando: {
      label: "Processando",
      icon: Clock,
      cls: "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400",
    },
  };
  const cfg = map[status];
  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${cfg.cls}`}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

export function OrdersView() {
  const setProfileView = useKore((s) => s.setProfileView);

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
            Histórico de Pedidos
          </h1>
        </div>
      </header>

      <section className="rounded-3xl border border-kore bg-kore-card p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <ClipboardList size={26} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-kore">{ORDERS.length}</p>
            <p className="text-sm text-muted">pedidos realizados</p>
          </div>
        </div>
      </section>

      <div className="space-y-3">
        {ORDERS.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-3xl border border-kore bg-kore-card p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-kore-bg/60 border border-kore flex items-center justify-center text-2xl flex-shrink-0">
                {order.image}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-kore text-sm truncate">
                      {order.product}
                    </p>
                    <p className="text-[11px] text-muted">{order.store}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted flex items-center gap-1">
                    <Package size={12} />
                    {order.id} · {order.date}
                  </p>
                  <p className="text-sm font-extrabold text-kore">
                    {order.price}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}