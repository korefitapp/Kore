import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Dashboard · Super Admin",
};

export default async function AdminDashboard() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/admin");

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <p className="text-xs text-kore-muted">B2B · Super Admin</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-kore-ink">
        Dashboard do Super Admin
      </h1>
      <p className="mt-2 text-sm text-kore-muted">
        🚧 Em construção. Layout completo já está deploy-ado no protótipo
        visual — próxima task: portar para Server Components e plugar Supabase
        (gestão de usuários, aprovação de profissionais, marketplace, Stripe
        analytics).
      </p>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-kore-muted">
            Usuários
          </p>
          <p className="mt-2 text-sm text-kore-subink">
            Gestão e moderação da base de clientes finais (role{" "}
            <code>client</code>).
          </p>
        </div>
        <div className="card p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-kore-muted">
            Profissionais
          </p>
          <p className="mt-2 text-sm text-kore-subink">
            Aprovação de cadastros das roles <code>nutritionist</code>,{" "}
            <code>trainer</code> e <code>merchant</code>.
          </p>
        </div>
        <div className="card p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-kore-muted">
            Marketplace
          </p>
          <p className="mt-2 text-sm text-kore-subink">
            Logística de pedidos e mediação de disputas entre cliente e
            lojista.
          </p>
        </div>
        <div className="card p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-kore-muted">
            Financeiro
          </p>
          <p className="mt-2 text-sm text-kore-subink">
            Stripe Connect analytics, MRR, split por papel e payouts.
          </p>
        </div>
      </section>
    </main>
  );
}
