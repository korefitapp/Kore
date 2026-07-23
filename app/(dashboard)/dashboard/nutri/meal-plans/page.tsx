import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MealPlansPageClient } from "./_components/MealPlansPageClient";
import { getNutriPatients } from "@/app/actions/nutri-actions";

export const metadata = {
  title: "Modelos de Cardápios · Nutricionista",
};

export const dynamic = "force-dynamic";

export default async function MealPlansPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/nutri/meal-plans");

  // Busca cardápios que pertencem ao Nutri OU que são templates globais do sistema
  const { data: plans, error } = await supabase
    .from("meal_plans")
    .select("*")
    .or(`nutritionist_id.eq.${user.id},is_global_template.eq.true`)
    .order("created_at", { ascending: false });

  if (error) console.error("Erro ao buscar cardápios:", error.message);

  const patients = await getNutriPatients();

  return <MealPlansPageClient nutritionistId={user.id} initialPlans={plans || []} patients={patients || []} error={error?.message || null} />;
}