import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PersonalShell } from "./_components/PersonalShell";
import { OWNER } from "./_components/data";

export const metadata = {
  title: "Dashboard · Personal Trainer",
};

export default async function PersonalDashboard() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/personal");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const personalName =
    profile?.full_name ?? user.email?.split("@")[0] ?? OWNER.name;

  return <PersonalShell personalName={personalName} />;
}
