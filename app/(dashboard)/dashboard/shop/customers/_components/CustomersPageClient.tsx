"use client";

import { useMemo, useState } from "react";
import { Eye, Search, Users } from "lucide-react";
import { MobileSidebar, Sidebar } from "../../_components/Sidebar";
import { Topbar } from "../../_components/Topbar";
import { formatBrl } from "../../_components/data";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Customer {
  id: string;
  name: string;
  avatar: string;
  email: string;
  totalOrders: number;
  ltv: number;
  lastOrderDate: string;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const CUSTOMERS: Customer[] = [
  {
    id: "cust-001",
    name: "Helena Prado",
    avatar: "🥗",
    email: "helena.prado@email.com",
    totalOrders: 14,
    ltv: 2840.6,
    lastOrderDate: "19/05/2026",
  },
  {
    id: "cust-002",
    name: "Renan Castro",
    avatar: "🍳",
    email: "renan.castro@email.com",
    totalOrders: 8,
    ltv: 1520.0,
    lastOrderDate: "19/05/2026",
  },
  {
    id: "cust-003",
    name: "Diego Martins",
    avatar: "🧑‍🏫",
    email: "diego.martins@email.com",
    totalOrders: 22,
    ltv: 5430.8,
    lastOrderDate: "19/05/2026",
  },
  {
    id: "cust-004",
    name: "Ana Souza",
    avatar: "🍇",
    email: "ana.souza@email.com",
    totalOrders: 5,
    ltv: 689.5,
    lastOrderDate: "18/05/2026",
  },
  {
    id: "cust-005",
    name: "Júlia Sant'Anna",
    avatar: "👩🏼‍⚕️",
    email: "julia.santanna@email.com",
    totalOrders: 31,
    ltv: 8920.0,
    lastOrderDate: "18/05/2026",
  },
  {
    id: "cust-006",
    name: "Marcos Figueiredo",
    avatar: "🥩",
    email: "marcos.figueiredo@email.com",
    totalOrders: 11,
    ltv: 3150.4,
    lastOrderDate: "17/05/2026",
  },
  {
    id: "cust-007",
    name: "Beatriz Lopes",
    avatar: "🥕",
    email: "beatriz.lopes@email.com",
    totalOrders: 19,
    ltv: 4280.0,
    lastOrderDate: "16/05/2026",
  },
  {
    id: "cust-008",
    name: "Felipe Carvalho",
    avatar: "🥥",
    email: "felipe.carvalho@email.com",
    totalOrders: 7,
    ltv: 1395.0,
    lastOrderDate: "15/05/2026",
  },
  {
    id: "cust-009",
    name: "Camila Rodrigues",
    avatar: "🏃‍♀️",
    email: "camila.rodrigues@email.com",
    totalOrders: 42,
    ltv: 12480.2,
    lastOrderDate: "15/05/2026",
  },
  {
    id: "cust-010",
    name: "Thiago Mendes",
    avatar: "🏋️",
    email: "thiago.mendes@email.com",
    totalOrders: 3,
    ltv: 389.7,
    lastOrderDate: "14/05/2026",
  },
  {
    id: "cust-011",
    name: "Patrícia Almeida",
    avatar: "🧘",
    email: "patricia.almeida@email.com",
    totalOrders: 16,
    ltv: 3760.0,
    lastOrderDate: "14/05/2026",
  },
  {
    id: "cust-012",
    name: "Lucas Oliveira",
    avatar: "💪",
    email: "lucas.oliveira@email.com",
    totalOrders: 9,
    ltv: 1980.5,
    lastOrderDate: "13/05/2026",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CustomersPageClient() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return CUSTOMERS;
    const q = query.trim().toLowerCase();
    return CUSTOMERS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
    );
  }, [query]);

  const summaryLtv = CUSTOMERS.reduce((acc, c) => acc + c.ltv, 0);
  const summaryOrders = CUSTOMERS.reduce((acc, c) => acc + c.totalOrders, 0);

  return (
    <div className="min-h-screen flex bg-kore-bg text-kore-ink">
      <Sidebar />
      <MobileSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />

        <main className="flex-1 px-3 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-kore-ink">
                Base de Clientes
              </h1>
              <p className="text-sm text-kore-muted mt-1">
                {CUSTOMERS.length} clientes · {summaryOrders} pedidos totais
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted"
              />
              <input
                type="text"
                placeholder="Buscar por nome ou e-mail…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:ring-2 focus:ring-kore-emerald/40 focus:border-kore-emerald transition"
              />
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="card px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider font-bold text-kore-muted">
                Total de Clientes
              </p>
              <p className="text-2xl font-extrabold text-kore-ink mt-1">
                {CUSTOMERS.length}
              </p>
            </div>
            <div className="card px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider font-bold text-kore-muted">
                Pedidos Totais
              </p>
              <p className="text-2xl font-extrabold text-kore-ink mt-1">
                {summaryOrders}
              </p>
            </div>
            <div className="card px-4 py-3 col-span-2 sm:col-span-1">
              <p className="text-[10px] uppercase tracking-wider font-bold text-kore-muted">
                LTV Total
              </p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatBrl(summaryLtv)}
              </p>
            </div>
          </div>

          {/* Customers table */}
          <section className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-kore-muted font-bold bg-kore-bg/60 border-y border-kore-border">
                    <th className="text-left font-bold py-3 px-5">Nome</th>
                    <th className="text-left font-bold py-3 px-3">E-mail</th>
                    <th className="text-right font-bold py-3 px-3">
                      Total de Pedidos
                    </th>
                    <th className="text-right font-bold py-3 px-3">
                      Valor Total Gasto
                    </th>
                    <th className="text-left font-bold py-3 px-3">
                      Último Pedido
                    </th>
                    <th className="text-right font-bold py-3 px-5 w-28" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-kore-border last:border-b-0 hover:bg-kore-bg/60 transition group"
                    >
                      {/* Name + avatar */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-kore-emerald-soft text-lg grid place-items-center flex-shrink-0">
                            {c.avatar}
                          </div>
                          <p className="font-semibold text-kore-ink text-sm truncate">
                            {c.name}
                          </p>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-3">
                        <span className="text-sm text-kore-subink truncate block max-w-[200px]">
                          {c.email}
                        </span>
                      </td>

                      {/* Total orders */}
                      <td className="py-3.5 px-3 text-right">
                        <span className="text-sm font-bold text-kore-ink tabular-nums">
                          {c.totalOrders}
                        </span>
                      </td>

                      {/* LTV */}
                      <td className="py-3.5 px-3 text-right">
                        <span className="text-sm font-bold text-kore-ink tabular-nums">
                          {formatBrl(c.ltv)}
                        </span>
                      </td>

                      {/* Last order date */}
                      <td className="py-3.5 px-3">
                        <span className="text-sm text-kore-subink whitespace-nowrap">
                          {c.lastOrderDate}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg bg-kore-bg border border-kore-border text-kore-subink hover:text-kore-emerald hover:border-kore-emerald/60 transition"
                        >
                          <Eye size={13} />
                          Ver Perfil
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 px-5 text-center text-sm text-kore-muted"
                      >
                        Nenhum cliente encontrado para a busca atual.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-kore-border flex items-center justify-between text-xs text-kore-muted">
              <span>
                {CUSTOMERS.length} clientes no total · {filtered.length} exibidos
              </span>
              <span className="font-medium">Página 1 de 1</span>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}