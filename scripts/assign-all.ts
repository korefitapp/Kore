import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const clients = ["3b070bba-194c-41f5-b8e6-aa0dc1b28e00", "e267075f-2ea4-4c86-92bd-c472b61565e8"]; // Cliente Teste & Pedro Henrique
  
  for (const client_id of clients) {
    const { error } = await supabase.from("workout_plans").insert({
      client_id,
      trainer_id: "ce5f350a-1043-4dd8-9ff4-51184df45566",
      name: "Hipertrofia Máxima - ABCDE",
      description: JSON.stringify({
        text: "Atribuído da biblioteca global.",
        baseWorkoutId: "f50fcd94-0c15-4db7-a538-e0f48fdf200b"
      }),
      is_active: true
    });
    if (error) console.error(error);
    else console.log(`Workout inserted for ${client_id}`);
  }
}
run();
