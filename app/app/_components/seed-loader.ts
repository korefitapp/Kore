/**
 * Server-side loader: fetches the user's "Real Time Ready" snapshot
 * (profile + daily targets + meal logs + water log) from Supabase and
 * returns an `AppSeed` to hydrate the Zustand store on the client.
 *
 * If Supabase is unreachable or rows are missing, falls back to the
 * baked-in fallback seed (offline mode).
 */
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildFallbackSeed, FALLBACK_MEALS } from "./initial-data";
import type { AppSeed, Meal, UserProfile } from "./types";

const todayISO = () => new Date().toISOString().slice(0, 10);

export async function loadAppSeed(): Promise<AppSeed> {
  const fallback = buildFallbackSeed();
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return fallback;

  const [{ data: dash }, { data: water }, { data: rawLogs }] =
    await Promise.all([
      supabase
        .from("v_user_dashboard")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("water_logs")
        .select("water_ml")
        .eq("user_id", user.id)
        .eq("log_date", todayISO())
        .maybeSingle(),
      supabase
        .from("meal_logs")
        .select(
          "id, slot, name, emoji, target_time, consumed, meal_log_items(id, name, kcal, protein_g, carbs_g, fat_g, consumed)",
        )
        .eq("user_id", user.id)
        .eq("log_date", todayISO())
        .order("target_time", { ascending: true }),
    ]);

  const profile: UserProfile = {
    id: user.id,
    name: dash?.full_name ?? user.email?.split("@")[0] ?? "Cliente KORE",
    email: user.email ?? "cliente@kore.app",
    avatar: dash?.avatar_url ?? "🧘‍♀️",
    plan: "Premium",
    memberSince: dash?.created_at
      ? new Date(dash.created_at).toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        })
      : fallback.user.memberSince,
  };

  type MealLogRow = {
    id: string;
    slot: string;
    name: string;
    emoji: string | null;
    target_time: string | null;
    consumed: boolean;
    meal_log_items:
      | {
          id: string;
          name: string;
          kcal: number;
          protein_g: number;
          carbs_g: number;
          fat_g: number;
          consumed: boolean;
        }[]
      | null;
  };
  const logs = (rawLogs ?? []) as unknown as MealLogRow[];

  const meals: Meal[] =
    logs.length > 0
      ? logs.map((l) => ({
          id: l.id,
          name: l.name,
          emoji: l.emoji ?? "🍽️",
          targetTime: (l.target_time ?? "").slice(0, 5) || "12:00",
          consumed: !!l.consumed,
          items: (l.meal_log_items ?? []).map((it) => ({
            id: it.id,
            name: it.name,
            kcal: it.kcal,
            protein: it.protein_g,
            carbs: it.carbs_g,
            fat: it.fat_g,
            consumed: !!it.consumed,
          })),
        }))
      : FALLBACK_MEALS;

  return {
    online: true,
    user: profile,
    waterMl: water?.water_ml ?? 0,
    waterGoalMl: dash?.target_water_ml ?? fallback.waterGoalMl,
    kcalGoal: dash?.target_kcal ?? fallback.kcalGoal,
    macrosGoal: {
      protein: dash?.target_protein_g ?? fallback.macrosGoal.protein,
      carbs: dash?.target_carbs_g ?? fallback.macrosGoal.carbs,
      fat: dash?.target_fat_g ?? fallback.macrosGoal.fat,
    },
    meals,
    exercises: fallback.exercises,
    stores: fallback.stores,
    products: fallback.products,
    streak: fallback.streak,
    address: fallback.address,
  };
}
