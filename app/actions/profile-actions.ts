"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getHealthData() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await (supabase as any)
    .from("profiles")
    .select("weight, height, fitness_goal, medical_restrictions")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    return {
      weight: "",
      height: "",
      fitness_goal: "Manutenção",
      medical_restrictions: ""
    };
  }

  return {
    weight: data.weight?.toString() || "",
    height: data.height?.toString() || "",
    fitness_goal: data.fitness_goal || "Manutenção",
    medical_restrictions: data.medical_restrictions || ""
  };
}

export async function updateHealthData(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Não autenticado");
  }

  const weight = formData.get("weight") as string;
  const height = formData.get("height") as string;
  const fitness_goal = formData.get("fitness_goal") as string;
  const medical_restrictions = formData.get("medical_restrictions") as string;

  const { error } = await (supabase as any)
    .from("profiles")
    .update({
      weight: weight ? parseFloat(weight) : null,
      height: height ? parseFloat(height) : null,
      fitness_goal: fitness_goal || null,
      medical_restrictions: medical_restrictions || null,
    })
    .eq("id", user.id);

  if (error) {
    console.error("Erro ao atualizar saúde:", error.message);
    throw new Error("Erro ao atualizar saúde");
  }

  revalidatePath("/app/profile/health");
}
