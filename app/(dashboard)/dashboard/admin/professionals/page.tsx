import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProfessionalsClient } from "./_components/ProfessionalsClient";

export const metadata = {
  title: "Profissionais e Lojistas · Super Admin",
};

export const dynamic = "force-dynamic";

export type ProfessionalRow = {
  id: string;
  full_name: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
  status: string;
  cref: string | null;
  crn: string | null;
  cnpj: string | null;
  created_at: string;
};

export default async function ProfessionalsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/admin/professionals");

  const admin = createSupabaseAdminClient();

  const { data: profiles } = await admin
    .from("profiles")
    .select(
      "id, full_name, display_name, avatar_url, role, status, cref, crn, cnpj, created_at",
    )
    .in("role", ["trainer", "nutritionist", "merchant"])
    .order("created_at", { ascending: false })
    .limit(500);

  const professionals: ProfessionalRow[] = (profiles ?? []).map((p) => ({
    id: p.id,
    full_name: p.full_name || "Sem nome",
    display_name: p.display_name,
    avatar_url: p.avatar_url,
    role: p.role,
    status: p.status,
    cref: p.cref,
    crn: p.crn,
    cnpj: p.cnpj,
    created_at: p.created_at,
  }));

  return <ProfessionalsClient professionals={professionals} />;
}