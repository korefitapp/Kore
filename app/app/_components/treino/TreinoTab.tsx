"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Clock, Dumbbell, Flame, MapPin, Star, MessageCircle } from "lucide-react";
import { useKore } from "../store";
import { ActiveMode } from "./ActiveMode";

// Mock data for professionals
const mockProfessionals = [
  {
    id: 1,
    name: "Carlos Silva",
    specialty: "Hipertrofia",
    distance: "A 2.5 km de você",
    rating: "4.9",
    avatarInitials: "CS",
  },
  {
    id: 2,
    name: "Mariana Souza",
    specialty: "Emagrecimento",
    distance: "A 4.1 km de você",
    rating: "5.0",
    avatarInitials: "MS",
  },
  {
    id: 3,
    name: "Lucas Andrade",
    specialty: "Força e Condicionamento",
    distance: "A 6.8 km de você",
    rating: "4.8",
    avatarInitials: "LA",
  },
];

function ActiveWorkout() {
  const exercises = useKore((s) => s.exercises);
  const setActive = useKore((s) => s.setActive);

  return (
    <motion.div
      key="list"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <header>
        <p className="text-xs text-muted">Periodização · Semana 3</p>
        <h1 className="text-2xl font-extrabold text-kore tracking-tight">
          Push A · Peito · Tríceps
        </h1>
      </header>

      <section className="rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 text-white shadow-sm">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5">
            <Dumbbell size={14} /> {exercises.length} exercícios
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} /> ~52 min
          </span>
          <span className="flex items-center gap-1.5">
            <Flame size={14} /> ~480 kcal
          </span>
        </div>
        <button
          onClick={() => {
            if (exercises[0]) setActive(exercises[0].id);
          }}
          className="mt-4 w-full bg-white text-emerald-700 rounded-2xl font-bold py-3 flex items-center justify-center gap-1.5 active:scale-[0.98] transition"
        >
          Iniciar Treino
          <ChevronRight size={18} strokeWidth={2.6} />
        </button>
      </section>

      <div className="space-y-2.5">
        {exercises.map((ex, idx) => (
          <button
            key={ex.id}
            onClick={() => setActive(ex.id)}
            className="w-full text-left rounded-3xl bg-kore-card border border-kore p-3 flex items-center gap-3 hover:border-emerald-300 transition active:scale-[0.99]"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-3xl flex-shrink-0">
              {ex.thumb}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase font-bold text-muted tracking-wider">
                Exercício {idx + 1}
              </p>
              <p className="font-bold text-kore truncate">{ex.name}</p>
              <p className="text-xs text-muted">
                {ex.targetReps} · {ex.muscle}
              </p>
            </div>
            <ChevronRight size={18} className="text-muted flex-shrink-0" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function DiscoverProfessionals() {
  return (
    <motion.div
      key="discover"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 pb-6"
    >
      <header>
        <h1 className="text-2xl font-extrabold text-kore tracking-tight">
          Você ainda não tem um treino
        </h1>
        <p className="text-sm text-muted mt-1">
          Encontre profissionais excelentes perto de você
        </p>
      </header>

      {/* Mini Mapa Placeholder */}
      <section className="relative w-full h-40 bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden border border-kore flex items-center justify-center shadow-sm">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, #10B981 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>
        <MapPin size={32} className="text-emerald-500 relative z-10" />
        <div className="absolute w-12 h-12 bg-emerald-500/20 rounded-full animate-ping z-0"></div>
        <p className="absolute bottom-3 text-xs font-bold text-muted z-10">Buscando na sua região...</p>
      </section>

      {/* Lista de Profissionais */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-kore">Personais Próximos</h2>
        <div className="space-y-3">
          {mockProfessionals.map((pro) => (
            <div key={pro.id} className="w-full rounded-3xl bg-kore-card border border-kore p-4 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center flex-shrink-0">
                  {pro.avatarInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-kore text-base truncate">{pro.name}</h3>
                  <p className="text-xs text-muted truncate">{pro.specialty}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center text-[10px] font-medium text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-md">
                      <Star size={10} className="mr-0.5 fill-current" />
                      {pro.rating}
                    </span>
                    <span className="text-[10px] text-muted flex items-center gap-0.5">
                      <MapPin size={10} /> {pro.distance}
                    </span>
                  </div>
                </div>
              </div>
              <button className="w-full bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold py-2.5 rounded-2xl flex items-center justify-center gap-2 transition text-sm">
                <MessageCircle size={16} />
                Entrar em Contato
              </button>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

export function TreinoTab() {
  const activeId = useKore((s) => s.activeExerciseId);
  const hasActivePlan = false; // Mockado para testes da nova UI

  return (
    <AnimatePresence mode="wait" initial={false}>
      {activeId ? (
        <ActiveMode key={`active-${activeId}`} exerciseId={activeId} />
      ) : hasActivePlan ? (
        <ActiveWorkout key="active-workout" />
      ) : (
        <DiscoverProfessionals key="discover" />
      )}
    </AnimatePresence>
  );
}
