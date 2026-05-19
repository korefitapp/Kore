"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { WEEKLY_MACROS } from "./data";

export function WeeklyMacrosChart() {
  return (
    <section className="card p-5">
      <header className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div>
          <h2 className="text-base font-extrabold text-kore-ink tracking-tight">
            Macros médios da semana
          </h2>
          <p className="text-xs text-kore-muted mt-0.5">
            Média da carteira ativa · gramas por dia
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Legend color="rgb(16 185 129)" label="Proteína" />
          <Legend color="rgb(245 158 11)" label="Carboidrato" />
          <Legend color="rgb(56 189 248)" label="Gordura" />
        </div>
      </header>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={WEEKLY_MACROS}
            margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
          >
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
              unit="g"
            />
            <Tooltip
              contentStyle={{
                background: "rgb(var(--kore-card))",
                border: "1px solid rgb(var(--kore-border))",
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(value: number) => `${value}g`}
            />
            <Line
              type="monotone"
              dataKey="proteina"
              name="Proteína"
              stroke="rgb(16 185 129)"
              strokeWidth={2.6}
              dot={{ r: 3, strokeWidth: 0, fill: "rgb(16 185 129)" }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="carbo"
              name="Carboidrato"
              stroke="rgb(245 158 11)"
              strokeWidth={2.2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="gordura"
              name="Gordura"
              stroke="rgb(56 189 248)"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
            />
          </LineChart>
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
