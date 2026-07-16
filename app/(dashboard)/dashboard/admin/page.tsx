import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminShell } from "./_components/AdminShell";
import type {
  PendingProfessional,
  ProfessionalKind,
} from "./_components/types";

export const metadata = {
  title: "Dashboard · Super Admin",
};

export const dynamic = "force-dynamic";

const KIND_AVATAR: Record<ProfessionalKind, string> = {
  nutritionist: "🥗",
  trainer: "🏋️",
  merchant: "🛒",
};

type ProfileRow = {
  id: string;
  full_name: string;
  role: ProfessionalKind;
  cref: string | null;
  crn: string | null;
  cnpj: string | null;
  created_at: string;
};

function registryFor(p: ProfileRow): string {
  if (p.role === "trainer") return p.cref ?? "";
  if (p.role === "nutritionist") return p.crn ?? "";
  return p.cnpj ?? "";
}

function mapProfileToPending(p: ProfileRow): PendingProfessional {
  return {
    id: p.id,
    name: p.full_name || "Sem nome",
    avatar: KIND_AVATAR[p.role],
    kind: p.role,
    registry: registryFor(p),
    city: "—",
    submittedAt: p.created_at,
    documents: registryFor(p) ? 1 : 0,
    documentsTotal: 1,
    status: "pending",
  };
}

export default async function AdminDashboard() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const adminName =
    profile?.full_name ?? user.email?.split("@")[0] ?? "Super Admin";

  const admin = createSupabaseAdminClient();

  // 1. Fetch Total Users
  const { count: usersCount } = await admin
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // 2. Fetch Active Professionals (approved/active status)
  const { count: activeProsCount } = await admin
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .in("role", ["nutritionist", "trainer", "merchant"])
    // Assumimos 'approved' ou 'active' para profissionais aprovados
    .in("status", ["approved", "active"]);

  // 3. Fetch Pending Professionals
  const { count: pendingProsCount } = await admin
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .in("role", ["nutritionist", "trainer", "merchant"])
    .eq("status", "pending");

  // 4. Fetch Open Disputes
  const { count: openDisputesCount } = await admin
    .from("disputes")
    .select("*", { count: "exact", head: true })
    .eq("status", "open");

  // Lê fila real de profissionais pendentes via Service Role (RLS bypass).
  const { data: pendingRows } = await admin
    .from("profiles")
    .select("id, full_name, role, cref, crn, cnpj, created_at")
    .eq("status", "pending")
    .in("role", ["nutritionist", "trainer", "merchant"])
    .order("created_at", { ascending: false })
    .limit(100);

  const pending: PendingProfessional[] = (pendingRows ?? []).map((r) =>
    mapProfileToPending(r as ProfileRow),
  );

  const metrics = {
    usersCount: usersCount ?? 0,
    activeProsCount: activeProsCount ?? 0,
    pendingProsCount: pendingProsCount ?? 0,
    openDisputesCount: openDisputesCount ?? 0,
  };

  return (
    <AdminShell adminName={adminName} pending={pending} metrics={metrics} />
  );
}
