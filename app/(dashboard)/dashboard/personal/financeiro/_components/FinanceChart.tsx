"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ChartData {
  month: string;
  income: number;
  expense: number;
}

interface FinanceChartProps {
  data: ChartData[];
}

export function FinanceChart({ data }: FinanceChartProps) {
  return (
    <div className="bg-kore-card border border-kore-border rounded-3xl p-5 sm:p-6 shadow-kore-soft h-[400px] flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-extrabold text-kore-ink">Fluxo de Caixa</h3>
        <p className="text-sm text-kore-muted">Receitas vs Despesas nos últimos meses</p>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--tw-colors-kore-border)" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "var(--tw-colors-kore-muted)", fontSize: 12, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "var(--tw-colors-kore-muted)", fontSize: 12, fontWeight: 600 }}
              tickFormatter={(value) => `R$${value}`}
            />
            <Tooltip
              cursor={{ fill: "var(--tw-colors-kore-bg)", opacity: 0.5 }}
              contentStyle={{
                backgroundColor: "var(--tw-colors-kore-card)",
                borderColor: "var(--tw-colors-kore-border)",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                fontWeight: "bold",
                color: "var(--tw-colors-kore-ink)",
              }}
              formatter={(value: number) => [
                new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value),
                ""
              ]}
            />
            <Legend wrapperStyle={{ paddingTop: "20px", fontSize: "12px", fontWeight: "bold" }} />
            <Bar dataKey="income" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="expense" name="Despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
