"use client";

import { useState } from "react";
import {
  BookOpen,
  Dumbbell,
  Edit3,
  Plus,
  Search,
} from "lucide-react";
import { MobileSidebar, Sidebar } from "../../_components/Sidebar";
import { Topbar } from "../../_components/Topbar";

/* ── Types ──────────────────────────────────────────────────── */
interface Exercise {
  id: string;
  name: string;
  muscle_group: string | null;
  category: string | null;
  image_url: string | null;
  description: string | null;
  created_at: string;
}

type MuscleFilter =
  | "all"
  | "peito"
  | "costas"
  | "pernas"
  | "ombros"
  | "biceps"
  | "triceps"
  | "core";

const FILTERS: { key: MuscleFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "peito", label: "Peito" },
  { key: "costas", label: "Costas" },
  { key: "pernas", label: "Pernas" },
  { key: "ombros", label: "Ombros" },
  { key: "biceps", label: "Bíceps" },
  { key: "triceps", label: "Tríceps" },
  { key: "core", label: "Core" },
];

/* ── Helpers ────────────────────────────────────────────────── */
const BADGE_COLORS: Record<string, string> = {
  peito:
    "bg-blue-50 text-blue-700 dark:bg-blue-500/12 dark:text-blue-300 ring-1 ring-inset ring-blue-200/70 dark:ring-blue-500/30",
  costas:
    "bg-violet-50 text-violet-700 dark:bg-violet-500/12 dark:text-violet-300 ring-1 ring-inset ring-violet-200/70 dark:ring-violet-500/30",
  pernas:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300 ring-1 ring-inset ring-emerald-200/70 dark:ring-emerald-500/30",
  ombros:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/12 dark:text-amber-300 ring-1 ring-inset ring-amber-200/70 dark:ring-amber-500/30",
  biceps:
    "bg-rose-50 text-rose-700 dark:bg-rose-500/12 dark:text-rose-300 ring-1 ring-inset ring-rose-200/70 dark:ring-rose-500/30",
  triceps:
    "bg-orange-50 text-orange-700 dark:bg-orange-500/12 dark:text-orange-300 ring-1 ring-inset ring-orange-200/70 dark:ring-orange-500/30",
  core:
    "bg-teal-50 text-teal-700 dark:bg-teal-500/12 dark:text-teal-300 ring-1 ring-inset ring-teal-200/70 dark:ring-teal-500/30",
  default:
    "bg-slate-50 text-slate-700 dark:bg-slate-500/12 dark:text-slate-300 ring-1 ring-inset ring-slate-200/70 dark:ring-slate-500/30",
};

function getBadgeColor(group: string | null): string {
  if (!group) return BADGE_COLORS.default!;
  return (BADGE_COLORS as Record<string, string | undefined>)[group.toLowerCase()] ?? BADGE_COLORS.default!;
}

function capitalize(s: string | null): string {
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/* ── Component ──────────────────────────────────────────────── */
export function LibraryClient({ exercises }: { exercises: Exercise[] }) {
  const [filter, setFilter] = useState<MuscleFilter>("all");
  const [query, setQuery] = useState("");

  const filtered = exercises.filter((ex) => {
    // Muscle group filter
    if (filter !== "all") {
      const group = (ex.muscle_group ?? "").toLowerCase();
      if (group !== filter) return false;
    }

    // Text search
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const name = ex.name.toLowerCase();
      const group = (ex.muscle_group ?? "").toLowerCase();
      const cat = (ex.category ?? "").toLowerCase();
      if (!name.includes(q) && !group.includes(q) && !cat.includes(q))
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
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 grid place-items-center">
                <BookOpen size={20} className="text-violet-600" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">
                  Biblioteca de Exercícios
                </h1>
                <p className="text-sm text-kore-muted mt-0.5">
                  {exercises.length} exercícios cadastrados · {filtered.length}{" "}
                  exibidos
                </p>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-kore-emerald hover:brightness-110 transition shadow-kore-emerald"
            >
              <Plus size={16} strokeWidth={2.5} />
              Novo Exercício
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
                placeholder="Buscar exercício…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:border-kore-emerald transition"
              />
            </div>

            <div className="flex items-center flex-wrap gap-1 bg-kore-bg rounded-xl p-0.5 border border-kore-border">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`relative px-3 py-1.5 text-xs font-bold rounded-lg transition ${
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

          {/* ── Grid ─────────────────────────────────────────── */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((ex) => (
                <ExerciseCard key={ex.id} exercise={ex} />
              ))}
            </div>
          ) : (
            <EmptyState hasExercises={exercises.length > 0} />
          )}
        </main>
      </div>
    </div>
  );
}

/* ── Card ───────────────────────────────────────────────────── */
function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const group = exercise.muscle_group;
  const badgeColor = getBadgeColor(group);

  return (
    <article className="group rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm overflow-hidden hover:border-kore-emerald/30 hover:shadow-kore-emerald transition-all duration-200">
      {/* Imagem / GIF placeholder */}
      <div className="relative aspect-video bg-kore-bg/80 grid place-items-center overflow-hidden">
        {exercise.image_url ? (
          <img
            src={exercise.image_url}
            alt={exercise.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-kore-muted">
            <Dumbbell size={32} strokeWidth={1.5} />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Sem mídia
            </span>
          </div>
        )}

        {/* Badge do grupo muscular */}
        {group && (
          <span
            className={`absolute top-3 left-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${badgeColor}`}
          >
            {capitalize(group)}
          </span>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-sm text-kore-ink truncate">
            {exercise.name}
          </h3>
          {exercise.category && (
            <p className="text-[11px] text-kore-muted mt-0.5">
              {capitalize(exercise.category)}
            </p>
          )}
        </div>

        {exercise.description && (
          <p className="text-xs text-kore-subink line-clamp-2">
            {exercise.description}
          </p>
        )}

        <div className="flex items-center justify-end pt-1">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-kore-subink hover:text-kore-ink bg-kore-bg hover:bg-kore-border/50 transition"
          >
            <Edit3 size={12} />
            Editar
          </button>
        </div>
      </div>
    </article>
  );
}

/* ── Empty State ────────────────────────────────────────────── */
function EmptyState({ hasExercises }: { hasExercises: boolean }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-kore-border bg-kore-card/30 px-6 py-16 text-center">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-900/20 grid place-items-center mb-4">
        <Dumbbell size={28} className="text-violet-500" />
      </div>
      {hasExercises ? (
        <>
          <h3 className="text-base font-extrabold text-kore-ink">
            Nenhum exercício encontrado
          </h3>
          <p className="text-sm text-kore-muted mt-1 max-w-sm mx-auto">
            Tente ajustar os filtros ou o termo de busca para encontrar o que
            procura.
          </p>
        </>
      ) : (
        <>
          <h3 className="text-base font-extrabold text-kore-ink">
            Sua biblioteca está vazia
          </h3>
          <p className="text-sm text-kore-muted mt-1 max-w-sm mx-auto">
            Comece cadastrando o primeiro exercício para montar seus treinos de
            hipertrofia.
          </p>
          <button
            type="button"
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-kore-emerald hover:brightness-110 transition shadow-kore-emerald"
          >
            <Plus size={16} strokeWidth={2.5} />
            Cadastrar primeiro exercício
          </button>
        </>
      )}
    </div>
  );
}