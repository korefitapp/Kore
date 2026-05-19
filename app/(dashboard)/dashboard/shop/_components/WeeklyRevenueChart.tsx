"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { WEEKLY_REVENUE } from "./data";

export function WeeklyRevenueChart() {
  const total = WEEKLY_REVENUE.reduce((acc, p) => acc + p.receita, 0);
  const totalReturns = WEEKLY_REVENUE.reduce(
    (acc, p) => acc + p.devolucoes,
    0,
  );
  return (
    <section className="card p-5">
      <header className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div>
          <h2 className="text-base font-extrabold text-kore-ink tracking-tight">
            Receita semanal
          </h2>
          <p className="text-xs text-kore-muted mt-0.5">
            Últimos 7 dias · total{" "}
            <span className="font-bold text-kore-ink tabular-nums">
              R${" "}
              {total.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
            </span>{" "}
            ·{" "}
            <span className="font-bold text-rose-600 dark:text-rose-300 tabular-nums">
              R${" "}
              {totalReturns.toLocaleString("pt-BR", {
                maximumFractionDigits: 0,
              })}{" "}
              em devoluções
            </span>
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Legend color="rgb(16 185 129)" label="Receita" />
          <Legend color="rgb(244 63 94)" label="Devoluções" />
        </div>
      </header>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={WEEKLY_REVENUE}
            margin={{ top: 8, right: 8, left: -4, bottom: 0 }}
          >
            <defs>
              <linearGradient id="shop-revenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(16 185 129 / 0.35)" />
                <stop offset="100%" stopColor="rgb(16 185 129 / 0)" />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="rgb(var(--kore-border))"
              strokeDasharray="4 4"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tick={{ fill: "rgb(var(--kore-muted))", fontWeight: 600 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tick={{ fill: "rgb(var(--kore-muted))", fontWeight: 600 }}
              tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`}
            />
            <Tooltip
              contentStyle={{
                background: "rgb(var(--kore-card))",
                border: "1px solid rgb(var(--kore-border))",
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(value: number, name) => [
                `R$ ${value.toLocaleString("pt-BR")}`,
                name,
              ]}
            />
            <Area
              type="monotone"
              dataKey="receita"
              name="Receita"
              stroke="rgb(16 185 129)"
              strokeWidth={2.6}
              fill="url(#shop-revenue)"
              dot={{ r: 3, strokeWidth: 0, fill: "rgb(16 185 129)" }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="devolucoes"
              name="Devoluções"
              stroke="rgb(244 63 94)"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-kore-muted font-semibold">
      <span
        className="w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
