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
  ChevronDown,
} from "lucide-react";
import { useKore } from "../store";
import { ActiveMode } from "./ActiveMode";

function DayAccordion({ 
  day, 
  exercises, 
  defaultOpen, 
  onStart,
  onSelectExercise
}: { 
  day: string; 
  exercises: any[]; 
  defaultOpen: boolean;
  onStart: () => void;
  onSelectExercise: (id: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <motion.section
      layout
      className="relative rounded-[28px] border bg-white dark:bg-white/5 overflow-hidden transition-all duration-300 shadow-sm border-slate-200 dark:border-white/10"
    >
      <div className="flex items-center gap-3 p-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
          <Dumbbell size={20} />
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex-1 flex items-center gap-3 text-left min-w-0"
        >
          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-lg truncate text-slate-900 dark:text-white">
              Treino {day}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
              <Clock size={12} className="text-slate-400 dark:text-zinc-500" /> 52m · {exercises.length} exercícios
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-extrabold text-slate-900 dark:text-white tabular-nums">
              {exercises.reduce((acc, ex) => acc + ex.sets.length * 15, 0)} kcal
            </p>
          </div>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            className="text-slate-400 dark:text-zinc-600"
          >
            <ChevronDown size={20} />
          </motion.span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 -mt-1 space-y-4">
              <button
                onClick={onStart}
                className="relative z-10 flex w-full items-center justify-center gap-2 rounded-[20px] bg-purple-500 py-3.5 font-extrabold text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-transform active:scale-[0.98]"
              >
                <Play size={18} fill="currentColor" />
                INICIAR TREINO
              </button>

              <ul className="space-y-2">
                {exercises.map((ex, idx) => (
                  <li
                    key={ex.id}
                    onClick={() => onSelectExercise(ex.id)}
                    className="group flex w-full items-center gap-4 rounded-[20px] border border-slate-200 bg-slate-50 p-3 text-left shadow-sm transition-transform active:scale-[0.98] dark:border-white/5 dark:bg-white/[0.03] cursor-pointer"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-slate-200 text-xl shadow-inner dark:bg-[#1a1a1a]">
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
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                        {ex.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
                        {ex.targetReps} · {ex.muscle}
                      </p>
                    </div>
                    <div className="mr-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 transition-colors group-active:bg-slate-300 dark:bg-white/5 dark:group-active:bg-white/10">
                      <ChevronRight size={16} className="text-slate-400 dark:text-zinc-400" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function ActiveWorkout() {
  const allExercises = useKore((s) => s.exercises);
  const setActive = useKore((s) => s.setActive);

  const days = Array.from(
    new Set(allExercises.map((e) => e.day).filter(Boolean)),
  );

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
          Meus Treinos
        </h1>
      </header>

      <div className="space-y-4">
        {days.map((day, index) => {
          const exercises = allExercises.filter((e) => e.day === day);
          const todayStr = new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(new Date());
          const todayBase = todayStr.toLowerCase().split("-")[0] || "";
          const isToday = day.toLowerCase().includes(todayBase);
          const hasAnyToday = days.some(d => d.toLowerCase().includes(todayBase));

          return (
            <DayAccordion
              key={day}
              day={day}
              exercises={exercises}
              defaultOpen={isToday || (index === 0 && !hasAnyToday)}
              onStart={() => {
                if (exercises[0]) setActive(exercises[0].id);
              }}
              onSelectExercise={(id) => setActive(id)}
            />
          );
        })}
      </div>
    </motion.div>
  );
}

function DiscoverProfessionals() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [trainers, setTrainers] = useState<any[]>([]);

  useEffect(() => {
    setStatus("loading");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation({ lat, lng });
          
          try {
            const { getNearbyProfessionals } = await import("@/app/actions/discovery-actions");
            const data = await getNearbyProfessionals(lat, lng, "trainer");
            setTrainers(data.slice(0, 5)); // Apenas os 5 mais próximos
            setStatus("success");
          } catch (error) {
            console.error("Failed to fetch trainers:", error);
            setStatus("error");
          }
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
            src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 dark:text-zinc-400">
            <MapPin size={28} className="mb-2 opacity-50" />
            <p className="text-sm font-medium">Localização indisponível</p>
          </div>
        )}
      </section>

      {status === "success" && trainers.length === 0 && (
        <div className="text-center py-6 text-slate-500 dark:text-zinc-400">
          Nenhum treinador encontrado na sua região.
        </div>
      )}

      {(status === "loading" || status === "idle") && (
        <section className="space-y-4 mt-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Personais Próximos
          </h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex w-full flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-[18px] bg-slate-200 dark:bg-white/10"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-white/10"></div>
                    <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-white/10"></div>
                  </div>
                </div>
                <div className="h-10 w-full rounded-2xl bg-slate-200 dark:bg-white/10"></div>
              </div>
            ))}
          </div>
        </section>
      )}

      {status === "success" && trainers.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Personais Próximos
          </h2>
          <div className="space-y-3">
            {trainers.map((pro) => (
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
      )}
    </motion.div>
  );
}

export function TreinoTab() {
  const activeId = useKore((s) => s.activeExerciseId);
  const user = useKore((s) => s.user);
  const exercises = useKore((s) => s.exercises);

  // Se o aluno tiver coachId ou se tiver exercícios carregados, consideramos que ele tem "ActivePlan"
  const hasActivePlan = !!user.coachId || exercises.length > 0;

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
