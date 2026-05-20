import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CustomersPageClient } from "./_components/CustomersPageClient";

export const metadata = {
  title: "Clientes · Lojista",
};

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/shop/customers");

  return <CustomersPageClient />;
}