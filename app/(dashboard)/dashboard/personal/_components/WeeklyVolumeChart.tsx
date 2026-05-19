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
import { WEEKLY_VOLUME } from "./data";

export function WeeklyVolumeChart() {
  return (
    <section className="card p-5">
      <header className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div>
          <h2 className="text-base font-extrabold text-kore-ink tracking-tight">
            Volume semanal
          </h2>
          <p className="text-xs text-kore-muted mt-0.5">
            Treinos executados pelos alunos · últimos 7 dias
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1.5 text-kore-muted font-semibold">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: "rgb(16 185 129)" }}
            />
            Treinos
          </span>
          <span className="inline-flex items-center gap-1.5 text-kore-muted font-semibold">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: "rgb(56 189 248)" }}
            />
            Kcal (×100)
          </span>
        </div>
      </header>

      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={WEEKLY_VOLUME}
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
            />
            <Tooltip
              contentStyle={{
                background: "rgb(var(--kore-card))",
                border: "1px solid rgb(var(--kore-border))",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="treinos"
              name="Treinos"
              stroke="rgb(16 185 129)"
              strokeWidth={2.6}
              dot={{ r: 3, strokeWidth: 0, fill: "rgb(16 185 129)" }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="kcal100"
              name="Kcal (×100)"
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
