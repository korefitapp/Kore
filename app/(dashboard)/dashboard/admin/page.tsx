import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminShell } from "./_components/AdminShell";

export const metadata = {
  title: "Dashboard · Super Admin",
};

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

  return <AdminShell adminName={adminName} />;
}
