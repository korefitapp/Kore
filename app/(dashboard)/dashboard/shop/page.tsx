import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { OWNER } from "./_components/data";
import { ShopShell } from "./_components/ShopShell";

export const metadata = {
  title: "Dashboard · Lojista",
};

export default async function ShopDashboard() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/shop");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const shopName =
    profile?.full_name ?? user.email?.split("@")[0] ?? OWNER.name;

  return <ShopShell shopName={shopName} />;
}
