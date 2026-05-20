import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MealPlansPageClient } from "./_components/MealPlansPageClient";

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

  // TODO: Quando a tabela meal_plans existir no Supabase, descomentar:
  // const { data: plans, error } = await supabase
  //   .from("meal_plans")
  //   .select("*")
  //   .eq("nutritionist_id", user.id)
  //   .order("created_at", { ascending: false });

  // if (error) console.error("Erro ao buscar cardápios:", error.message);

  return <MealPlansPageClient nutritionistId={user.id} />;
}