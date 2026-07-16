import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return NextResponse.json({ error: "No user" });

    // Mocking an insert to see what fails
    const { data, error } = await supabase
      .from("workout_plans")
      .insert({
        trainer_id: user.id,
        client_id: user.id, // Using self as client just to test constraints
        name: "Test",
        description: "Test",
        is_active: true,
        metadata: { base_workout_id: "test" },
      })
      .select()
      .single();

    return NextResponse.json({ data, error });
  } catch (e: any) {
    return NextResponse.json({ exception: e.message });
  }
}
