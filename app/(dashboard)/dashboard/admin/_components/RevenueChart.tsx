"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CATEGORY_SHARE, REVENUE_7D } from "./data";

export function RevenueChart() {
  return (
    <section className="card p-5 lg:col-span-2">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-extrabold text-lg text-kore-ink tracking-tight">
            Receita 7 dias (Stripe Connect)
          </h2>
          <p className="text-xs text-kore-muted mt-0.5">
            Bruto · líquido pós-split · valores em BRL
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-bold text-kore-muted">
          <Legend color="rgb(var(--kore-emerald))" label="Bruto" />
          <Legend
            color="rgb(var(--kore-emerald-deep))"
            label="Líquido"
            dashed
          />
        </div>
      </header>

      <div className="h-[220px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={REVENUE_7D}
            margin={{ top: 10, right: 12, left: -8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="grossGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="rgb(var(--kore-emerald))"
                  stopOpacity={0.35}
                />
                <stop
                  offset="95%"
                  stopColor="rgb(var(--kore-emerald))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="rgb(var(--kore-border))"
              strokeDasharray="3 6"
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
              tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: "rgb(var(--kore-card))",
                border: "1px solid rgb(var(--kore-border))",
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(value: number) => [
                `R$ ${value.toLocaleString("pt-BR")}`,
                "",
              ]}
            />
            <Area
              type="monotone"
              dataKey="gross"
              stroke="rgb(var(--kore-emerald))"
              strokeWidth={2.6}
              fill="url(#grossGradient)"
              name="Bruto"
            />
            <Area
              type="monotone"
              dataKey="net"
              stroke="rgb(var(--kore-emerald-deep))"
              strokeWidth={2.2}
              strokeDasharray="5 4"
              fill="transparent"
              name="Líquido"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function CategoryShareChart() {
  const total = CATEGORY_SHARE.reduce((acc, c) => acc + c.value, 0);
  return (
    <section className="card p-5">
      <header className="mb-3">
        <h2 className="font-extrabold text-lg text-kore-ink tracking-tight">
          Mix de receita
        </h2>
        <p className="text-xs text-kore-muted mt-0.5">
          Composição últimos 30 dias
        </p>
      </header>

      <div className="flex items-center gap-4">
        <div className="w-32 h-32 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={CATEGORY_SHARE}
                dataKey="value"
                innerRadius={38}
                outerRadius={60}
                strokeWidth={2}
                stroke="rgb(var(--kore-card))"
              >
                {CATEGORY_SHARE.map((c) => (
                  <Cell key={c.name} fill={c.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="flex-1 space-y-2.5">
          {CATEGORY_SHARE.map((c) => (
            <li key={c.name} className="flex items-center gap-3 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: c.color }}
              />
              <span className="flex-1 font-semibold text-kore-subink">
                {c.name}
              </span>
              <span className="font-bold text-kore-ink tabular-nums">
                {((c.value / total) * 100).toFixed(0)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Legend({
  color,
  label,
  dashed,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block w-6 h-[3px] rounded-full"
        style={{
          background: dashed
            ? `repeating-linear-gradient(to right, ${color} 0 4px, transparent 4px 8px)`
            : color,
        }}
      />
      {label}
    </span>
  );
}
