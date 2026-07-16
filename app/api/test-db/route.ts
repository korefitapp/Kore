import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = createSupabaseAdminClient();
  
  // Find the loja@kore.test user
  const { data: users, error: userError } = await admin.auth.admin.listUsers();
  const lojaUser = users?.users.find(u => u.email === "loja@kore.test");

  return NextResponse.json({
    lojaUser: lojaUser || "Not found",
    error: userError
  });
}
