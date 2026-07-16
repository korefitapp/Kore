import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppRoot } from "./_components/AppRoot";
import { loadAppSeed } from "./_components/seed-loader";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "KORE Super App",
};

export default async function AppPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app");

  const seed = await loadAppSeed();
  // Debug: Removed writeFileSync because Vercel has read-only filesystem
  return <AppRoot seed={seed} />;
}
