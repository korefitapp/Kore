import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { UsersClient } from "./_components/UsersClient";

export const metadata = {
  title: "Gestão de Usuários · Super Admin",
};

export const dynamic = "force-dynamic";

export type UserRow = {
  id: string;
  full_name: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
  status: string;
  email: string;
  created_at: string;
};

export default async function UsersPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/admin/users");

  /* Service Role para listar todas as profiles + emails (RLS bypass) */
  const admin = createSupabaseAdminClient();

  const { data: profiles } = await admin
    .from("profiles")
    .select(
      "id, full_name, display_name, avatar_url, role, status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(500);

  /* Emails não estão na tabela profiles — vêm do auth.users */
  const { data: authUsers } = await admin.auth.admin.listUsers();
  const emailMap = new Map<string, string>();
  for (const u of authUsers?.users ?? []) {
    if (u.email) emailMap.set(u.id, u.email);
  }

  const users: UserRow[] = (profiles ?? []).map((p) => ({
    id: p.id,
    full_name: p.full_name || "Sem nome",
    display_name: p.display_name,
    avatar_url: p.avatar_url,
    role: p.role,
    status: p.status,
    email: emailMap.get(p.id) ?? "—",
    created_at: p.created_at,
  }));

  return <UsersClient users={users} />;
}