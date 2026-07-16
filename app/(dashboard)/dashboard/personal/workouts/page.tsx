import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { WorkoutsClient } from "./_components/WorkoutsClient";

export const metadata = {
  title: "Treinos · Personal",
};

export default async function WorkoutsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/personal/workouts");
  }

  const { data: workouts, error } = await supabase
    .from("workouts")
    .select("*")
    .or(`professional_id.is.null,professional_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar treinos:", error);
  }

  // Buscar todos os exercícios globais ou do personal
  const { data: exercises, error: exercisesError } = await supabase
    .from("exercises")
    .select("*")
    .or(`professional_id.is.null,professional_id.eq.${user.id}`)
    .order("name", { ascending: true });

  if (exercisesError) {
    console.error("Erro ao buscar exercícios:", exercisesError);
  }

  return (
    <WorkoutsClient 
      workouts={workouts || []} 
      exercises={exercises || []}
      userId={user.id} 
    />
  );
}
