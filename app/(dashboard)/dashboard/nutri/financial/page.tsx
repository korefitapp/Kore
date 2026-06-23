import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FinancialClient } from "./_components/FinancialClient";
import { getFinancialDashboardStats } from "@/app/actions/payment-actions";

export const metadata = {
  title: "Gestão Financeira · Nutricionista",
};

export const dynamic = "force-dynamic";

export default async function FinancialPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/nutri/financial");

  let stats;
  try {
    stats = await getFinancialDashboardStats();
  } catch (error: any) {
    console.error("Erro ao buscar estatísticas financeiras:", error.message);
    stats = {
      metrics: { grossRevenue: 0, netRevenue: 0, pendingAmount: 0, pendingCount: 0 },
      chartData: [],
      history: []
    };
  }

  return (
    <FinancialClient
      transactions={stats.history}
      metrics={stats.metrics}
      chartData={stats.chartData}
    />
  );
}