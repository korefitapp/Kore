"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Copy,
  Pencil,
  Flame,
  MoreHorizontal,
  Plus,
  Search,
  Utensils,
  UserPlus,
  Trash2,
  Loader2,
  Eye,
} from "lucide-react";
import { MobileSidebar, Sidebar } from "../../_components/Sidebar";
import { Topbar } from "../../_components/Topbar";
import { cloneGlobalTemplate, assignMealPlanToPatient, deleteMealPlan } from "@/app/actions/nutri-actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import { MealBuilderModal } from "./MealBuilderModal";
import { CreateMealPlanModal } from "../../_components/CreateMealPlanModal";

/* ── Types ──────────────────────────────────────────────────── */
type Objective =
  | "hipertrofia"
  | "emagrecimento"
  | "definicao"
  | "restricoes";

interface MealPlan {
  id: string;
  title: string;
  description: string;
  daily_kcal_goal: number;
  carbs_g: number;
  protein_g: number;
  fat_g: number;
  objective: Objective | string;
  meals_count: number;
  created_at: string;
  is_global_template?: boolean;
}

const OBJECTIVE_FILTERS: { key: Objective | "all"; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "hipertrofia", label: "Hipertrofia" },
  { key: "emagrecimento", label: "Emagrecimento" },
  { key: "definicao", label: "Definição" },
  { key: "restricoes", label: "Restrições Alimentares" },
];

// Mocks removidos (Agora usando BD)

/* ── Helpers ────────────────────────────────────────────────── */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const OBJECTIVE_LABELS: Record<Objective, string> = {
  hipertrofia: "Hipertrofia",
  emagrecimento: "Emagrecimento",
  definicao: "Definição",
  restricoes: "Restrições",
};

const OBJECTIVE_COLORS: Record<Objective, string> = {
  hipertrofia:
    "bg-blue-50 text-blue-700 dark:bg-blue-500/12 dark:text-blue-300 ring-1 ring-inset ring-blue-200/70 dark:ring-blue-500/30",
  emagrecimento:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/12 dark:text-amber-300 ring-1 ring-inset ring-amber-200/70 dark:ring-amber-500/30",
  definicao:
    "bg-violet-50 text-violet-700 dark:bg-violet-500/12 dark:text-violet-300 ring-1 ring-inset ring-violet-200/70 dark:ring-violet-500/30",
  restricoes:
    "bg-rose-50 text-rose-700 dark:rose-500/12 dark:text-rose-300 ring-1 ring-inset ring-rose-200/70 dark:ring-rose-500/30",
};

function calcMacroPercents(carbs: number, protein: number, fat: number) {
  const total = carbs * 4 + protein * 4 + fat * 9;
  if (total === 0) return { carbs: 0, protein: 0, fat: 0 };
  return {
    carbs: Math.round(((carbs * 4) / total) * 100),
    protein: Math.round(((protein * 4) / total) * 100),
    fat: Math.round(((fat * 9) / total) * 100),
  };
}

