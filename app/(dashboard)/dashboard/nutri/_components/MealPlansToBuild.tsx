"use client";

import { useState } from "react";
import { Plus, Utensils } from "lucide-react";
import { CreateMealPlanModal } from "./CreateMealPlanModal";
import Link from "next/link";

function PlanRow({ plan }: { plan: any }) {
  const pName = plan.client?.full_name || "Paciente sem nome";
  const pAvatar = plan.client?.avatar_url || "👤";
  
  // Calculate days passed since creation
  const createdDate = new Date(plan.created_at);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const dueInDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const urgent = dueInDays >= 3;

  return (
    <li className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-kore-bg/60 border border-kore-border hover:border-kore-emerald/40 transition">
      <span className="text-xl bg-kore-bg p-2 rounded-xl border border-kore-border flex-shrink-0">
        {pAvatar}
      </span>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-bold text-kore-ink truncate">
          {pName}
        </span>
        <span className="text-[11px] text-kore-muted truncate mt-0.5">
          {plan.title || "Sem título"}
        </span>
      </div>
      <Link href={`/dashboard/nutri/meal-plans/${plan.id}/builder`} className={`text-[10px] font-bold rounded-full px-2 py-0.5 whitespace-nowrap ${urgent ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"}`}>
        {urgent ? `${dueInDays} dias atrás` : "Recente"}
      </Link>
    </li>
  );
}

export function MealPlansToBuild({ mealPlans = [] }: { mealPlans?: any[] }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section className="card p-5">
        <header className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-300 grid place-items-center ring-1 ring-amber-200/70 dark:ring-amber-500/30">
            <Utensils size={16} strokeWidth={2.4} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-kore-ink tracking-tight">
              Cardápios a montar
            </h2>
            <p className="text-[11px] text-kore-muted mt-0.5">
              {mealPlans.length} pendentes nesta semana
            </p>
          </div>
        </header>

        <ul className="space-y-2">
          {mealPlans.map((plan: any) => (
            <PlanRow key={plan.id} plan={plan} />
          ))}
          {mealPlans.length === 0 && (
            <li className="py-6 px-4 text-center text-sm text-kore-muted bg-kore-bg/60 rounded-xl border border-kore-border">
              Nenhum plano pendente.
            </li>
          )}
        </ul>

        <button
          onClick={() => setModalOpen(true)}
          type="button"
          className="w-full mt-4 py-2 flex items-center justify-center gap-2 text-xs font-bold text-kore-ink bg-kore-bg hover:bg-kore-border rounded-xl transition border border-kore-border"
        >
          <Plus size={14} />
          Criar Novo Cardápio
        </button>
      </section>
      
      <CreateMealPlanModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
