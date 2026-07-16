"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Eye,
  Search,
  Users,
  Trash2,
} from "lucide-react";
import { MobileSidebar, Sidebar } from "../../_components/Sidebar";
import { Topbar } from "../../_components/Topbar";
import { Modal } from "@/components/ui/modal";
import { EditPatientModal } from "../../_components/EditPatientModal";
import { deletePatient } from "@/app/actions/nutri-actions";
import { PatientFilters } from "./PatientFilters";

/* ── Types ──────────────────────────────────────────────────── */
interface PatientRow {
  id: string;
  full_name: string;
  display_name: string | null;
  status: string;
  created_at: string;
  metadata: Record<string, unknown> | null;
  auth_user_id?: string | null;
  avatar_url?: string | null;
}



/* ── Helpers ────────────────────────────────────────────────── */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Último acompanhamento mock — quando existir tabela de consultas, buscar real */
function getLastConsultation(_patient: PatientRow): string {
  const options = [
    "Hoje",
    "Ontem",
    "Há 2 dias",
    "Há 3 dias",
    "Há 5 dias",
    "Há 1 semana",
    "Há 2 semanas",
  ];
  const seed = _patient.id.charCodeAt(1) % options.length;
  return options[seed] ?? "Há 1 semana";
}

/** Objetivo mock — quando existir campo goal no metadata */
function getGoal(patient: PatientRow): string {
  const goal = patient.metadata?.fitness_goal || patient.metadata?.goal;
  if (typeof goal === "string") return goal;
  return "Não definido";
}

/** Status do paciente baseado no campo status do profile */
function getPatientStatus(
  patient: PatientRow,
): "em-dia" | "reavaliar" | "atencao" {
  const metaStatus = patient.metadata?.nutri_status;
  if (
    metaStatus === "em-dia" ||
    metaStatus === "reavaliar" ||
    metaStatus === "atencao"
  )
    return metaStatus;
  if (patient.status === "active") return "em-dia";
  if (patient.status === "paused") return "reavaliar";
  if (patient.status === "churned") return "atencao";
  return "em-dia";
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    active: "Ativo",
    paused: "Pausado",
    churned: "Inativo",
    pending: "Pendente",
    "em-dia": "Em dia",
    reavaliar: "Reavaliar",
    atencao: "Atenção",
  };
  return map[s] ?? s;
}

/* ── Component ──────────────────────────────────────────────── */
export function PatientsPageClient({
  patients,
}: {
  patients: PatientRow[];
}) {
  const [query, setQuery] = useState("");

  const filtered = patients.filter((p) => {
    // Search logic
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const name = (p.display_name ?? p.full_name).toLowerCase();
      const goal = getGoal(p).toLowerCase();
      if (!name.includes(q) && !goal.includes(q)) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen flex bg-kore-bg text-kore-ink">
      <Sidebar />
      <MobileSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />

        <main className="flex-1 px-3 sm:px-6 py-6 space-y-6">
          {/* ── Header ───────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 grid place-items-center">
                <Users size={20} className="text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">
                  Pacientes
                </h1>
                <p className="text-sm text-kore-muted mt-0.5">
                  {patients.length} pacientes cadastrados · {filtered.length}{" "}
                  filtrados
                </p>
              </div>
            </div>
          </div>

          {/* ── Filters & Search ─────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted"
              />
              <input
                placeholder="Buscar paciente…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:border-kore-emerald transition"
              />
            </div>

            <PatientFilters />
          </div>

          {/* ── Table ────────────────────────────────────────── */}
          <section className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-kore-muted font-bold bg-kore-bg/60 border-y border-kore-border">
                    <th className="text-left font-bold py-3 px-5">
                      Paciente
                    </th>
                    <th className="text-left font-bold py-3 px-3">
                      Objetivo
                    </th>
                    <th className="text-left font-bold py-3 px-3">
                      Última Consulta
                    </th>
                    <th className="text-left font-bold py-3 px-3">
                      Cadastrado em
                    </th>
                    <th className="text-left font-bold py-3 px-3">
                      Status
                    </th>
                    <th className="text-right font-bold py-3 px-5 w-24" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <PatientRow key={p.id} patient={p} />
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 px-5 text-center text-sm text-kore-muted"
                      >
                        Nenhum paciente encontrado com o status selecionado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

/* ── Row ────────────────────────────────────────────────────── */
function PatientRow({ patient }: { patient: PatientRow }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const name = patient.display_name ?? patient.full_name;
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const goal = getGoal(patient);
  const lastConsultation = getLastConsultation(patient);
  const patientStatus = getPatientStatus(patient);

  const handleDelete = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsDeleting(true);
    try {
      await deletePatient(patient.id);
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

  return (
    <>
      <EditPatientModal open={editOpen} onOpenChange={setEditOpen} patient={{ ...patient, ...patient.metadata }} />
      <tr 
        onClick={() => setEditOpen(true)}
        className="border-b border-kore-border last:border-b-0 cursor-pointer hover:bg-kore-bg/60 transition group"
      >
        <td className="py-3 px-5">
          <div className="flex items-center gap-3">
            {patient.avatar_url ? (
              <img
                src={patient.avatar_url}
                alt={name}
                className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-kore-emerald-soft text-sm font-bold grid place-items-center flex-shrink-0 text-kore-emerald-deep">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-kore-ink text-sm truncate">{name}</p>
            </div>
          </div>
        </td>
        <td className="py-3 px-3">
          <span className="text-xs font-semibold text-kore-subink">{goal}</span>
        </td>
        <td className="py-3 px-3 text-xs text-kore-subink whitespace-nowrap">
          {lastConsultation}
        </td>
        <td className="py-3 px-3 text-xs text-kore-subink whitespace-nowrap">
          {formatDate(patient.created_at)}
        </td>
        <td className="py-3 px-3">
          {patient.auth_user_id === null ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse mr-1" />
              AGUARDANDO ATIVAÇÃO
            </span>
          ) : (
            <StatusBadge status={patientStatus} />
          )}
        </td>
        <td className="py-3 px-5 text-right w-32">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/dashboard/nutri/patients/${patient.id}`);
              }}
              className="text-xs font-bold text-kore-emerald hover:text-white bg-kore-emerald/10 hover:bg-kore-emerald px-3 py-1.5 rounded-lg transition"
            >
              Ver
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

/* ── Badges ─────────────────────────────────────────────────── */
function StatusBadge({
  status,
}: {
  status: "em-dia" | "reavaliar" | "atencao";
}) {
  const styles: Record<string, string> = {
    "em-dia":
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300 ring-1 ring-inset ring-emerald-200/70 dark:ring-emerald-500/30",
    reavaliar:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/12 dark:text-amber-300 ring-1 ring-inset ring-amber-200/70 dark:ring-amber-500/30",
    atencao:
      "bg-rose-50 text-rose-700 dark:bg-rose-500/12 dark:text-rose-300 ring-1 ring-inset ring-rose-200/70 dark:ring-rose-500/30",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}
    >
      {statusLabel(status)}
    </span>
  );
}