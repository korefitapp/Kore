import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SettingsClient } from "./_components/SettingsClient";

export const metadata = {
  title: "Configurações · Personal Trainer",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/personal/settings");

  // Tentar buscar perfil do Supabase
  const { data: profile, error } = await (supabase as SupabaseClient)
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Erro ao buscar perfil:", error.message);
  }

  return (
    <SettingsClient
      profile={
        profile
          ? {
              id: user.id,
              full_name: (profile as any).full_name ?? null,
              avatar_url: (profile as any).avatar_url ?? null,
              bio: (profile as any).bio ?? null,
              email: user.email ?? null,
            }
          : {
              id: user.id,
              full_name: null,
              avatar_url: null,
              bio: null,
              email: user.email ?? null,
            }
      }
    />
  );
}