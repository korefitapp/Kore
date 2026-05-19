import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { OWNER } from "./_components/data";
import { NutriShell } from "./_components/NutriShell";

export const metadata = {
  title: "Dashboard · Nutricionista",
};

export default async function NutriDashboard() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/nutri");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const nutriName =
    profile?.full_name ?? user.email?.split("@")[0] ?? OWNER.name;

  return <NutriShell nutriName={nutriName} />;
}
