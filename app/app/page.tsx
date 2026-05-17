import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { toUserDashboard } from "@/lib/domain/dashboard";
import { signOutAction } from "@/lib/auth/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Início",
};

export default async function AppHome() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data } = await supabase
    .from("v_user_dashboard")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const dash = data ? toUserDashboard(data) : null;
  const greet = greetingFor(new Date());

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs text-kore-muted">{greet},</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-kore-ink">
            {dash?.fullName?.split(" ")[0] ?? "Bem-vindo"} 👋
          </h1>
        </div>

        <form action={signOutAction}>
          <button
            type="submit"
            aria-label="Sair"
            className="btn-ghost text-xs"
          >
            <LogOut size={14} />
            Sair
          </button>
        </form>
      </header>

      <section className="card mt-6 p-5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-kore-muted">
          Sessão Supabase ativa
        </p>
        <p className="mt-1 font-mono text-xs text-kore-subink">{user.email}</p>
        <p className="mt-3 text-xs text-kore-muted">
          ✅ Login real plugado.{" "}
          {dash
            ? "v_user_dashboard hidratada via RLS."
            : "Targets ainda não criados — verifique a migration."}
        </p>
      </section>

      {dash && (
        <section className="card mt-4 p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-kore-muted">
            Metas diárias
          </p>
          <ul className="mt-2 grid grid-cols-2 gap-3 text-sm">
            <Stat label="Água" value={`${dash.targets.waterMl / 1000} L`} />
            <Stat label="Calorias" value={`${dash.targets.kcal} kcal`} />
            <Stat label="Proteína" value={`${dash.targets.proteinG} g`} />
            <Stat label="Passos" value={dash.targets.steps.toLocaleString("pt-BR")} />
          </ul>
        </section>
      )}

      <p className="mt-6 text-center text-[11px] text-kore-muted">
        Próximo passo: portar tabs (Home / Dieta / Treino / Shop / Perfil) do
        protótipo Vite para esta área autenticada.
      </p>
    </main>
  );
}

function greetingFor(now: Date) {
  const h = now.getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <li className="rounded-xl border border-kore-border bg-kore-bg/50 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-kore-muted">
        {label}
      </p>
      <p className="mt-0.5 text-base font-extrabold text-kore-ink">{value}</p>
    </li>
  );
}
