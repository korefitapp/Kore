"use client";

import { motion } from "framer-motion";
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <header>
        <p className="text-xs text-muted">Plano nutricional</p>
        <h1 className="text-2xl font-extrabold text-kore tracking-tight">
          Sua dieta
        </h1>
      </header>

      <KcalHero meals={optimisticMeals} />

      <div className="space-y-3">
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
    </motion.div>
  );
}
