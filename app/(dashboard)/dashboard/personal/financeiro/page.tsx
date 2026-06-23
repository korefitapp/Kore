import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";
import { MobileSidebar, Sidebar } from "../_components/Sidebar";
import { Topbar } from "../_components/Topbar";
import { FinanceKPIs } from "./_components/FinanceKPIs";
import { FinanceChart } from "./_components/FinanceChart";
import { RecentTransactions } from "./_components/RecentTransactions";

export const metadata = {
  title: "Financeiro · Personal",
};

export const dynamic = "force-dynamic";

export default async function FinanceiroPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/personal/financeiro");

  // Definir últimos 30 dias para os KPIs
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  // Buscar transações
  const { data: transactionsData, error } = await supabase
    .from("transactions")
    .select("id, description, type, status, amount, gross_amount, created_at")
    .eq("professional_id", user.id)
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar transações:", error.message);
  }

  const transactions = transactionsData || [];

  // Mapear transações garantindo que se não houver 'type' explícito, tratamos pelo amount ou default 'income'
  const mappedTransactions = transactions.map((t: any) => ({
    id: t.id,
    description: t.description || "Transação sem descrição",
    type: t.type || (t.amount >= 0 ? "income" : "expense"),
    status: t.status === "approved" || t.status === "concluido" ? "paid" : t.status === "pending" || t.status === "pendente" ? "pending" : t.status,
    amount: Math.abs(t.amount || t.gross_amount || 0),
    created_at: t.created_at,
  }));

  // Calcular KPIs
  let income = 0;
  let expense = 0;
  let pending = 0;

  mappedTransactions.forEach((t) => {
    if (t.type === "income") {
      if (t.status === "paid") {
        income += t.amount;
      } else if (t.status === "pending") {
        pending += t.amount;
      }
    } else if (t.type === "expense") {
      expense += t.amount;
    }
  });

  const net = income - expense;

  // Gerar dados para o Gráfico (mock agrupado pelos últimos 6 meses para visualização)
  // Como só temos os últimos 30 dias na query real acima, faremos uma simulação leve ou usaremos os dias
  const monthsStr = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const chartData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(now.getMonth() - i);
    chartData.push({ month: monthsStr[d.getMonth()], income: 0, expense: 0, monthNum: d.getMonth() });
  }

  // Povoar gráfico com dados reais (se houver histórico longo, mas limitamos a 30 dias, então só o mês atual e o anterior vão ter dados)
  mappedTransactions.forEach(t => {
    const d = new Date(t.created_at);
    const target = chartData.find(c => c.monthNum === d.getMonth());
    if (target) {
      if (t.type === "income" && t.status === "paid") target.income += t.amount;
      if (t.type === "expense") target.expense += t.amount;
    }
  });

  return (
    <div className="min-h-screen flex bg-kore-bg text-kore-ink">
      <Sidebar />
      <MobileSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />

        <main className="flex-1 px-3 sm:px-6 py-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Financeiro</h1>
              <p className="text-sm text-kore-muted mt-0.5">
                Resumo dos últimos 30 dias
              </p>
            </div>
            <button className="btn-emerald py-2.5 px-4 self-start sm:self-auto">
              <Plus size={18} strokeWidth={2.5} className="mr-1.5" />
              Nova Transação
            </button>
          </div>

          {/* KPIs */}
          <FinanceKPIs metrics={{ income, expense, net, pending }} />

          {/* Grid Dividido */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <FinanceChart data={chartData} />
            </div>
            <div className="xl:col-span-1">
              <RecentTransactions transactions={mappedTransactions.slice(0, 10)} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
