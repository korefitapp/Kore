"use client";

import { motion } from "framer-motion";
import { useKore } from "../store";
import { KcalHero } from "./KcalHero";
import { MealAccordion } from "./MealAccordion";

export function DietaTab() {
  const meals = useKore((s) => s.meals);

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

      <KcalHero />

      <div className="space-y-3">
        {meals.map((m, i) => (
          <MealAccordion key={m.id} meal={m} defaultOpen={i === 1} />
        ))}
      </div>
    </motion.div>
  );
}
