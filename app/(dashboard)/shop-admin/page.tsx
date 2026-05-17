import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Dashboard · Lojista",
};

export default async function ShopDashboard() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/shop-admin");

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <p className="text-xs text-kore-muted">B2B · Lojista</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-kore-ink">
        Dashboard do Lojista
      </h1>
      <p className="mt-2 text-sm text-kore-muted">
        🚧 Em construção. Próximas tasks: gestão de catálogo, controle de
        estoque e Kanban de pedidos (Novo → Preparando → Entregue) via Stripe
        Connect.
      </p>
    </main>
  );
}
