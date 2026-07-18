"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useOptimistic, startTransition } from "react";
import { toggleAllMealItems, toggleMealItemStatus, toggleMealStatus } from "@/app/actions/student-actions";
import { useKore } from "../store";
import { KcalHero } from "./KcalHero";
import { MealAccordion } from "./MealAccordion";

export function DietaTab() {
  const baseMeals = useKore((s) => s.meals);

  const [optimisticMeals, dispatchOptimistic] = useOptimistic(
    baseMeals,
    (
      state,
      action:
        | { type: "TOGGLE_MEAL"; mealId: string }
        | { type: "TOGGLE_ITEM"; mealId: string; itemId: string }
        | { type: "TOGGLE_ALL"; mealId: string; consumed: boolean },
    ) => {
      switch (action.type) {
        case "TOGGLE_MEAL":
          return state.map((m) =>
            m.id === action.mealId ? { ...m, consumed: !m.consumed } : m,
          );
        case "TOGGLE_ITEM":
          return state.map((m) => {
            if (m.id !== action.mealId) return m;
            const updatedItems = m.items.map((it) =>
              it.id === action.itemId
                ? { ...it, consumed: !it.consumed }
                : it,
            );
            const allConsumed = updatedItems.length > 0 && updatedItems.every((it) => it.consumed);
            return { ...m, items: updatedItems, consumed: allConsumed };
          });
        case "TOGGLE_ALL":
          return state.map((m) => {
            if (m.id !== action.mealId) return m;
            return {
              ...m,
              consumed: action.consumed,
              items: m.items.map((it) => ({ ...it, consumed: action.consumed })),
            };
          });
        default:
          return state;
      }
    },
  );

  const handleToggleMeal = (mealId: string, currentStatus: boolean) => {
    startTransition(() => dispatchOptimistic({ type: "TOGGLE_ALL", mealId, consumed: !currentStatus }));
    
    // Fallback sync global
    const meal = baseMeals.find((m) => m.id === mealId);
    if (meal && meal.consumed === currentStatus) {
       useKore.getState().toggleMeal(mealId);
    }
    
    toggleAllMealItems(mealId, !currentStatus).catch((err) => {
      console.error("Erro:", err);
      useKore.getState().toggleMeal(mealId);
    });
  };

  const handleToggleItem = (mealId: string, itemId: string, currentStatus: boolean) => {
    startTransition(() => dispatchOptimistic({ type: "TOGGLE_ITEM", mealId, itemId }));
    
    // Sync global state immediately to persist across re-renders
    useKore.getState().toggleMealItem(mealId, itemId);
    
    toggleMealItemStatus(itemId, !currentStatus).catch((err) => {
      console.error("Erro:", err);
      // We could revert global state here if needed, but keeping it smooth for offline/mock data is preferred.
    });
  };

  const user = useKore((s) => s.user);
  // Se o aluno tiver coachId, consideramos que ele tem "ActivePlan" para essa aba,
  // ou se não, cai na UI de descobrir.
  const hasActivePlan = !!user.coachId;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {hasActivePlan ? (
        <motion.div
          key="active"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="bg-slate-50 dark:bg-[#121212] min-h-[100dvh] text-slate-900 dark:text-white -mx-4 -mt-4 px-5 pt-4 overflow-y-auto pb-24"
        >
          <header className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Nutrition
              </h1>
            </div>
          </header>

          <KcalHero meals={optimisticMeals} />

          <section className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-slate-900 dark:text-white font-bold text-lg">Daily Meal</h2>
            </div>
            
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[28px] p-4 shadow-sm flex flex-col gap-4">
              {optimisticMeals.map((m, i) => (
                <MealAccordion 
                  key={m.id} 
                  meal={m} 
                  defaultOpen={i === 1} 
                  onToggle={() => handleToggleMeal(m.id, m.consumed)}
                  onToggleItem={(itemId, consumed) => handleToggleItem(m.id, itemId, consumed)}
                />
              ))}
            </div>
          </section>
        </motion.div>
      ) : (
        <DiscoverNutris key="discover" />
      )}
    </AnimatePresence>
  );
}

import { useState, useEffect } from "react";
import { Loader2, MapPin, Users2, Star, MessageCircle, Apple } from "lucide-react";

function DiscoverNutris() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [nutris, setNutris] = useState<any[]>([]);

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
            const data = await getNearbyProfessionals(lat, lng, "nutritionist");
            setNutris(data.slice(0, 5)); // Apenas os 5 mais próximos
            setStatus("success");
          } catch (error) {
            console.error("Failed to fetch nutris:", error);
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
          Você ainda não tem uma dieta
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          Encontre nutricionistas excelentes perto de você
        </p>
      </header>

      {/* Map Section */}
      <section className="relative h-48 w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
        {status === "loading" || status === "idle" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="h-64 w-64 animate-ping rounded-full border border-rose-500/20 opacity-20"
                style={{ animationDuration: "3s" }}
              />
              <div
                className="absolute h-48 w-48 animate-ping rounded-full border border-rose-500/30 opacity-40"
                style={{ animationDuration: "3s", animationDelay: "0.5s" }}
              />
              <div
                className="absolute h-32 w-32 animate-ping rounded-full border border-rose-500/50 opacity-60"
                style={{ animationDuration: "3s", animationDelay: "1s" }}
              />
            </div>

            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 border-rose-500 bg-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.4)]">
              <MapPin size={28} className="animate-bounce text-rose-400" />
            </div>
            <p className="relative z-10 mt-4 font-bold tracking-wide text-rose-400">
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

      {status === "success" && nutris.length === 0 && (
        <div className="text-center py-6 text-kore-muted">
          Nenhum nutricionista encontrado na sua região.
        </div>
      )}

      {status === "success" && nutris.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Nutricionistas Próximos
          </h2>
          <div className="space-y-3">
            {nutris.map((pro) => (
              <div
                key={pro.id}
                className="flex w-full flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[18px] border border-rose-200 bg-rose-100 text-lg font-extrabold text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-400">
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

                <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 py-2.5 font-bold text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20">
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
