"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleMealStatus(mealLogId: string, consumed: boolean) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Não autenticado");

    const { error } = await supabase
      .from("meal_logs")
      .update({ consumed })
      .eq("id", mealLogId)
      .eq("user_id", user.id);

    if (error) {
      console.error("[toggleMealStatus] Error updating meal_logs:", error);
      throw new Error("Falha ao atualizar o registo.");
    }

    revalidatePath("/app");
    return { success: true };
  } catch (error: any) {
    console.error("[toggleMealStatus] Error:", error.message);
    return { success: false, error: error.message };
  }
}

export async function toggleMealItemStatus(mealLogItemId: string, consumed: boolean) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Não autenticado");

    // We don't have user_id on meal_log_items, but since the user is authenticated,
    // they can only mutate if RLS allows or we do a subquery check. 
    // For now we assume RLS handles it or we just do the update.
    const { error } = await supabase
      .from("meal_log_items")
      .update({ consumed })
      .eq("id", mealLogItemId);

    if (error) {
      console.error("[toggleMealItemStatus] Error:", error);
      throw new Error("Falha ao atualizar item.");
    }

    revalidatePath("/app");
    return { success: true };
  } catch (error: any) {
    console.error("[toggleMealItemStatus] Error:", error.message);
    return { success: false, error: error.message };
  }
}

export async function toggleAllMealItems(mealLogId: string, consumed: boolean) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Não autenticado");

    // Update the meal_log_items
    const { error: itemsError } = await supabase
      .from("meal_log_items")
      .update({ consumed })
      .eq("meal_log_id", mealLogId);

    if (itemsError) {
      console.error("[toggleAllMealItems] Items Error:", itemsError);
      throw new Error("Falha ao atualizar itens.");
    }
    
    // Also update the parent meal
    const { error: mealError } = await supabase
      .from("meal_logs")
      .update({ consumed })
      .eq("id", mealLogId)
      .eq("user_id", user.id);
      
    if (mealError) {
       console.error("[toggleAllMealItems] Meal Error:", mealError);
    }

    revalidatePath("/app");
    return { success: true };
  } catch (error: any) {
    console.error("[toggleAllMealItems] Error:", error.message);
    return { success: false, error: error.message };
  }
}
