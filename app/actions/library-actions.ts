"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createExercise(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Não autenticado");
  }

  const name = formData.get("name") as string;
  const muscle_group = formData.get("muscle") as string;
  const category = formData.get("equipment") as string;
  const image_url = formData.get("videoUrl") as string;

  if (!name) {
    throw new Error("Nome é obrigatório");
  }

  // Usamos as any por garantia caso a tabela ainda não esteja no database.types.ts
  const { error } = await (supabase as any).from("exercises").insert({
    professional_id: user.id,
    name,
    muscle_group: muscle_group || null,
    category: category || null,
    image_url: image_url || null,
  });

  if (error) {
    console.error("Erro ao criar exercício:", error.message);
    throw new Error("Erro ao criar exercício");
  }

  revalidatePath("/dashboard/personal/library");
}

export async function editExercise(id: string, formData: FormData) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Não autenticado");
  }

  const name = formData.get("name") as string;
  const muscle_group = formData.get("muscle") as string;
  const category = formData.get("equipment") as string;
  const image_url = formData.get("videoUrl") as string;

  const { error } = await (supabase as any)
    .from("exercises")
    .update({
      name,
      muscle_group: muscle_group || null,
      category: category || null,
      image_url: image_url || null,
    })
    .eq("id", id)
    .eq("professional_id", user.id);

  if (error) {
    console.error("Erro ao atualizar exercício:", error.message);
    throw new Error("Erro ao atualizar exercício");
  }

  revalidatePath("/dashboard/personal/library");
}

export async function deleteExercise(id: string) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Não autenticado");
  }

  const { error } = await (supabase as any)
    .from("exercises")
    .delete()
    .eq("id", id)
    .eq("professional_id", user.id);

  if (error) {
    console.error("Erro ao deletar exercício:", error.message);
    throw new Error("Erro ao deletar exercício");
  }

  revalidatePath("/dashboard/personal/library");
}
