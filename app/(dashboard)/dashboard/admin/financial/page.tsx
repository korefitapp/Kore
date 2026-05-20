import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FinancialClient } from "./_components/FinancialClient";

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

/* Mock data — substituir por query real quando a tabela `transactions` existir */

const MOCK_TRANSACTIONS: TransactionRow[] = [
  {
    id: "TXN-001",
    date: "2026-05-19T14:30:00Z",
    gross_amount: 197.0,
    platform_fee: 29.55,
    net_amount: 167.45,
    recipient: "Rafael Monteiro",
    status: "completed",
  },
  {
    id: "TXN-002",
    date: "2026-05-19T11:15:00Z",
    gross_amount: 149.9,
    platform_fee: 22.49,
    net_amount: 127.41,
    recipient: "Loja Suplementos Norte",
    status: "completed",
  },
  {
    id: "TXN-003",
    date: "2026-05-18T16:45:00Z",
    gross_amount: 249.0,
    platform_fee: 37.35,
    net_amount: 211.65,
    recipient: "Marina Cardoso",
    status: "completed",
  },
  {
    id: "TXN-004",
    date: "2026-05-18T09:20:00Z",
    gross_amount: 89.9,
    platform_fee: 13.49,
    net_amount: 76.41,
    recipient: "Boutique Atleta+",
    status: "refunded",
  },
  {
    id: "TXN-005",
    date: "2026-05-17T15:00:00Z",
    gross_amount: 349.0,
    platform_fee: 52.35,
    net_amount: 296.65,
    recipient: "André Bittencourt",
    status: "processing",
  },
  {
    id: "TXN-006",
    date: "2026-05-17T08:30:00Z",
    gross_amount: 179.0,
    platform_fee: 26.85,
    net_amount: 152.15,
    recipient: "Júlia Sant'Anna",
    status: "completed",
  },
  {
    id: "TXN-007",
    date: "2026-05-16T13:10:00Z",
    gross_amount: 129.9,
    platform_fee: 19.49,
    net_amount: 110.41,
    recipient: "Mercado VivaFit",
    status: "completed",
  },
  {
    id: "TXN-008",
    date: "2026-05-16T07:45:00Z",
    gross_amount: 97.0,
    platform_fee: 14.55,
    net_amount: 82.45,
    recipient: "Rafael Monteiro",
    status: "completed",
  },
  {
    id: "TXN-009",
    date: "2026-05-15T17:20:00Z",
    gross_amount: 199.0,
    platform_fee: 29.85,
    net_amount: 169.15,
    recipient: "Marina Cardoso",
    status: "completed",
  },
  {
    id: "TXN-010",
    date: "2026-05-15T10:00:00Z",
    gross_amount: 279.0,
    platform_fee: 41.85,
    net_amount: 237.15,
    recipient: "André Bittencourt",
    status: "completed",
  },
];

const MOCK_DAILY_REVENUE: DailyRevenue[] = [
  { day: "13/05", revenue: 420.0 },
  { day: "14/05", revenue: 580.5 },
  { day: "15/05", revenue: 478.0 },
  { day: "16/05", revenue: 226.9 },
  { day: "17/05", revenue: 528.0 },
  { day: "18/05", revenue: 338.9 },
  { day: "19/05", revenue: 346.9 },
];

export default async function FinancialPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/admin/financial");

  /*
   * TODO: Quando a tabela `transactions` existir no Supabase, descomentar:
   *
   * const admin = createSupabaseAdminClient();
   * const { data: transactions } = await admin
   *   .from("transactions")
   *   .select("id, date, gross_amount, platform_fee, net_amount, recipient, status")
   *   .order("date", { ascending: false })
   *   .limit(50);
   */

  const transactions: TransactionRow[] = MOCK_TRANSACTIONS;
  const dailyRevenue: DailyRevenue[] = MOCK_DAILY_REVENUE;

  return (
    <FinancialClient transactions={transactions} dailyRevenue={dailyRevenue} />
  );
}