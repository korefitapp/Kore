import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FinancialClient } from "./_components/FinancialClient";
import { getProfessionalTransactions } from "@/app/actions/financial-actions";

export const metadata = {
  title: "Financeiro · Personal Trainer",
};

export const dynamic = "force-dynamic";

export default async function FinancialPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/personal/financial");

  const transactions = await getProfessionalTransactions();

  return <FinancialClient transactions={transactions} />;
}