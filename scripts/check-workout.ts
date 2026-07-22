import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lzpxgstpbvncthtqtakj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6cHhnc3RwYnZuY3RodHF0YWtqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk3NTAxNiwiZXhwIjoyMDk0NTUxMDE2fQ.0TL031t-t32kCyT3vHLM7EFnD8jFitN0IDyLvLyvVe8";

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Checking workout_plans...");
  const { data: plans } = await supabase
    .from("workout_plans")
    .select("*")
    .order("created_at", { ascending: false });

  console.log("Latest plan:", plans);

  if (plans && plans.length > 0) {
    const plan = plans[0];
    try {
      const desc = JSON.parse(plan.description);
      console.log("Parsed description:", desc);

      if (desc.baseWorkoutId) {
        console.log("Fetching days for baseWorkoutId:", desc.baseWorkoutId);
        const { data: daysData, error } = await supabase
          .from("workout_days")
          .select("id, name, order, workout_day_exercises(id, sets, reps, exercise_id, exercises(name, target_muscle_group))")
          .eq("workout_id", desc.baseWorkoutId)
          .order("order", { ascending: true });
        
        console.log("Days error:", error);
        
        let exercises: any[] = [];
        if (daysData && daysData.length > 0) {
          console.log("Days:", JSON.stringify(daysData, null, 2));
          for (const day of daysData) {
            const dayExercises = day.workout_day_exercises || [];
            for (const ex of dayExercises) {
              const exDetails = ex.exercises as any;
              if (!exDetails) {
                 console.log("NO EX DETAILS FOR:", ex);
                 continue;
              }
              exercises.push({
                id: ex.id,
                name: exDetails.name || "Exercício",
                muscle: exDetails.target_muscle_group || "Geral",
                targetReps: ex.reps || "10",
                day: day.name,
              });
            }
          }
        }
        console.log("Final mapped exercises:", exercises);
      }
    } catch (e: any) {
      console.error("Failed to parse description:", e.message);
    }
  }
}

main().catch(console.error);
