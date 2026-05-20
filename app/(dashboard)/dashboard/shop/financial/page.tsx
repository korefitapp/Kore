import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FinancialPageClient } from "./_components/FinancialPageClient";

export const metadata = {
  title: "Financeiro · Lojista",
};

export const dynamic = "force-dynamic";

export default async function FinancialPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/shop/financial");

  return <FinancialPageClient />;
}