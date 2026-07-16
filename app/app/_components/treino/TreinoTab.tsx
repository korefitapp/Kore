"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  MapPin,
  Star,
  MessageCircle,
  Play,
} from "lucide-react";
import { useKore } from "../store";
import { ActiveMode } from "./ActiveMode";

function ActiveWorkout() {
  const allExercises = useKore((s) => s.exercises);
  const activeDay = useKore((s) => s.activeDay);
  const setActiveDay = useKore((s) => s.setActiveDay);
  const setActive = useKore((s) => s.setActive);

  const days = Array.from(
    new Set(allExercises.map((e) => e.day).filter(Boolean)),
  );

  useEffect(() => {
    if (days.length > 0 && !days.includes(activeDay) && days[0]) {
      setActiveDay(days[0]);
    }
  }, [days, activeDay, setActiveDay]);

  const currentDay = days.includes(activeDay) ? activeDay : days[0];
  const exercises = allExercises.filter((e) => e.day === currentDay);

  return (
    <motion.div
      key="list"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-24"
    >
      <header>
        <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400">
          Periodização · Semana 3
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Treino {currentDay}
        </h1>

        {days.length > 1 && (
          <div className="hide-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-all ${
                  currentDay === day
                    ? "bg-purple-500 text-white shadow-md shadow-purple-500/20"
                    : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-zinc-400"
                }`}
              >
                Treino {day}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Resumo do Treino (Premium Dark Card) */}
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 text-slate-900 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white">
        {/* Glow de fundo */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-100 blur-3xl dark:bg-purple-500/20" />

        <div className="relative z-10 mb-6 flex items-center justify-between text-sm">
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
              <Dumbbell size={18} />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">
              {exercises.length}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400">
              Exerc.
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
              <Clock size={18} />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">52m</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400">
              Tempo
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
              <Flame size={18} />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">480</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400">
              Kcal
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            if (exercises[0]) setActive(exercises[0].id);
          }}
          className="relative z-10 flex w-full items-center justify-center gap-2 rounded-[20px] bg-purple-500 py-3.5 font-extrabold text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-transform active:scale-[0.98]"
        >
          <Play size={18} fill="currentColor" />
          INICIAR TREINO
        </button>
      </section>

      <div className="space-y-3">
        <h2 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
          Lista de Exercícios
        </h2>
        {exercises.map((ex, idx) => (
          <button
            key={ex.id}
            onClick={() => setActive(ex.id)}
            className="group flex w-full items-center gap-4 rounded-[24px] border border-slate-200 bg-white p-3 text-left shadow-sm transition-transform active:scale-[0.98] dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-slate-100 text-3xl shadow-inner dark:bg-[#1a1a1a]">
              {ex.thumb?.startsWith("http") ? (
                <img src={ex.thumb} alt={ex.name} className="h-full w-full object-cover" />
              ) : (
                ex.thumb
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-purple-500 dark:text-purple-400">
                Exercício {idx + 1}
              </p>
              <p className="truncate text-base font-bold text-slate-900 dark:text-white">
                {ex.name}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
                {ex.targetReps} · {ex.muscle}
              </p>
            </div>
            <div className="mr-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 transition-colors group-active:bg-slate-200 dark:bg-white/5 dark:group-active:bg-white/10">
              <ChevronRight size={18} className="text-slate-400 dark:text-zinc-400" />
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function DiscoverProfessionals() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );

  const MOCK_TRAINERS = [
    {
      id: "1",
      name: "Ricardo Almeida",
      specialty: "Hipertrofia & Força",
      distance: "0.8 km",
      rating: 4.9,
      avatarInitials: "RA",
    },
    {
      id: "2",
      name: "Juliana Silva",
      specialty: "Emagrecimento & HIIT",
      distance: "1.2 km",
      rating: 4.8,
      avatarInitials: "JS",
    },
    {
      id: "3",
      name: "Marcos Torres",
      specialty: "Reabilitação & Core",
      distance: "2.1 km",
      rating: 5.0,
      avatarInitials: "MT",
    },
    {
      id: "4",
      name: "Camila Rocha",
      specialty: "Crossfit & LPO",
      distance: "3.5 km",
      rating: 4.7,
      avatarInitials: "CR",
    },
    {
      id: "5",
      name: "André Ferraz",
      specialty: "Preparação Física",
      distance: "4.0 km",
      rating: 4.9,
      avatarInitials: "AF",
    },
  ];

  useEffect(() => {
    setStatus("loading");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setStatus("success");
        },
        (error) => {
          console.error("Geolocation error:", error);
          setStatus("error");
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    } else {
      setStatus("error");
    }
  }, []);

  return (
    <motion.div
      key="discover"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-24"
    >
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Você ainda não tem um treino
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          Encontre profissionais excelentes perto de você
        </p>
      </header>

      {/* Map Section */}
      <section className="relative h-48 w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
        {status === "loading" || status === "idle" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="h-64 w-64 animate-ping rounded-full border border-emerald-500/20 opacity-20"
                style={{ animationDuration: "3s" }}
              />
              <div
                className="absolute h-48 w-48 animate-ping rounded-full border border-emerald-500/30 opacity-40"
                style={{ animationDuration: "3s", animationDelay: "0.5s" }}
              />
              <div
                className="absolute h-32 w-32 animate-ping rounded-full border border-emerald-500/50 opacity-60"
                style={{ animationDuration: "3s", animationDelay: "1s" }}
              />
            </div>

            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500/20 shadow-[0_0_20px_rgba(52,211,153,0.4)]">
              <MapPin size={28} className="animate-bounce text-emerald-400" />
            </div>
            <p className="relative z-10 mt-4 font-bold tracking-wide text-emerald-400">
              Buscando na região...
            </p>
          </div>
        ) : status === "success" && location ? (
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.01}%2C${location.lat - 0.01}%2C${location.lng + 0.01}%2C${location.lat + 0.01}&layer=mapnik&marker=${location.lat}%2C${location.lng}`}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 dark:text-zinc-400">
            <MapPin size={28} className="mb-2 opacity-50" />
            <p className="text-sm font-medium">Localização indisponível</p>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Personais Próximos
        </h2>
        <div className="space-y-3">
          {MOCK_TRAINERS.map((pro) => (
            <div
              key={pro.id}
              className="flex w-full flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[18px] border border-emerald-200 bg-emerald-100 text-lg font-extrabold text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400">
                  {pro.avatarInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="truncate text-base font-bold text-slate-900 dark:text-white">
                      {pro.name}
                    </h3>
                    <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-500 dark:bg-amber-400/10 dark:text-amber-400">
                      <Star size={12} fill="currentColor" /> {pro.rating}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs font-medium text-slate-500 dark:text-zinc-400">
                    {pro.specialty}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    {pro.distance}
                  </p>
                </div>
              </div>

              <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 py-2.5 font-bold text-emerald-600 transition-colors hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20">
                <MessageCircle size={16} />
                ENTRAR EM CONTATO
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
  const user = useKore((s) => s.user);

  // Se o aluno tiver coachId, consideramos que ele tem "ActivePlan" para essa aba,
  // ou se não, cai na UI de descobrir.
  const hasActivePlan = !!user.coachId;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {activeId ? (
        <ActiveMode key="active" exerciseId={activeId} />
      ) : hasActivePlan ? (
        <ActiveWorkout key="workout" />
      ) : (
        <DiscoverProfessionals key="discover" />
      )}
    </AnimatePresence>
  );
}
