import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SettingsPageClient } from "./_components/SettingsPageClient";

export const metadata = {
  title: "Configurações · Lojista",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/shop/settings");

  return <SettingsPageClient />;
}