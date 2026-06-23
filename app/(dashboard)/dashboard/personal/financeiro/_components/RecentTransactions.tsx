"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface Transaction {
  id: string;
  description: string;
  type: "income" | "expense";
  status: "paid" | "pending" | "cancelled" | string;
  amount: number;
  created_at: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="bg-kore-card border border-kore-border rounded-3xl p-5 sm:p-6 shadow-kore-soft h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-kore-ink">Transações Recentes</h3>
          <p className="text-sm text-kore-muted">Últimas movimentações da sua conta</p>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto min-h-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-kore-muted font-bold border-b border-kore-border">
              <th className="text-left pb-3 font-bold pr-4">Data</th>
              <th className="text-left pb-3 font-bold pr-4">Descrição</th>
              <th className="text-left pb-3 font-bold pr-4">Tipo</th>
              <th className="text-right pb-3 font-bold">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kore-border/60">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-kore-bg/40 transition group">
                <td className="py-3 pr-4 text-kore-muted font-medium whitespace-nowrap">
                  {formatDate(tx.created_at)}
                </td>
                <td className="py-3 pr-4 font-bold text-kore-ink max-w-[200px] truncate">
                  {tx.description}
                  {tx.status === "pending" && (
                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                      Pendente
                    </span>
                  )}
                </td>
                <td className="py-3 pr-4">
                  {tx.type === "income" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <ArrowUpRight size={12} strokeWidth={3} />
                      Entrada
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                      <ArrowDownRight size={12} strokeWidth={3} />
                      Saída
                    </span>
                  )}
                </td>
                <td className={`py-3 text-right font-extrabold whitespace-nowrap ${tx.type === "income" ? "text-emerald-600" : "text-kore-ink"}`}>
                  {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-kore-muted">
                  Nenhuma transação recente encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
