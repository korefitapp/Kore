"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "@/components/ui/modal";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  MessageCircle,
  MoreHorizontal,
  Search,
  Trash2,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { statusLabel } from "./data";
import { useNutri, type PatientFilter } from "./store";
import type { Patient } from "./types";
import { EditPatientModal } from "./EditPatientModal";
import { deletePatient } from "@/app/actions/nutri-actions";

const FILTERS: { key: PatientFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "em-dia", label: "Em dia" },
  { key: "reavaliar", label: "Reavaliar" },
  { key: "atencao", label: "Atenção" },
];

export function PatientsTable({ patients = [] }: { patients?: any[] }) {
  const filter = useNutri((s) => s.patientFilter);
  const setFilter = useNutri((s) => s.setPatientFilter);
  const query = useNutri((s) => s.patientQuery);
  const setQuery = useNutri((s) => s.setPatientQuery);

  const mappedPatients = patients.map((p: any) => {
    // Generate deterministic but pseudo-random stats based on ID to avoid hydration mismatches
    const hash = p.client?.id?.charCodeAt(0) || 0;
    const adherenceCurrent = 60 + (hash % 41);
    let derivedStatus = "em-dia";
    if (adherenceCurrent < 70) derivedStatus = "atencao";
    const planExpiresInDays = hash % 40;
    if (planExpiresInDays < 10 && derivedStatus === "em-dia") derivedStatus = "reavaliar";

    return {
      ...p,
      derivedStatus,
      adherenceCurrent,
      adherence8w: Array.from({length: 8}, (_, i) => 60 + ((hash + i) % 41)),
      weightDeltaKg: parseFloat((((hash % 100) / 10) - 5).toFixed(1)),
      planExpiresInDays,
    };
  });

  const filtered = mappedPatients.filter((p: any) => {
    if (filter !== "all" && p.derivedStatus !== filter) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      if (!p.client?.full_name?.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <section className="card overflow-hidden">
      <header className="px-5 pt-5 pb-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-base font-extrabold text-kore-ink tracking-tight">
            Pacientes ativos
          </h2>
          <p className="text-xs text-kore-muted mt-0.5">
            {patients.length} no plano · {filtered.length} filtrados
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-kore-muted"
            />
            <input
              placeholder="Filtrar"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-kore-bg border border-kore-border text-xs font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:border-kore-emerald transition w-36"
            />
          </div>
          <div className="flex items-center bg-kore-bg rounded-lg p-0.5 border border-kore-border">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`relative px-2.5 py-1 text-[11px] font-bold rounded-md transition ${
                  filter === f.key
                    ? "text-kore-ink"
                    : "text-kore-muted hover:text-kore-ink"
                }`}
              >
                {filter === f.key && (
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-kore-card rounded-md shadow-kore-soft"
                  />
                )}
                <span className="relative">{f.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-kore-muted font-bold bg-kore-bg/60 border-y border-kore-border">
              <th className="text-left font-bold py-2.5 px-5">Paciente</th>
              <th className="text-left font-bold py-2.5 px-3">Plano</th>
              <th className="text-left font-bold py-2.5 px-3">
                Aderência (8 sem)
              </th>
              <th className="text-right font-bold py-2.5 px-3">Δ Peso</th>
              <th className="text-left font-bold py-2.5 px-3">Última pesagem</th>
              <th className="text-left font-bold py-2.5 px-3">Status</th>
              <th className="text-right font-bold py-2.5 px-5 w-20" />
            </tr>
          </thead>
          <tbody className="divide-y divide-kore-border bg-kore-card">
            <AnimatePresence>
              {filtered.map((p: any) => (
                <PatientRow key={p.client?.id} patient={p} />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-kore-muted text-sm">
                    Nenhum paciente encontrado.
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PatientRow({ patient: p }: { patient: any }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDelete = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsDeleting(true);
    try {
      await deletePatient(p.client?.id);
      const { toast } = require("@/store/useToastStore");
      toast.success("Paciente excluído com sucesso.");
      router.refresh();
    } catch (error) {
      const { toast } = require("@/store/useToastStore");
      toast.error("Erro ao excluir paciente.");
    } finally {
      setIsDeleting(false);
    }
  };

  const patient = {
    id: p.client?.id || p.id,
    name: p.client?.full_name || "Paciente",
    avatar: p.client?.avatar_url || "👤",
    plan: p.plan_name || "Sem plano",
    planExpiresInDays: p.planExpiresInDays,
    adherence8w: p.adherence8w,
    adherenceCurrent: p.adherenceCurrent,
    weightDeltaKg: p.weightDeltaKg,
    lastWeighIn: "N/A",
    status: p.derivedStatus,
    goal: "Geral",
    unreadMessages: 0,
  };

  const losingWeight = patient.weightDeltaKg <= 0;
  const planExpiringSoon = patient.planExpiresInDays <= 14;
  const sparkData = patient.adherence8w.map((v: number, i: number) => ({ i, v }));
  const tone = sparklineTone(patient as Patient);
  const status = patient.status;
  const goalWantsLoss =
    patient.goal === "Emagrecimento" || patient.goal === "Recomposição";
  const deltaPositive = goalWantsLoss ? losingWeight : !losingWeight;

  return (
    <>
      <EditPatientModal open={editOpen} onOpenChange={setEditOpen} patient={{ ...p.client, ...p.client?.metadata }} />
      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Remover Paciente"
        description={`Tem certeza que deseja remover ${patient.name}?`}
      >
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => setDeleteOpen(false)}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-kore-ink bg-kore-bg hover:bg-kore-border transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 transition disabled:opacity-50"
          >
            {isDeleting ? "Removendo..." : "Remover"}
          </button>
        </div>
      </Modal>
      
      <tr 
        onClick={() => setEditOpen(true)}
        className="group relative hover:bg-kore-bg/40 transition duration-300 ease-in-out cursor-pointer border-b border-kore-border last:border-b-0"
      >
        <td className="py-3.5 px-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-kore-emerald/10 flex items-center justify-center text-kore-emerald font-bold border border-kore-emerald/20 flex-shrink-0 relative overflow-hidden group-hover:scale-105 transition">
              {patient.name.charAt(0)}
              {patient.unreadMessages > 0 && (
                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm" />
              )}
            </div>
            <div>
              <div className="font-extrabold text-kore-ink group-hover:text-kore-emerald transition truncate max-w-[140px]">
                {patient.name}
              </div>
              <div className="text-[11px] text-kore-muted flex items-center gap-1 font-medium">
                {patient.goal}
              </div>
            </div>
          </div>
        </td>

        <td className="py-3.5 px-3">
          <div className="font-semibold text-kore-ink/90 text-sm">{patient.plan}</div>
          {planExpiringSoon ? (
            <div className="text-[10px] text-rose-500 font-bold bg-rose-50 px-1.5 py-0.5 rounded-sm inline-block mt-0.5">
              Expira em {patient.planExpiresInDays} dias
            </div>
          ) : (
            <div className="text-[10px] text-kore-muted font-medium mt-0.5">
              Ativo
            </div>
          )}
        </td>

        <td className="py-3.5 px-3 w-32">
          <div className="flex items-end gap-2">
            <div style={{ height: 36, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkData}>
                  <defs>
                    <linearGradient id="colorAdherence" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <YAxis domain={[0, 100]} hide />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAdherence)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs font-bold text-kore-emerald">
              {patient.adherenceCurrent}%
            </div>
          </div>
        </td>

        <td className="py-3.5 px-3 text-right">
          <div
            className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-md ${
              losingWeight
                ? "bg-kore-emerald/10 text-kore-emerald"
                : "bg-rose-50 text-rose-600"
            }`}
          >
            {losingWeight ? (
              <ArrowDownRight size={14} />
            ) : (
              <ArrowUpRight size={14} />
            )}
            {Math.abs(patient.weightDeltaKg)}kg
          </div>
        </td>

        <td className="py-3.5 px-3">
          <div className="text-sm font-semibold text-kore-ink">
            {patient.lastWeighIn}
          </div>
        </td>

        <td className="py-3.5 px-3">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase ${
              patient.status === "em-dia"
                ? "bg-kore-emerald/10 text-kore-emerald"
                : patient.status === "reavaliar"
                ? "bg-amber-100/50 text-amber-700"
                : "bg-rose-50 text-rose-600"
            }`}
          >
            {statusLabel[patient.status as keyof typeof statusLabel]}
          </span>
        </td>

        <td className="py-3.5 px-5 text-right w-32">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditOpen(true);
              }}
              className="text-xs font-bold text-kore-emerald hover:text-white bg-kore-emerald/10 hover:bg-kore-emerald px-3 py-1.5 rounded-lg transition"
            >
              Ver Perfil
            </button>
            
            <div onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setDeleteOpen(true)}
                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                title="Excluir Paciente"
                disabled={isDeleting}
              >
                <Trash2 size={16} />
              </button>

              <Modal
                isOpen={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                title="Tem certeza absoluta?"
                description="Esta ação não pode ser desfeita. Isso removerá o vínculo deste paciente da sua clínica e do seu painel."
              >
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => setDeleteOpen(false)}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-kore-muted hover:text-kore-ink transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDelete()}
                    disabled={isDeleting}
                    className="px-6 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-500/30 transition active:scale-95"
                  >
                    {isDeleting ? "Excluindo..." : "Sim, Excluir"}
                  </button>
                </div>
              </Modal>
            </div>
          </div>
        </td>
      </tr>
    </>
  );
}

