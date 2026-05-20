import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SettingsClient } from "./_components/SettingsClient";

export const metadata = {
  title: "Configurações · Nutricionista",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/nutri/settings");

  const { data: profile } = await (supabase as SupabaseClient)
    .from("profiles" as any)
    .select("id, full_name, avatar_url, bio, email")
    .eq("id", user.id)
    .single();

  return (
    <SettingsClient
      profile={{
        id: user.id,
        full_name: (profile?.full_name as string) ?? null,
        avatar_url: (profile?.avatar_url as string) ?? null,
        bio: (profile?.bio as string) ?? null,
        email: (profile?.email as string) ?? user.email ?? null,
      }}
    />
  );
}