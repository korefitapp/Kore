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

  // TODO: Quando a tabela foods existir no Supabase, descomentar:
  // const { data: foods, error } = await supabase
  //   .from("foods")
  //   .select("*")
  //   .order("name", { ascending: true });

  // if (error) console.error("Erro ao buscar alimentos:", error.message);

  return <FoodDatabasePageClient />;
}