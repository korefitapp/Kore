import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { FinancialClient } from "./_components/FinancialClient";

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

  const { data: transactions, error } = await (supabase as SupabaseClient)
    .from("financial_logs" as any)
    .select(
      "id, created_at, patient_name, description, gross_amount, net_amount, status",
    )
    .eq("nutri_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Erro ao buscar transações financeiras:", error.message);
  }

  return (
    <FinancialClient
      transactions={(transactions ?? []).map((t) => ({
        id: t.id as string,
        created_at: t.created_at as string,
        patient_name: t.patient_name as string,
        description: t.description as string,
        gross_amount: t.gross_amount as number,
        net_amount: t.net_amount as number,
        status: t.status as
          | "concluido"
          | "pendente"
          | "recusado",
      }))}
    />
  );
}