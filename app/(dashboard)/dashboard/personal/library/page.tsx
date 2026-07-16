import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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
  const { data: exercises, error } = await (supabase as SupabaseClient)
    .from("exercises" as any)
    .select("*")
    .or(`professional_id.is.null,professional_id.eq.${user.id}`)
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar exercícios:", error.message);
  }

  // Query role
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isAdmin = profile?.role === "admin";

  return (
    <LibraryClient
      exercises={exercises ?? []}
      currentUserId={user.id}
      isAdmin={isAdmin}
    />
  );
}