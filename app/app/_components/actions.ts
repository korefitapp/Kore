"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const todayISO = () => new Date().toISOString().slice(0, 10);

export async function setWaterMlAction(waterMl: number) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  await supabase.from("water_logs").upsert(
    {
      user_id: user.id,
      log_date: todayISO(),
      water_ml: Math.max(0, Math.round(waterMl)),
    },
    { onConflict: "user_id,log_date" },
  );
  revalidatePath("/app");
  return { ok: true };
}

export async function toggleMealAction(mealLogId: string, consumed: boolean) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  await supabase
    .from("meal_logs")
    .update({ consumed })
    .eq("id", mealLogId)
    .eq("user_id", user.id);
  revalidatePath("/app");
  return { ok: true };
}
