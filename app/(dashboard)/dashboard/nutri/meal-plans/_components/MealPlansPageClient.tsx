"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Copy,
  Edit3,
  Flame,
  MoreHorizontal,
  Plus,
  Search,
  Utensils,
  UserPlus,
  Trash2,
} from "lucide-react";
import { MobileSidebar, Sidebar } from "../../_components/Sidebar";
import { Topbar } from "../../_components/Topbar";

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
  total_kcal: number;
  carbs_g: number;
  protein_g: number;
  fat_g: number;
  objective: Objective;
  meals_count: number;
  created_at: string;
}

const OBJECTIVE_FILTERS: { key: Objective | "all"; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "hipertrofia", label: "Hipertrofia" },
  { key: "emagrecimento", label: "Emagrecimento" },
  { key: "definicao", label: "Definição" },
  { key: "restricoes", label: "Restrições Alimentares" },
];

/* ── Mock Data ──────────────────────────────────────────────── */
const MOCK_PLANS: MealPlan[] = [
  {
    id: "mp-001",
    title: "Dieta Hipertrofia Avançada — 3000 kcal",
    description:
      "Plano para ganho de massa muscular com superávit calórico moderado e distribuição otimizada de proteínas.",
    total_kcal: 3000,
    carbs_g: 375,
    protein_g: 225,
    fat_g: 83,
    objective: "hipertrofia",
    meals_count: 6,
    created_at: "2025-12-10T10:00:00Z",
  },
  {
    id: "mp-002",
    title: "Emagrecimento Sustentável — 1800 kcal",
    description:
      "Déficit calórico moderado com foco em saciedade e alimentos de alta densidade nutricional.",
    total_kcal: 1800,
    carbs_g: 180,
    protein_g: 150,
    fat_g: 50,
    objective: "emagrecimento",
    meals_count: 5,
    created_at: "2025-11-28T14:30:00Z",
  },
  {
    id: "mp-003",
    title: "Definição Muscular — 2200 kcal",
    description:
      "Fase de cutting com preservação de massa magra. Alto teor proteico e carboidratos periodizados.",
    total_kcal: 2200,
    carbs_g: 200,
    protein_g: 210,
    fat_g: 60,
    objective: "definicao",
    meals_count: 6,
    created_at: "2026-01-05T09:15:00Z",
  },
  {
    id: "mp-004",
    title: "Restrição: Sem Lactose + Low FODMAP",
    description:
      "Cardápio adaptado para pacientes com intolerância à lactose e sensibilidade a FODMAPs.",
    total_kcal: 2000,
    carbs_g: 230,
    protein_g: 140,
    fat_g: 62,
    objective: "restricoes",
    meals_count: 5,
    created_at: "2026-02-14T11:00:00Z",
  },
  {
    id: "mp-005",
    title: "Hipertrofia Iniciante — 2600 kcal",
    description:
      "Plano introdutório para praticantes iniciantes com progressão gradual de calorias.",
    total_kcal: 2600,
    carbs_g: 310,
    protein_g: 190,
    fat_g: 72,
    objective: "hipertrofia",
    meals_count: 5,
    created_at: "2026-03-01T08:00:00Z",
  },
  {
    id: "mp-006",
    title: "Emagrecimento Express — 1500 kcal",
    description:
      "Protocolo de 4 semanas para início de perda de peso com alta aderência e simplicidade nas refeições.",
    total_kcal: 1500,
    carbs_g: 140,
    protein_g: 130,
    fat_g: 45,
    objective: "emagrecimento",
    meals_count: 4,
    created_at: "2026-03-20T16:00:00Z",
  },
  {
    id: "mp-007",
    title: "Restrição: Diabetes Tipo 2",
    description:
      "Cardápio com baixo índice glicêmico e controle de carboidratos para pacientes diabéticos.",
    total_kcal: 1900,
    carbs_g: 160,
    protein_g: 155,
    fat_g: 65,
    objective: "restricoes",
    meals_count: 6,
    created_at: "2026-04-10T13:45:00Z",
  },
  {
    id: "mp-008",
    title: "Definição Feminina — 1700 kcal",
    description:
      "Plano focado em definição muscular para público feminino com ajuste hormonal considerado.",
    total_kcal: 1700,
    carbs_g: 155,
    protein_g: 135,
    fat_g: 52,
    objective: "definicao",
    meals_count: 5,
    created_at: "2026-04-28T10:30:00Z",
  },
];

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
    "bg-rose-50 text-rose-700 dark:bg-rose-500/12 dark:text-rose-300 ring-1 ring-inset ring-rose-200/70 dark:ring-rose-500/30",
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
}: {
  nutritionistId: string;
}) {
  const [filter, setFilter] = useState<Objective | "all">("all");
  const [query, setQuery] = useState("");

  // TODO: quando a tabela meal_plans existir, receber plans via props em vez de mock
  const plans = MOCK_PLANS;

  const filtered = plans.filter((p) => {
    if (filter !== "all" && p.objective !== filter) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      if (
        !p.title.toLowerCase().includes(q) &&
        !p.description.toLowerCase().includes(q)
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
            <div className="py-20 text-center text-sm text-kore-muted">
              Nenhum cardápio corresponde ao filtro atual.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((plan) => (
                <MealPlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ── Card ───────────────────────────────────────────────────── */
function MealPlanCard({ plan }: { plan: MealPlan }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const percents = calcMacroPercents(plan.carbs_g, plan.protein_g, plan.fat_g);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm flex flex-col overflow-hidden hover:border-kore-emerald/40 transition group">
      {/* Top section */}
      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* Title & Objective Badge */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-extrabold text-sm leading-snug text-kore-ink line-clamp-2">
            {plan.title}
          </h3>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${OBJECTIVE_COLORS[plan.objective]}`}
          >
            {OBJECTIVE_LABELS[plan.objective]}
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
              {plan.total_kcal.toLocaleString("pt-BR")}
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
      <div className="border-t border-kore-border px-5 py-3 flex items-center justify-between">
        <Link
          href={`/dashboard/nutri/meal-plans/${plan.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-kore-emerald-deep bg-kore-emerald-soft hover:bg-kore-emerald hover:text-white transition"
        >
          <Edit3 size={13} />
          Editar
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 rounded-lg grid place-items-center text-kore-subink hover:text-kore-ink hover:bg-kore-bg transition"
            aria-label="Mais opções"
          >
            <MoreHorizontal size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 bottom-full mb-1 w-48 rounded-xl border border-kore-border bg-kore-card shadow-lg z-20 py-1 animate-in fade-in slide-in-from-bottom-1">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-kore-ink hover:bg-kore-bg transition"
              >
                <UserPlus size={14} className="text-kore-subink" />
                Atribuir a Paciente
              </button>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-kore-ink hover:bg-kore-bg transition"
              >
                <Copy size={14} className="text-kore-subink" />
                Duplicar Modelo
              </button>
              <div className="border-t border-kore-border my-1" />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
              >
                <Trash2 size={14} />
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>
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