/* ── Component ──────────────────────────────────────────────── */
export function MealPlansPageClient({
  nutritionistId: _nutritionistId,
  initialPlans = [],
  patients = [],
}: {
  nutritionistId: string;
  initialPlans?: any[];
  patients?: any[];
}) {
  const [filter, setFilter] = useState<Objective | "all">("all");
  const [query, setQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const router = useRouter();

  const plans = initialPlans;

  const filtered = plans.filter((p) => {
    // A string selecionada no filtro (ex: "restricoes") deve bater com o "objective" da tabela
    if (filter !== "all" && p.objective?.toLowerCase() !== filter) {
      // Tenta um fallback caso o objective venha com caixa alta ou espaços diferentes no DB
      if (!p.objective?.toLowerCase().includes(filter)) return false;
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      if (
        !p.title?.toLowerCase().includes(q) &&
        !p.description?.toLowerCase().includes(q)
      )
        return false;
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
                <Utensils size={20} className="text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">
                  Modelos de Cardápios
                </h1>
                <p className="text-sm text-kore-muted mt-0.5">
                  {plans.length} modelos disponíveis · {filtered.length}{" "}
                  exibidos
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-emerald text-sm px-4 py-2.5 inline-flex items-center gap-2 self-start sm:self-auto"
            >
              <Plus size={16} strokeWidth={2.8} />
              Criar Novo Cardápio
            </button>
          </div>

          {/* ── Filters & Search ─────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted"
              />
              <input
                placeholder="Buscar cardápio…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:border-kore-emerald transition"
              />
            </div>

            <div className="flex items-center bg-kore-bg rounded-xl p-0.5 border border-kore-border overflow-x-auto">
              {OBJECTIVE_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`relative px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition ${
                    filter === f.key
                      ? "text-kore-ink"
                      : "text-kore-muted hover:text-kore-ink"
                  }`}
                >
                  {filter === f.key && (
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-kore-card rounded-lg shadow-kore-soft"
                    />
                  )}
                  <span className="relative">{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Grid de Cardápios ────────────────────────────── */}
          {filtered.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-kore-border rounded-2xl bg-kore-bg">
              <div className="w-16 h-16 bg-kore-card rounded-full grid place-items-center mb-4 text-kore-muted shadow-sm">
                <Utensils size={24} />
              </div>
              <h3 className="text-lg font-bold text-kore-ink mb-1">
                Nenhum modelo encontrado
              </h3>
              <p className="text-sm text-kore-muted max-w-sm mb-6">
                Não existem cardápios criados para a categoria selecionada. Você pode tentar buscar por outro termo ou criar um novo agora mesmo.
              </p>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-kore px-4 py-2 text-sm inline-flex items-center gap-2"
              >
                <Plus size={16} />
                Criar Novo Cardápio
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((plan) => (
                <MealPlanCard key={plan.id} plan={plan} patients={patients} />
              ))}
            </div>
          )}
        </main>
        {/* Modal de Criação */}
        <CreateMealPlanModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
        />
      </div>
    </div>
  );
}

/* ── Card ───────────────────────────────────────────────────── */
function MealPlanCard({ plan, patients }: { plan: MealPlan; patients: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isAssigning, startAssignTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MealPlan | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState("");

  const percents = calcMacroPercents(plan.carbs_g, plan.protein_g, plan.fat_g);

  const handleDuplicate = () => {
    startTransition(async () => {
      try {
        const newId = await cloneGlobalTemplate(plan.id); // serve para próprios tbm
        const { toast } = require("@/store/useToastStore");
        toast.success("Modelo duplicado com sucesso!");
        router.push(`/dashboard/nutri/meal-plans/${newId}/builder`);
      } catch (error) {
        const { toast } = require("@/store/useToastStore");
        toast.error("Erro ao duplicar modelo.");
      }
    });
  };

  const handleAssign = () => {
    const { toast } = require("@/store/useToastStore");
    if (!selectedPatientId) return toast.error("Selecione um paciente");
    startAssignTransition(async () => {
      try {
        const newlyAssignedPlan = await assignMealPlanToPatient(plan.id, selectedPatientId);
        setShowAssignModal(false);
        // Abrir o construtor imediatamente para a nutri poder editar a cópia!
        setEditingPlan(newlyAssignedPlan);
      } catch (error) {
        toast.error("Erro ao atribuir.");
      }
    });
  };

  const handleDelete = () => {
    startDeleteTransition(async () => {
      try {
        await deleteMealPlan(plan.id);
        const { toast } = require("@/store/useToastStore");
        toast.success("Excluído com sucesso!");
        setShowDeleteModal(false);
      } catch (error) {
        const { toast } = require("@/store/useToastStore");
        toast.error("Erro ao excluir.");
      }
    });
  };

  return (
    <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm flex flex-col overflow-hidden hover:border-kore-emerald/40 transition group">
      {/* Top section */}
      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* Title & Objective Badge */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-extrabold text-sm leading-snug text-kore-ink line-clamp-2">
            {plan.is_global_template && <span className="text-emerald-500 mr-1">★ KORE</span>}
            {plan.title}
          </h3>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${
              OBJECTIVE_COLORS[plan.objective?.toString().toLowerCase() as Objective] || "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200"
            }`}
          >
            {OBJECTIVE_LABELS[plan.objective?.toString().toLowerCase() as Objective] || plan.objective}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-kore-subink leading-relaxed line-clamp-2">
          {plan.description}
        </p>

        {/* Kcal highlight */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 grid place-items-center flex-shrink-0">
            <Flame size={16} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-lg font-extrabold text-kore-ink tabular-nums">
              {(plan.daily_kcal_goal || 0).toLocaleString("pt-BR")}
              <span className="text-xs font-bold text-kore-muted ml-1">
                kcal
              </span>
            </p>
            <p className="text-[10px] text-kore-muted font-semibold">
              {plan.meals_count} refeições · Criado em{" "}
              {formatDate(plan.created_at)}
            </p>
          </div>
        </div>

        {/* Macronutrients */}
        <div className="space-y-2.5">
          <MacroBar
            label="Carboidratos"
            grams={plan.carbs_g}
            percent={percents.carbs}
            color="bg-sky-500"
            textColor="text-sky-600 dark:text-sky-300"
          />
          <MacroBar
            label="Proteínas"
            grams={plan.protein_g}
            percent={percents.protein}
            color="bg-emerald-500"
            textColor="text-emerald-600 dark:text-emerald-300"
          />
          <MacroBar
            label="Gorduras"
            grams={plan.fat_g}
            percent={percents.fat}
            color="bg-amber-500"
            textColor="text-amber-600 dark:text-amber-300"
          />
        </div>
      </div>

      {/* Footer actions */}
      <div className="border-t border-kore-border px-5 py-3 flex items-center justify-between flex-wrap gap-2">
        
        {plan.is_global_template ? (
          <>
            <button
              onClick={() => setEditingPlan(plan)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-kore-ink bg-kore-bg hover:bg-kore-border transition border border-kore-border"
              title="Ver Cardápio"
            >
              <Eye size={13} />
              Ver
            </button>
            <button
              onClick={handleDuplicate}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-kore-ink bg-kore-bg hover:bg-kore-border transition disabled:opacity-50 border border-kore-border"
              title="Duplicar"
            >
              {isPending ? <Loader2 size={13} className="animate-spin" /> : <Copy size={13} />}
              Duplicar
            </button>
            <button
              onClick={() => setShowAssignModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-kore-emerald-deep bg-kore-emerald-soft hover:bg-kore-emerald hover:text-white transition border border-transparent"
            >
              <UserPlus size={13} />
              Atribuir
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAssignModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-kore-emerald-deep bg-kore-emerald-soft hover:bg-kore-emerald hover:text-white transition"
              >
                <UserPlus size={13} />
                Atribuir
              </button>
              <button
                onClick={() => setEditingPlan(plan)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-kore-ink bg-kore-bg hover:bg-kore-border transition border border-kore-border"
              >
                <Pencil size={13} />
                Editar
              </button>
              <button
                onClick={handleDuplicate}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-kore-ink bg-kore-bg hover:bg-kore-border transition border border-kore-border disabled:opacity-50"
                title="Duplicar"
              >
                {isPending ? <Loader2 size={13} className="animate-spin" /> : <Copy size={13} />}
              </button>
            </div>
            
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 transition"
              title="Excluir"
            >
              <Trash2 size={13} />
            </button>
          </>
        )}
      </div>

      {/* Modal de Atribuir Paciente */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => !isAssigning && setShowAssignModal(false)}
        title="Atribuir Cardápio"
        description={`Selecione um paciente para atribuir a dieta "${plan.title}". Uma cópia será gerada e vinculada ao perfil dele.`}
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-kore-ink">Paciente</label>
            <select
              className="w-full px-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink focus:outline-none focus:border-kore-emerald transition"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              disabled={isAssigning || patients.length === 0}
            >
              {patients.length === 0 ? (
                <option value="" disabled>Nenhum paciente cadastrado</option>
              ) : (
                <option value="" disabled>Selecione um paciente...</option>
              )}
              {patients.map(p => {
                const display = p.full_name || p.display_name || "Paciente sem nome";
                return <option key={p.id} value={p.id}>{display}</option>;
              })}
            </select>
          </div>
          
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setShowAssignModal(false)}
              disabled={isAssigning}
              className="px-4 py-2 rounded-xl text-sm font-bold text-kore-ink bg-kore-bg hover:bg-kore-card transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleAssign}
              disabled={isAssigning || !selectedPatientId}
              className="btn-emerald px-4 py-2 text-sm flex items-center gap-2"
            >
              {isAssigning && <Loader2 size={16} className="animate-spin" />}
              {isAssigning ? "Atribuindo..." : "Atribuir Agora"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        title="Excluir Cardápio"
        description="Tem certeza que deseja excluir este modelo? Esta ação não pode ser desfeita e ele será removido permanentemente."
      >
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-sm font-bold text-kore-ink bg-kore-bg hover:bg-kore-card transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 transition flex items-center gap-2"
          >
            {isDeleting && <Loader2 size={16} className="animate-spin" />}
            {isDeleting ? "Excluindo..." : "Sim, Excluir"}
          </button>
        </div>
      </Modal>

      {editingPlan && (
        <MealBuilderModal
          isOpen={!!editingPlan}
          onClose={() => setEditingPlan(null)}
          plan={editingPlan}
        />
      )}
    </div>
  );
}

/* ── MacroBar ───────────────────────────────────────────────── */
function MacroBar({
  label,
  grams,
  percent,
  color,
  textColor,
}: {
  label: string;
  grams: number;
  percent: number;
  color: string;
  textColor: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold text-kore-muted w-20 flex-shrink-0">
        {label}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-kore-bg overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span
        className={`text-[11px] font-bold tabular-nums w-16 text-right ${textColor}`}
      >
        {grams}g{" "}
        <span className="text-kore-muted text-[10px]">({percent}%)</span>
      </span>
    </div>
  );
}