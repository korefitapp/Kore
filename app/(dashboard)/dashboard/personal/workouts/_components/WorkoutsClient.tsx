"use client";

import { useState } from "react";
import { Dumbbell, Plus, Search, MoreVertical, Edit3, Copy, Trash2, Eye, Target, Activity, Zap, AlertTriangle } from "lucide-react";
import { MobileSidebar, Sidebar } from "../../_components/Sidebar";
import { Topbar } from "../../_components/Topbar";
import { WorkoutBuilderModal } from "./WorkoutBuilderModal";
import { WorkoutViewerModal } from "./WorkoutViewerModal";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { EmptyState } from "@/app/(dashboard)/_components/EmptyState";
import { useToastStore } from "@/store/useToastStore";

interface Workout {
  id: string;
  name: string;
  objective: string | null;
  level: string | null;
  description: string | null;
  professional_id: string | null;
  created_at: string;
}

interface Exercise {
  id: string;
  name: string;
  target_muscle_group: string | null;
  category: string | null;
}

export function WorkoutsClient({
  workouts,
  exercises,
  userId,
  error,
}: {
  workouts: Workout[];
  exercises: Exercise[];
  userId: string;
  error?: string | null;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [viewerWorkoutId, setViewerWorkoutId] = useState<string | null>(null);
  const [editBaseId, setEditBaseId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const editBase = searchParams.get("editBase");
    const sId = searchParams.get("studentId");
    
    if (editBase && sId) {
      setEditBaseId(editBase);
      setStudentId(sId);
      setIsBuilderOpen(true);
      // Let it stay in URL so modal can fetch, or we fetch here. The modal fetches on isOpen + editBaseId.
      // So we don't replace the URL immediately, or we do, but state holds it.
      // State holds it, so we can replace URL.
      router.replace("/dashboard/personal/workouts");
    } else if (searchParams.get("new") === "true") {
      setEditBaseId(null);
      if (sId) setStudentId(sId);
      setIsBuilderOpen(true);
      router.replace("/dashboard/personal/workouts");
    }
  }, [searchParams, router]);

  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    if (error) {
      addToast("error", "Erro ao carregar treinos: " + error);
    }
  }, [error, addToast]);

  const filteredWorkouts = workouts.filter((w) => {
    const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           (w.description && w.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "Todos" || w.objective === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = ["Todos", "Hipertrofia", "Emagrecimento", "Força", "Resistência", "Adaptação"];

  return (
    <div className="flex h-screen bg-kore-bg">
      <Sidebar />
      <MobileSidebar />

      <div className="flex-1 min-w-0 flex flex-col h-screen">
        <Topbar />

        <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-kore-emerald-soft grid place-items-center">
                <Dumbbell size={20} className="text-kore-emerald-deep" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">
                  Biblioteca de Treinos
                </h1>
                <p className="text-sm text-kore-muted mt-0.5">
                  Gerencie fichas base para seus alunos.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsBuilderOpen(true)}
              className="btn-emerald px-4 py-2.5 text-sm flex items-center gap-2"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Novo Treino</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted"
              />
              <input
                type="text"
                placeholder="Buscar treinos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:border-kore-emerald transition"
              />
            </div>

            {/* Categories */}
            <div className="flex items-center flex-wrap gap-1 bg-kore-bg rounded-xl p-0.5 border border-kore-border">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`relative px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                    selectedCategory === cat
                      ? "text-kore-ink"
                      : "text-kore-muted hover:text-kore-ink"
                  }`}
                >
                  {selectedCategory === cat && (
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-kore-card rounded-lg shadow-kore-soft"
                    />
                  )}
                  <span className="relative">{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Treinos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredWorkouts.map((workout) => {
              const isGlobal = workout.professional_id === null;
              const isOwner = workout.professional_id === userId;

              return (
                <div
                  key={workout.id}
                  onClick={() => setViewerWorkoutId(workout.id)}
                  className="group bg-kore-card border border-kore-border rounded-2xl p-6 flex flex-col hover:border-kore-emerald/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
                >
                  {/* Decorative background icon */}
                  <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity pointer-events-none transform -rotate-12 scale-150">
                    <Dumbbell size={120} className="text-kore-ink" />
                  </div>

                  <h3 className="font-extrabold text-kore-ink text-base mb-2 mt-1 line-clamp-1 relative z-10 pr-2 group-hover:text-kore-emerald transition-colors">
                    {workout.name}
                  </h3>
                  
                  {workout.description && (
                    <div className="mb-4 flex-1 flex flex-col items-start relative z-10">
                      <p className="text-sm text-kore-muted line-clamp-3 leading-relaxed">
                        {workout.description}
                      </p>
                      <span className="text-kore-emerald font-bold text-[10px] mt-2 hover:underline decoration-kore-emerald uppercase tracking-wide flex items-center gap-1">
                        Ler resumo completo
                      </span>
                    </div>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-5 border-t border-kore-border/40 relative z-10">
                    <div className="flex flex-wrap gap-2">
                      {workout.objective && (
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-kore-subink bg-kore-bg border border-kore-border px-2.5 py-1.5 rounded-lg shadow-sm">
                          <Target size={12} className={
                            workout.objective === 'Hipertrofia' ? 'text-blue-500' :
                            workout.objective === 'Emagrecimento' ? 'text-orange-500' :
                            workout.objective === 'Força' ? 'text-red-500' : 'text-kore-emerald'
                          } />
                          {workout.objective}
                        </span>
                      )}
                      {workout.level && (
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-kore-subink bg-kore-bg border border-kore-border px-2.5 py-1.5 rounded-lg shadow-sm">
                          <Activity size={12} className="text-kore-muted" />
                          {workout.level}
                        </span>
                      )}
                    </div>
                    
                    {isOwner ? (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-kore-bg/80 backdrop-blur-sm rounded-lg p-0.5 border border-kore-border">
                        <button 
                          onClick={(e) => { e.stopPropagation(); /* edit logic */ }} 
                          className="p-1.5 text-kore-muted hover:text-kore-ink hover:bg-kore-card rounded-md transition"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); /* copy logic */ }} 
                          className="p-1.5 text-kore-muted hover:text-kore-ink hover:bg-kore-card rounded-md transition"
                        >
                          <Copy size={14} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); /* delete logic */ }} 
                          className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                         <button 
                          onClick={(e) => { e.stopPropagation(); setViewerWorkoutId(workout.id); }} 
                          className="p-1.5 text-kore-emerald hover:text-kore-emerald hover:bg-kore-emerald/10 rounded-lg transition flex items-center gap-1.5 text-xs font-bold"
                        >
                          <Eye size={14} /> Ver Ficha
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredWorkouts.length === 0 && (
            error ? (
              <EmptyState
                icon={AlertTriangle}
                title="Erro ao carregar"
                description="Houve um problema ao conectar com o banco de dados."
                isError
              />
            ) : searchTerm.trim() || selectedCategory !== "Todos" ? (
              <EmptyState
                icon={Search}
                title="Nenhum treino encontrado"
                description="Sua busca não retornou nenhum treino. Tente termos ou filtros diferentes."
                secondaryAction={{ label: "Limpar Filtros", onClick: () => { setSearchTerm(""); setSelectedCategory("Todos"); } }}
              />
            ) : (
              <EmptyState
                icon={Dumbbell}
                title="Nenhum treino criado"
                description="Sua biblioteca está vazia. Crie a primeira ficha base para começar a prescrever para seus alunos."
                action={{ label: "Criar Treino", icon: Plus, onClick: () => setIsBuilderOpen(true) }}
              />
            )
          )}
        </main>
      </div>

      <WorkoutBuilderModal 
        isOpen={isBuilderOpen}
        onClose={() => {
          setIsBuilderOpen(false);
          setEditBaseId(null);
          setStudentId(null);
        }}
        exercises={exercises}
        editBaseId={editBaseId}
        studentId={studentId}
      />

      <WorkoutViewerModal
        isOpen={viewerWorkoutId !== null}
        onClose={() => setViewerWorkoutId(null)}
        workoutId={viewerWorkoutId || ""}
      />
    </div>
  );
}
