import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return NextResponse.json({ error: "no user" });

  const { data, error } = await supabase
    .from("workout_plans")
    .select("*")
    .eq("client_id", user.id);
    
  return NextResponse.json({
    userId: user.id,
    data,
    error
  });
}
