"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function logWater(ml: number, dateISO: string) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("water_logs")
    .upsert(
      { 
        user_id: user.id, 
        log_date: dateISO, 
        water_ml: ml 
      },
      { onConflict: "user_id, log_date" }
    );

  if (error) {
    console.error("Failed to log water:", error);
    throw new Error("Failed to log water");
  }

  return { success: true };
}
