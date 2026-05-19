"use client";

import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { formatBrl, TOP_PRODUCTS } from "./data";
import type { TopProduct } from "./types";

export function TopProducts() {
  return (
    <section className="card overflow-hidden">
      <header className="px-5 pt-5 pb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-kore-ink tracking-tight">
            Mais vendidos · 7 dias
          </h2>
          <p className="text-xs text-kore-muted mt-0.5">
            Ranking por unidades vendidas
          </p>
        </div>
        <button
          type="button"
          className="text-xs font-bold text-kore-emerald-deep hover:underline"
        >
          Ver todos →
        </button>
      </header>
      <ul className="divide-y divide-kore-border">
        {TOP_PRODUCTS.map((p, i) => (
          <Row key={p.id} product={p} index={i} />
        ))}
      </ul>
    </section>
  );
}

function Row({ product, index }: { product: TopProduct; index: number }) {
  const sparkData = product.trend.map((v, i) => ({ i, v }));
  return (
    <motion.li
      initial={{ opacity: 0, x: 6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="px-5 py-3 flex items-center gap-3 hover:bg-kore-bg/60 transition cursor-pointer"
    >
      <div className="w-7 text-[10px] font-bold text-kore-muted tabular-nums">
        #{index + 1}
      </div>
      <div className="w-10 h-10 rounded-xl bg-kore-emerald-soft text-xl grid place-items-center flex-shrink-0">
        {product.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-kore-ink text-sm truncate">
          {product.name}
        </p>
        <p className="text-[11px] text-kore-muted truncate">
          {product.category}
        </p>
      </div>
      <div className="w-20 hidden sm:block">
        <Sparkline data={sparkData} />
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-kore-ink tabular-nums">
          {product.unitsSold7d}
        </p>
        <p className="text-[10px] text-kore-muted font-semibold tabular-nums">
          {formatBrl(product.revenue7d)}
        </p>
      </div>
    </motion.li>
  );
}

function Sparkline({ data }: { data: { i: number; v: number }[] }) {
  return (
    <div style={{ height: 32, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="shop-spark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(16 185 129 / 0.35)" />
              <stop offset="100%" stopColor="rgb(16 185 129 / 0)" />
            </linearGradient>
          </defs>
          <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
          <Area
            type="monotone"
            dataKey="v"
            stroke="rgb(var(--kore-emerald))"
            strokeWidth={2}
            fill="url(#shop-spark)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
