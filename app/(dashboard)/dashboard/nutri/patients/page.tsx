import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PatientsPageClient } from "./_components/PatientsPageClient";

export const metadata = {
  title: "Pacientes · Nutricionista",
};

export const dynamic = "force-dynamic";

export default async function PatientsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/nutri/patients");

  const { data: patients, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, display_name, avatar_url, status, created_at, metadata",
    )
    .eq("role", "patient")
    .order("full_name", { ascending: true });

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
      }))}
    />
  );
}