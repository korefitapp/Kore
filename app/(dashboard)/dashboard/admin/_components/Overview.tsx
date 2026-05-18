"use client";

import { motion } from "framer-motion";
import { Clock4, Sparkles, TrendingUp } from "lucide-react";
import { OWNER } from "./data";
import { KpiGrid } from "./KpiGrid";
import { PendingProfessionals } from "./PendingProfessionals";
import { CategoryShareChart, RevenueChart } from "./RevenueChart";
import { RecentActivity } from "./RecentActivity";

export function Overview({ adminName }: { adminName: string }) {
  return (
    <div className="px-6 py-6 space-y-6 max-w-[1440px] mx-auto">
      <Header adminName={adminName} />
      <KpiGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RevenueChart />
        <CategoryShareChart />
      </div>

      <PendingProfessionals />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <NextActions />
      </div>
    </div>
  );
}

function Header({ adminName }: { adminName: string }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const firstName = adminName.split(" ")[0] ?? OWNER.name.split(" ")[0];

  return (
    <motion.header
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className="flex flex-wrap items-end gap-4 justify-between"
    >
      <div>
        <p className="text-xs text-kore-muted font-semibold">
          {greeting}, {firstName} 👋
        </p>
        <h1 className="mt-1 text-[28px] leading-tight font-black tracking-tight text-kore-ink">
          <span className="text-kore-emerald-deep">23 profissionais</span>{" "}
          aguardando aprovação
        </h1>
        <p className="mt-1 text-sm text-kore-muted">
          Resumo executivo · Plataforma KORE
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="chip bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-500/30">
          <Sparkles size={11} /> Stripe estável
        </span>
        <span className="chip bg-amber-500/12 text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-500/30">
          <Clock4 size={11} /> 4 disputas abertas
        </span>
        <span className="chip bg-sky-500/12 text-sky-700 dark:text-sky-300 ring-1 ring-inset ring-sky-500/30">
          <TrendingUp size={11} /> MRR R$ 78.420
        </span>
      </div>
    </motion.header>
  );
}

function NextActions() {
  const items: { title: string; eta: string; tone: string }[] = [
    {
      title: "Revisar 4 disputas abertas no Stripe",
      eta: "Hoje",
      tone: "bg-red-500/12 text-red-700 dark:text-red-300 ring-red-500/30",
    },
    {
      title: "Aprovar onboarding · Mercado VivaFit",
      eta: "Hoje",
      tone: "bg-amber-500/12 text-amber-700 dark:text-amber-300 ring-amber-500/30",
    },
    {
      title: "Confirmar contratos de payout (5 lojistas)",
      eta: "Esta semana",
      tone: "bg-sky-500/12 text-sky-700 dark:text-sky-300 ring-sky-500/30",
    },
    {
      title: "Calibrar limiar de auto-moderação de listings",
      eta: "Esta semana",
      tone: "bg-violet-500/12 text-violet-700 dark:text-violet-300 ring-violet-500/30",
    },
  ];

  return (
    <section className="card p-5">
      <header className="mb-3">
        <h2 className="font-extrabold text-lg text-kore-ink tracking-tight">
          Próximas ações
        </h2>
        <p className="text-xs text-kore-muted mt-0.5">
          Decisões do owner pendentes
        </p>
      </header>

      <ul className="space-y-2.5">
        {items.map((it) => (
          <li
            key={it.title}
            className="flex items-start gap-3 p-3 rounded-xl border border-kore-border hover:border-kore-emerald/40 transition"
          >
            <span
              className={`chip ring-1 ring-inset ${it.tone} whitespace-nowrap`}
            >
              {it.eta}
            </span>
            <p className="text-sm font-semibold text-kore-ink leading-snug">
              {it.title}
            </p>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-kore-border text-kore-muted hover:text-kore-ink hover:border-kore-emerald/60 transition py-2.5 text-xs font-bold uppercase tracking-wider"
      >
        Ver tudo no Kanban →
      </button>
    </section>
  );
}
