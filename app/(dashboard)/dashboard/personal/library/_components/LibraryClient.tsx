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
import { CreateExerciseModal } from "../../_components/CreateExerciseModal";
import { EditExerciseModal } from "../../_components/EditExerciseModal";

interface Exercise {
  id: string;
  name: string;
  target_muscle_group: string | null;
  equipment: string | null;
  mechanic: string | null;
  category: string | null;
  image_url: string | null;
  description: string | null;
  created_at: string;
}

const TABS = [
  "Todos",
  "Peito",
  "Costas",
  "Pernas",
  "Ombros",
  "Bíceps",
  "Tríceps",
  "Core",
  "Cardio",
  "Funcional"
];

function Badge({ children, variant = "primary" }: { children: React.ReactNode, variant?: "primary" | "secondary" }) {
  if (variant === "secondary") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
        {children}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-kore-emerald-soft text-kore-emerald-deep dark:bg-kore-emerald/20 dark:text-kore-emerald">
      {children}
    </span>
  );
}

export function LibraryClient({ exercises }: { exercises: Exercise[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Todos");
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);

  const filteredExercises = exercises.filter((ex) => {
    // 1. Filtrar pela aba
    if (activeTab !== "Todos") {
      const targetGroup = ex.target_muscle_group ?? "";
      if (targetGroup.toLowerCase() !== activeTab.toLowerCase()) return false;
    }

    // 2. Filtrar pela busca
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      if (!ex.name.toLowerCase().includes(q)) return false;
    }

    return true;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-kore-bg text-kore-ink">
      <Sidebar />
      <MobileSidebar />

      <div className="flex-1 min-w-0 flex flex-col h-screen">
        <Topbar />

        <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 space-y-6">
          {/* Header */}
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
                  {exercises.length} exercícios cadastrados · {filteredExercises.length} exibidos
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsExerciseModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-kore-emerald hover:brightness-110 transition shadow-kore-emerald"
            >
              <Plus size={16} strokeWidth={2.5} />
              Novo Exercício
            </button>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted"
              />
              <input
                placeholder="Buscar exercício…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:border-kore-emerald transition"
              />
            </div>

            <div className="flex items-center flex-wrap gap-1 bg-kore-bg rounded-xl p-0.5 border border-kore-border">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                    activeTab === tab
                      ? "text-kore-ink"
                      : "text-kore-muted hover:text-kore-ink"
                  }`}
                >
                  {activeTab === tab && (
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-kore-card rounded-lg shadow-kore-soft"
                    />
                  )}
                  <span className="relative">{tab}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {filteredExercises.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-6">
              {filteredExercises.map((ex) => (
                <ExerciseCard key={ex.id} exercise={ex} />
              ))}
            </div>
          ) : (
            <EmptyState hasExercises={exercises.length > 0} onOpenModal={() => setIsExerciseModalOpen(true)} />
          )}
        </main>
      </div>
      <CreateExerciseModal isOpen={isExerciseModalOpen} onClose={() => setIsExerciseModalOpen(false)} />
    </div>
  );
}

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm overflow-hidden hover:border-kore-emerald/30 hover:shadow-kore-emerald transition-all duration-200">
      <div>
        {/* Placeholder de Mídia */}
        <div className="relative aspect-video bg-kore-bg/80 grid place-items-center overflow-hidden border-b border-kore-border/50">
          {exercise.image_url ? (
            <img
              src={exercise.image_url}
              alt={exercise.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-kore-muted">
              <Dumbbell size={32} strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-base text-kore-ink line-clamp-2">
            {exercise.name}
          </h3>
          
          <div className="flex flex-wrap items-center gap-1.5">
            {exercise.target_muscle_group && (
              <Badge variant="primary">{exercise.target_muscle_group}</Badge>
            )}
            {exercise.equipment && (
              <Badge variant="secondary">{exercise.equipment}</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-3 bg-kore-bg/50 border-t border-kore-border/50 flex items-center justify-between">
        <span className="text-[11px] font-medium text-kore-muted">
          {exercise.mechanic || "Geral"}
        </span>
        <button
          type="button"
          onClick={() => setIsEditOpen(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-kore-subink hover:text-kore-ink bg-kore-bg hover:bg-kore-border/50 transition"
        >
          <Edit3 size={12} />
          Editar
        </button>
      </div>

      <EditExerciseModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} exercise={exercise as any} />
    </article>
  );
}

function EmptyState({ hasExercises, onOpenModal }: { hasExercises: boolean; onOpenModal: () => void }) {
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
            Tente ajustar os filtros ou o termo de busca para encontrar o que procura.
          </p>
        </>
      ) : (
        <>
          <h3 className="text-base font-extrabold text-kore-ink">
            Sua biblioteca está vazia
          </h3>
          <p className="text-sm text-kore-muted mt-1 max-w-sm mx-auto">
            Comece cadastrando o primeiro exercício para montar seus treinos de hipertrofia.
          </p>
          <button
            type="button"
            onClick={onOpenModal}
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