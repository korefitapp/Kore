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
  require("fs").writeFileSync("seed-dump.json", JSON.stringify({
    userId: user.id,
    email: user.email,
    exercises: seed.exercises
  }, null, 2));
  return <AppRoot seed={seed} />;
}
