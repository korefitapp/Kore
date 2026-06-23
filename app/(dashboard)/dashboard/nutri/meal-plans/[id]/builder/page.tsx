import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BuilderClient } from "./BuilderClient";

export default async function MealPlanBuilderPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch Meal Plan and verify ownership
  const { data: plan, error } = await supabase
    .from("meal_plans")
    .select(`
      *,
      patient:profiles!meal_plans_patient_id_fkey(id, full_name, display_name)
    `)
    .eq("id", params.id)
    .single();

  if (error || !plan) {
    redirect("/dashboard/nutri");
  }

  // Fetch meals and items
  const { data: meals } = await supabase
    .from("meals")
    .select(`
      *,
      items:meal_items(*)
    `)
    .eq("meal_plan_id", plan.id)
    .order("created_at");

  return <BuilderClient plan={plan} initialMeals={meals || []} />;
}
