import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { FinancialClient, type Transaction } from "./_components/FinancialClient";

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

  // Tentar buscar transações do Supabase
  const { data: transactions, error } = await (supabase as SupabaseClient)
    .from("transactions" as any)
    .select("*")
    .eq("personal_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Erro ao buscar transações:", error.message);
  }

  return (
    <FinancialClient
      transactions={
        (transactions ?? []).map((t: any) => ({
          id: t.id as string,
          created_at: t.created_at as string,
          student_name: t.student_name as string,
          service: t.service as string,
          gross_amount: t.gross_amount as number,
          net_amount: t.net_amount as number,
          status: t.status as "concluido" | "pendente" | "estornado",
        })) as Transaction[]
      }
    />
  );
}