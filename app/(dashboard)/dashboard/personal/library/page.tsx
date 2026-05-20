import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { LibraryClient } from "./_components/LibraryClient";

export const metadata = {
  title: "Biblioteca de Exercícios · Personal",
};

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/personal/library");

  // Query real da tabela exercises no Supabase
  // Tipagem any pois a tabela exercises ainda não existe nos tipos gerados do Supabase
  const { data: exercises, error } = await (supabase as SupabaseClient)
    .from("exercises" as any)
    .select("id, name, muscle_group, category, image_url, description, created_at")
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar exercícios:", error.message);
  }

  return (
    <LibraryClient
      exercises={(exercises ?? []).map((e) => ({
        id: e.id,
        name: e.name,
        muscle_group: e.muscle_group as string | null,
        category: e.category as string | null,
        image_url: e.image_url as string | null,
        description: e.description as string | null,
        created_at: e.created_at,
      }))}
    />
  );
}