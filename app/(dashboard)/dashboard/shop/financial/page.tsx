import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FinancialPageClient } from "./_components/FinancialPageClient";
import { getProfessionalTransactions, getProfessionalPayouts } from "@/app/actions/financial-actions";

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

  const transactions = await getProfessionalTransactions();
  const payouts = await getProfessionalPayouts();

  return <FinancialPageClient initialTransactions={transactions} initialPayouts={payouts} />;
}