import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { OrdersPageClient } from "./_components/OrdersPageClient";

export const metadata = {
  title: "Pedidos · Lojista",
};

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/shop/orders");

  return <OrdersPageClient />;
}