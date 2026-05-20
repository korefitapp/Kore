import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadAppSeed } from "../_components/seed-loader";
import { ProfilePageClient } from "./_components/ProfilePageClient";

export const metadata = {
  title: "Perfil — KORE Super App",
};

export default async function ProfilePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app/profile");

  const seed = await loadAppSeed();
  return <ProfilePageClient seed={seed} />;
}