"use client";

import { DollarSign, TrendingDown, TrendingUp, Clock } from "lucide-react";

interface FinanceKPIsProps {
  metrics: {
    income: number;
    expense: number;
    net: number;
    pending: number;
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function FinanceKPIs({ metrics }: FinanceKPIsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Receitas */}
      <div className="bg-kore-card border border-kore-border rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-kore-soft">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-kore-muted uppercase tracking-wider">
            Receitas
          </p>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 grid place-items-center">
            <TrendingUp size={20} className="text-emerald-600" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-kore-ink">
            {formatCurrency(metrics.income)}
          </h3>
          <p className="text-xs text-kore-muted mt-2">
            Entradas pagas no período
          </p>
        </div>
      </div>

      {/* Despesas */}
      <div className="bg-kore-card border border-kore-border rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-kore-soft">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-kore-muted uppercase tracking-wider">
            Despesas
          </p>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 grid place-items-center">
            <TrendingDown size={20} className="text-rose-600" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-kore-ink">
            {formatCurrency(metrics.expense)}
          </h3>
          <p className="text-xs text-kore-muted mt-2">
            Saídas no período
          </p>
        </div>
      </div>

      {/* Saldo Líquido */}
      <div className="bg-kore-card border border-kore-border rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-kore-soft">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-kore-muted uppercase tracking-wider">
            Saldo Líquido
          </p>
          <div className="w-10 h-10 rounded-xl bg-kore-bg grid place-items-center border border-kore-border">
            <DollarSign size={20} className="text-kore-ink" />
          </div>
        </div>
        <div>
          <h3 className={`text-2xl sm:text-3xl font-extrabold ${metrics.net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
            {formatCurrency(metrics.net)}
          </h3>
          <p className="text-xs text-kore-muted mt-2">
            Receitas menos Despesas
          </p>
        </div>
      </div>

      {/* A Receber */}
      <div className="bg-kore-card border border-kore-border rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-kore-soft">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-kore-muted uppercase tracking-wider">
            A Receber
          </p>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 grid place-items-center">
            <Clock size={20} className="text-amber-600" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-kore-ink">
            {formatCurrency(metrics.pending)}
          </h3>
          <p className="text-xs text-kore-muted mt-2">
            Transações pendentes
          </p>
        </div>
      </div>
    </div>
  );
}
