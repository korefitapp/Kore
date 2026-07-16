/**
 * Server-side loader: fetches the user's "Real Time Ready" snapshot
 * (profile + daily targets + meal logs + water log) from Supabase and
 * returns an `AppSeed` to hydrate the Zustand store on the client.
 *
 * If Supabase is unreachable or rows are missing, falls back to the
 * baked-in fallback seed (offline mode).
 */
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
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

  const adminSupabase = createSupabaseAdminClient();
  const [{ data: dash }, { data: water }, { data: rawLogs }, { data: coachData }, { data: trainersData }, { data: workoutPlan, error: wpError }] =
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
      supabase
        .from("profiles")
        .select("coach_id, metadata")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("id, full_name, metadata")
        .eq("role", "trainer")
        .eq("status", "active")
        .limit(5),
      adminSupabase
        .from("workout_plans")
        .select("description")
        .eq("client_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  if (wpError) {
    require("fs").appendFileSync("debug-log.txt", "WP ERROR: " + JSON.stringify(wpError) + "\n");
  }

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
    coachId: coachData?.coach_id || null,
  };

  const trainers = trainersData || [];
  const topTrainers = trainers.map((t: any) => {
    const nameParts = t.full_name?.split(" ") || ["P"];
    const initials = nameParts[0][0] + (nameParts.length > 1 ? nameParts[1][0] : "");
    const meta = (t.metadata as Record<string, any>) || {};
    return {
      id: t.id,
      name: t.full_name || "Treinador",
      specialty: meta.specialty || "Hipertrofia e Condicionamento",
      distance: meta.distance ? `A ${meta.distance} km de você` : "Próximo de você",
      rating: meta.rating ? String(meta.rating) : "4.9",
      avatarInitials: initials.toUpperCase(),
    };
  });

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

  const userMetadata = (coachData?.metadata as Record<string, any>) || {};
  const userWeight = typeof userMetadata.weight === "number" ? userMetadata.weight : 70;
  const computedWaterGoal = userWeight * 35;

  let exercises = fallback.exercises;
  
  if (workoutPlan && workoutPlan.description) {
    require("fs").appendFileSync("debug-log.txt", "1. Has workoutPlan and description\n");
    try {
      const parsedDesc = JSON.parse(workoutPlan.description);
      require("fs").appendFileSync("debug-log.txt", "2. Parsed JSON: " + JSON.stringify(parsedDesc) + "\n");
      if (parsedDesc.baseWorkoutId) {
        require("fs").appendFileSync("debug-log.txt", "3. Has baseWorkoutId: " + parsedDesc.baseWorkoutId + "\n");
        const adminSupabase = createSupabaseAdminClient();
        // Fetch workout days and exercises bypassing RLS so the client can read the trainer's workout days
        const { data: daysData, error } = await adminSupabase
          .from("workout_days")
          .select("id, name, order, workout_day_exercises(id, sets, reps, exercise_id, exercises(name, target_muscle_group))")
          .eq("workout_id", parsedDesc.baseWorkoutId)
          .order("order", { ascending: true });

        require("fs").appendFileSync("debug-log.txt", "4. Fetched daysData, error: " + error + " length: " + (daysData?.length) + "\n");

        if (error) console.error("Admin fetch error for workout days:", error);

        if (daysData && daysData.length > 0) {
          exercises = [];
          for (const day of daysData) {
            const dayExercises = day.workout_day_exercises || [];
            for (const ex of dayExercises) {
              const exDetails = ex.exercises as any;
              if (!exDetails) continue;
              exercises.push({
                id: ex.id,
                name: exDetails.name || "Exercício",
                muscle: exDetails.target_muscle_group || "Geral",
                thumb: exDetails.video_url || "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=200&auto=format&fit=crop",
                videoLabel: "Ver Execução",
                targetReps: ex.reps || "10",
                sets: Array.from({ length: ex.sets || 3 }).map(() => ({
                  load: "-",
                  reps: ex.reps || "10",
                  done: false,
                })),
                day: day.name,
              });
            }
          }
          require("fs").appendFileSync("debug-log.txt", "5. Built exercises length: " + exercises.length + "\n");
        } else {
          require("fs").appendFileSync("debug-log.txt", "5. No daysData found or empty\n");
        }
      } else {
        require("fs").appendFileSync("debug-log.txt", "3. No baseWorkoutId\n");
      }
    } catch (e: any) {
      require("fs").appendFileSync("debug-log.txt", "2. Exception: " + e.message + "\n");
      console.error("Failed to parse workout plan description", e);
    }
  } else {
    require("fs").appendFileSync("debug-log.txt", "1. NO workoutPlan or no description. workoutPlan=" + JSON.stringify(workoutPlan) + "\n");
  }

  return {
    online: true,
    user: profile,
    waterMl: water?.water_ml ?? 0,
    waterGoalMl: computedWaterGoal,
    kcalGoal: dash?.target_kcal ?? fallback.kcalGoal,
    macrosGoal: {
      protein: dash?.target_protein_g ?? fallback.macrosGoal.protein,
      carbs: dash?.target_carbs_g ?? fallback.macrosGoal.carbs,
      fat: dash?.target_fat_g ?? fallback.macrosGoal.fat,
    },
    meals,
    exercises,
    stores: fallback.stores,
    products: fallback.products,
    streak: fallback.streak,
    address: fallback.address,
  };
}
