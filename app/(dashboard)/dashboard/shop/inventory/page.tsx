import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { InventoryPageClient } from "./_components/InventoryPageClient";

export const metadata = {
  title: "Controle de Estoque · Lojista",
};

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/shop/inventory");

  return <InventoryPageClient />;
}