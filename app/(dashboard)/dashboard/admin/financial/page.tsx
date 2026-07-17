import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FinancialClient } from "./_components/FinancialClient";
import { getAdminTransactions } from "@/app/actions/financial-actions";

export const metadata = {
  title: "Financeiro · Super Admin",
};

export const dynamic = "force-dynamic";

export type TransactionRow = {
  id: string;
  date: string;
  gross_amount: number;
  platform_fee: number;
  net_amount: number;
  recipient: string;
  status: string;
};

export type DailyRevenue = {
  day: string; // "13/05"
  revenue: number;
};

/* ── Mock data removido ──────────────────────────────────────────────── */

export default async function FinancialPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/admin/financial");

  const adminTransactions = await getAdminTransactions();
  
  const transactions: TransactionRow[] = adminTransactions.map((t) => {
    const gross_amount = Number(t.amount);
    const platform_fee = gross_amount * 0.1; // Assumindo taxa de 10%
    const net_amount = gross_amount - platform_fee;
    
    return {
      id: t.id,
      date: t.created_at,
      gross_amount,
      platform_fee,
      net_amount,
      recipient: (t as any).professional?.full_name || "Profissional",
      status: t.status === "concluido" ? "completed" : t.status === "pendente" ? "processing" : t.status === "estornado" ? "refunded" : t.status,
    };
  });

  return (
    <FinancialClient transactions={transactions} />
  );
}