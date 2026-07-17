import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { StudentsClient } from "./_components/StudentsClient";

export const metadata = {
  title: "Meus Alunos · Personal",
};

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/personal/students");

  const { data: students, error } = await supabase
    .from("profiles")
    .select(`
      id, 
      full_name, 
      display_name, 
      avatar_url, 
      status, 
      created_at, 
      metadata,
      workout_plans (*)
    `)
    .eq("coach_id", user.id)
    .order("full_name", { ascending: true });

  const { data: exercises } = await supabase
    .from("exercises")
    .select("*")
    .or(`professional_id.is.null,professional_id.eq.${user.id}`)
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar alunos:", error.message);
  }

  return (
    <StudentsClient
      students={(students ?? []).map((s) => ({
        id: s.id,
        full_name: s.full_name,
        display_name: s.display_name,
        avatar_url: s.avatar_url,
        status: s.status,
        created_at: s.created_at,
        metadata: s.metadata as Record<string, unknown> | null,
        email: undefined,
        workout_plans: s.workout_plans as any[],
      }))}
      exercises={exercises || []}
    />
  );
}