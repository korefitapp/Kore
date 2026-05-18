"use client";

import { motion } from "framer-motion";
import {
  Check,
  ChevronRight,
  Eye,
  FileWarning,
  Filter,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  PENDING_PROFESSIONALS,
  professionalKindLabel,
  relativeSubmitted,
} from "./data";
import type {
  ApprovalStatus,
  PendingProfessional,
  ProfessionalKind,
} from "./types";

type KindFilter = "all" | ProfessionalKind;

const STATUS_LABEL: Record<ApprovalStatus, string> = {
  pending: "Aguardando triagem",
  "in-review": "Em análise",
  "needs-info": "Pendência de docs",
};

const STATUS_TINT: Record<ApprovalStatus, string> = {
  pending:
    "bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-500/30",
  "in-review":
    "bg-sky-500/15 text-sky-700 dark:text-sky-300 ring-1 ring-inset ring-sky-500/30",
  "needs-info":
    "bg-red-500/15 text-red-700 dark:text-red-300 ring-1 ring-inset ring-red-500/30",
};

const KIND_TINT: Record<ProfessionalKind, string> = {
  nutritionist: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  trainer: "bg-violet-500/12 text-violet-700 dark:text-violet-300",
  merchant: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
};

const FILTERS: { key: KindFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "nutritionist", label: "Nutricionistas" },
  { key: "trainer", label: "Personals" },
  { key: "merchant", label: "Lojistas" },
];

export function PendingProfessionals() {
  const [kind, setKind] = useState<KindFilter>("all");
  const [decided, setDecided] = useState<
    Record<string, "approved" | "rejected" | undefined>
  >({});

  const rows = useMemo(() => {
    return PENDING_PROFESSIONALS.filter((p) =>
      kind === "all" ? true : p.kind === kind,
    );
  }, [kind]);

  function decide(id: string, action: "approved" | "rejected") {
    setDecided((prev) => ({ ...prev, [id]: action }));
  }

  return (
    <section className="card p-5">
      <header className="flex flex-wrap items-center gap-3 justify-between mb-4">
        <div>
          <h2 className="font-extrabold text-lg text-kore-ink tracking-tight">
            Solicitações de novos profissionais
          </h2>
          <p className="text-xs text-kore-muted mt-0.5">
            {rows.length} candidaturas · aprove ou peça documentação
            complementar
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="btn-ghost text-xs">
            <Filter size={13} /> Mais filtros
          </button>
        </div>
      </header>

      <div className="flex items-center gap-1.5 bg-kore-bg p-1 rounded-xl w-fit mb-3">
        {FILTERS.map((f) => {
          const active = f.key === kind;
          return (
            <button
              type="button"
              key={f.key}
              onClick={() => setKind(f.key)}
              className={`relative px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                active ? "text-kore-ink" : "text-kore-muted hover:text-kore-ink"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="kind-filter"
                  className="absolute inset-0 rounded-lg bg-kore-card shadow-kore-soft"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{f.label}</span>
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full min-w-[860px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.16em] text-kore-muted">
              <th className="text-left font-bold py-2 pl-2">Candidato</th>
              <th className="text-left font-bold py-2">Tipo</th>
              <th className="text-left font-bold py-2">Registro</th>
              <th className="text-left font-bold py-2">Cidade</th>
              <th className="text-left font-bold py-2">Docs</th>
              <th className="text-left font-bold py-2">Enviado</th>
              <th className="text-left font-bold py-2">Status</th>
              <th className="text-right font-bold py-2 pr-2">Ação</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <Row
                key={p.id}
                p={p}
                decided={decided[p.id]}
                onDecide={(action) => decide(p.id, action)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Row({
  p,
  decided,
  onDecide,
}: {
  p: PendingProfessional;
  decided?: "approved" | "rejected";
  onDecide: (action: "approved" | "rejected") => void;
}) {
  const incomplete = p.documents < p.documentsTotal;
  return (
    <tr className="border-t border-kore-border hover:bg-kore-bg/50 transition">
      <td className="py-3 pl-2">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl text-xl grid place-items-center flex-shrink-0"
            style={{ background: "rgb(var(--kore-emerald-soft))" }}
          >
            {p.avatar}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-kore-ink truncate">
              {p.name}
            </p>
            <p className="text-[11px] text-kore-muted truncate">{p.id}</p>
          </div>
        </div>
      </td>
      <td className="py-3">
        <span className={`chip ${KIND_TINT[p.kind]}`}>
          {professionalKindLabel(p.kind)}
        </span>
      </td>
      <td className="py-3 text-sm font-mono text-kore-subink whitespace-nowrap">
        {p.registry}
      </td>
      <td className="py-3 text-sm text-kore-subink whitespace-nowrap">
        {p.city}
      </td>
      <td className="py-3">
        <div className="flex items-center gap-2 min-w-[80px]">
          <div className="flex-1 h-1.5 rounded-full bg-kore-bg overflow-hidden">
            <div
              className={`h-full rounded-full ${
                incomplete ? "bg-red-500" : "bg-kore-emerald"
              }`}
              style={{
                width: `${(p.documents / p.documentsTotal) * 100}%`,
              }}
            />
          </div>
          <span
            className={`text-[11px] font-bold ${
              incomplete ? "text-red-600 dark:text-red-300" : "text-kore-subink"
            }`}
          >
            {p.documents}/{p.documentsTotal}
          </span>
        </div>
      </td>
      <td className="py-3 text-sm text-kore-subink whitespace-nowrap">
        {relativeSubmitted(p.submittedAt)}
      </td>
      <td className="py-3">
        <span className={`chip ${STATUS_TINT[p.status]} whitespace-nowrap`}>
          {p.status === "needs-info" && <FileWarning size={11} />}
          {STATUS_LABEL[p.status]}
        </span>
      </td>
      <td className="py-3 pr-2">
        <div className="flex items-center gap-1.5 justify-end">
          {decided === "approved" ? (
            <span className="chip bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-500/30">
              <Check size={11} strokeWidth={2.8} /> Aprovado
            </span>
          ) : decided === "rejected" ? (
            <span className="chip bg-red-500/15 text-red-700 dark:text-red-300 ring-1 ring-inset ring-red-500/30">
              <X size={11} strokeWidth={2.8} /> Recusado
            </span>
          ) : (
            <>
              <button
                type="button"
                aria-label="Recusar"
                onClick={() => onDecide("rejected")}
                className="w-8 h-8 grid place-items-center rounded-lg border border-kore-border bg-kore-card text-kore-muted hover:border-red-500/60 hover:text-red-600 transition"
              >
                <X size={14} />
              </button>
              <button
                type="button"
                aria-label="Ver dossiê"
                className="w-8 h-8 grid place-items-center rounded-lg border border-kore-border bg-kore-card text-kore-subink hover:border-kore-emerald/60 hover:text-kore-ink transition"
              >
                <Eye size={14} />
              </button>
              <button
                type="button"
                onClick={() => onDecide("approved")}
                className="h-8 inline-flex items-center gap-1.5 px-3 rounded-lg text-white text-xs font-bold shadow-kore-emerald active:scale-[0.98] transition"
                style={{
                  background:
                    "linear-gradient(135deg, rgb(var(--kore-emerald)) 0%, rgb(var(--kore-emerald-deep)) 100%)",
                }}
              >
                <Check size={13} strokeWidth={2.8} /> Aprovar
                <ChevronRight size={12} />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