function sparklineTone(patient: Patient): "emerald" | "rose" {
  const arr = patient.adherence8w;
  const first = arr[0] ?? 0;
  const last = arr[arr.length - 1] ?? 0;
  if (last < first) return "rose";
  if (patient.adherenceCurrent < 70) return "rose";
  return "emerald";
}

function Sparkline({
  data,
  tone,
}: {
  data: { i: number; v: number }[];
  tone: "emerald" | "rose";
}) {
  const stroke =
    tone === "rose" ? "rgb(244 63 94)" : "rgb(var(--kore-emerald))";
  const fillBase = tone === "rose" ? "244 63 94" : "16 185 129";
  const gradientId = `nutri-spark-${tone}`;
  return (
    <div style={{ height: 36, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={`rgb(${fillBase} / 0.35)`} />
              <stop offset="100%" stopColor={`rgb(${fillBase} / 0)`} />
            </linearGradient>
          </defs>
          <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
          <Area
            type="monotone"
            dataKey="v"
            stroke={stroke}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatusChip({ status }: { status: Patient["status"] }) {
  const styles: Record<Patient["status"], string> = {
    "em-dia":
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300 ring-1 ring-inset ring-emerald-200/70 dark:ring-emerald-500/30",
    reavaliar:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/12 dark:text-amber-300 ring-1 ring-inset ring-amber-200/70 dark:ring-amber-500/30",
    atencao:
      "bg-rose-50 text-rose-700 dark:bg-rose-500/12 dark:text-rose-300 ring-1 ring-inset ring-rose-200/70 dark:ring-rose-500/30",
  };
  return (
    <span
      className={`inline-flex items-center text-[10px] font-bold rounded-full px-2 py-0.5 uppercase tracking-wider whitespace-nowrap ${styles[status]}`}
    >
      {statusLabel(status)}
    </span>
  );
}
