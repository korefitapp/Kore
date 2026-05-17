import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Dashboard · Personal Trainer",
};

export default async function PersonalDashboard() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/personal");

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <p className="text-xs text-kore-muted">B2B · Personal Trainer</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-kore-ink">
        Dashboard do Personal
      </h1>
      <p className="mt-2 text-sm text-kore-muted">
        🚧 Em construção. Layout completo já está deploy-ado no protótipo
        visual — próxima task: portar para Server Components e plugar Supabase
        (alunos, periodização, biblioteca de exercícios).
      </p>
    </main>
  );
}
