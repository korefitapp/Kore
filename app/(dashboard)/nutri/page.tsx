import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Dashboard · Nutricionista",
};

export default async function NutriDashboard() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/nutri");

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <p className="text-xs text-kore-muted">B2B · Nutricionista</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-kore-ink">
        Dashboard do Nutricionista
      </h1>
      <p className="mt-2 text-sm text-kore-muted">
        🚧 Em construção. Próximas tasks: CRM de pacientes, montador de
        cardápio drag-and-drop e visualização de compliance de macros.
      </p>
    </main>
  );
}
