"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Mail, Search } from "lucide-react";
import { MobileSidebar, Sidebar } from "../../_components/Sidebar";
import { Topbar } from "../../_components/Topbar";
import type { UserRow } from "../page";

/* ── Filtro types ─────────────────────────────────────────────── */
type RoleFilter = "all" | "client" | "trainer" | "nutritionist" | "merchant";

const FILTERS: { key: RoleFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "client", label: "Clientes" },
  { key: "trainer", label: "Personais" },
  { key: "nutritionist", label: "Nutris" },
  { key: "merchant", label: "Lojistas" },
];

/* ── Role / Status helpers ───────────────────────────────────── */
const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  client: "Cliente",
  trainer: "Personal",
  nutritionist: "Nutricionista",
  merchant: "Lojista",
};

const ROLE_COLOR: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  client: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  trainer: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  nutritionist: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  merchant: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Ativo",
  paused: "Pausado",
  churned: "Inativo",
  pending: "Pendente",
};

const STATUS_DOT: Record<string, string> = {
  active: "bg-emerald-500",
  paused: "bg-amber-500",
  churned: "bg-red-500",
  pending: "bg-slate-400",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ── Component ───────────────────────────────────────────────── */
export function UsersClient({ users }: { users: UserRow[] }) {
  const [filter, setFilter] = useState<RoleFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = users;
    if (filter !== "all") {
      list = list.filter((u) => u.role === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.full_name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      );
    }
    return list;
  }, [users, filter, search]);

  return (
    <div className="min-h-screen flex bg-kore-bg text-kore-ink">
      <Sidebar />
      <MobileSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />

        <main className="flex-1 px-3 sm:px-6 py-6 space-y-6">
          {/* ── Header ─────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Gestão de Usuários
              </h1>
              <p className="text-sm text-kore-muted mt-1">
                {filtered.length} usuário{filtered.length !== 1 && "s"} encontrado
                {filtered.length !== 1 && "s"}
              </p>
            </div>

            {/* Search input (mobile-visible, desktop-right) */}
            <div className="relative w-full sm:w-72">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted"
              />
              <input
                type="text"
                placeholder="Buscar por nome ou e-mail…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-kore-card border border-kore-border text-sm text-kore-ink placeholder:text-kore-muted focus:outline-none focus:border-kore-emerald/60 focus:ring-2 focus:ring-kore-emerald/15 transition"
              />
            </div>
          </div>

          {/* ── Filter pills ───────────────────────────────────── */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`relative flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  filter === f.key
                    ? "text-white"
                    : "text-kore-subink bg-kore-card border border-kore-border hover:border-kore-emerald/40 hover:text-kore-ink"
                }`}
              >
                {filter === f.key && (
                  <motion.span
                    layoutId="users-filter-pill"
                    className="absolute inset-0 rounded-xl bg-kore-emerald"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{f.label}</span>
              </button>
            ))}
          </div>

          {/* ── Table (desktop) / Cards (mobile) ───────────────── */}
          {/* Desktop Table */}
          <div className="hidden md:block rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-kore-border bg-kore-bg/50">
                    <th className="text-left font-bold text-kore-muted uppercase tracking-wider text-[11px] px-5 py-3.5">
                      Nome
                    </th>
                    <th className="text-left font-bold text-kore-muted uppercase tracking-wider text-[11px] px-5 py-3.5">
                      E-mail
                    </th>
                    <th className="text-left font-bold text-kore-muted uppercase tracking-wider text-[11px] px-5 py-3.5">
                      Tipo de Conta
                    </th>
                    <th className="text-left font-bold text-kore-muted uppercase tracking-wider text-[11px] px-5 py-3.5">
                      Status
                    </th>
                    <th className="text-left font-bold text-kore-muted uppercase tracking-wider text-[11px] px-5 py-3.5">
                      Data de Cadastro
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-12 text-kore-muted text-sm"
                      >
                        Nenhum usuário encontrado.
                      </td>
                    </tr>
                  )}
                  {filtered.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-kore-border/50 last:border-0 hover:bg-kore-bg/40 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {u.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={u.avatar_url}
                              alt={u.full_name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-kore-emerald/15 text-kore-emerald-deep grid place-items-center text-xs font-bold">
                              {u.full_name
                                .split(" ")
                                .map((w) => w[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </div>
                          )}
                          <span className="font-semibold text-kore-ink">
                            {u.full_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-kore-subink">
                        {u.email}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${
                            ROLE_COLOR[u.role] ?? ROLE_COLOR.client
                          }`}
                        >
                          {ROLE_LABEL[u.role] ?? u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-kore-subink">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              STATUS_DOT[u.status] ?? STATUS_DOT.active
                            }`}
                          />
                          {STATUS_LABEL[u.status] ?? u.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-kore-subink whitespace-nowrap">
                        {formatDate(u.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.length === 0 && (
              <p className="text-center py-12 text-kore-muted text-sm">
                Nenhum usuário encontrado.
              </p>
            )}
            {filtered.map((u) => (
              <div
                key={u.id}
                className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-4 space-y-3"
              >
                <div className="flex items-center gap-3">
                  {u.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={u.avatar_url}
                      alt={u.full_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-kore-emerald/15 text-kore-emerald-deep grid place-items-center text-sm font-bold">
                      {u.full_name
                        .split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-kore-ink truncate">
                      {u.full_name}
                    </p>
                    <p className="text-xs text-kore-muted truncate flex items-center gap-1">
                      <Mail size={11} /> {u.email}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-lg font-bold ${
                      ROLE_COLOR[u.role] ?? ROLE_COLOR.client
                    }`}
                  >
                    {ROLE_LABEL[u.role] ?? u.role}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-kore-subink">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        STATUS_DOT[u.status] ?? STATUS_DOT.active
                      }`}
                    />
                    {STATUS_LABEL[u.status] ?? u.status}
                  </span>
                  <span className="inline-flex items-center gap-1 text-kore-muted ml-auto">
                    <CalendarDays size={12} />
                    {formatDate(u.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}