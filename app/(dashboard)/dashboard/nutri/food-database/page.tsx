import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FoodDatabasePageClient } from "./_components/FoodDatabasePageClient";

export const metadata = {
  title: "Banco de Alimentos · Nutricionista",
};

export const dynamic = "force-dynamic";

export default async function FoodDatabasePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/nutri/food-database");

  const { data: foods, error } = await supabase
    .from("foods")
    .select("*")
    .or(`created_by.is.null,created_by.eq.${user.id}`)
    .order("name", { ascending: true });

  if (error) console.error("Erro ao buscar alimentos:", error.message);

  return <FoodDatabasePageClient initialFoods={foods || []} />;
}