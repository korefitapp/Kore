import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { PatientsPageClient } from "./_components/PatientsPageClient";

export const metadata = {
  title: "Pacientes · Nutricionista",
};

export const dynamic = "force-dynamic";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/nutri/patients");

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const filter = searchParams?.filter || "todos";

  let query = adminClient
    .from("profiles")
    .select(
      "id, full_name, display_name, avatar_url, status, created_at, metadata, auth_user_id"
    )
    .eq("metadata->>nutritionist_id", user.id);

  if (filter === "em-dia") {
    query = query.eq("status", "active");
  } else if (filter === "reavaliar") {
    query = query.eq("status", "paused");
  } else if (filter === "atencao") {
    query = query.eq("status", "churned");
  }

  const { data: patients, error } = await query.order("full_name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar pacientes:", error.message);
  }

  return (
    <PatientsPageClient
      patients={(patients ?? []).map((p) => ({
        id: p.id,
        full_name: p.full_name,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
        status: p.status,
        created_at: p.created_at,
        metadata: p.metadata as Record<string, unknown> | null,
        auth_user_id: p.auth_user_id,
      }))}
    />
  );
}