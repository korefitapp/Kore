import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AgendaClient } from "./_components/AgendaClient";

export const metadata = {
  title: "Minha Agenda · Personal",
};

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/personal/agenda");

  // Buscar appointments do personal logado na semana atual
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // domingo
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  // Query real na tabela appointments do Supabase
  // Tipagem any pois a tabela appointments pode não existir nos tipos gerados
  const { data: appointments, error } = await (supabase as SupabaseClient)
    .from("appointments" as any)
    .select(
      "id, title, type, status, start_time, end_time, notes, professional_id, client_id, client_name, client_avatar_url"
    )
    .eq("professional_id", user.id)
    .gte("start_time", startOfWeek.toISOString())
    .lt("start_time", endOfWeek.toISOString())
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Erro ao buscar agendamentos:", error.message);
  }

  return (
    <AgendaClient
      appointments={(appointments ?? []).map((a) => ({
        id: a.id as string,
        title: a.title as string | null,
        type: a.type as string | null,
        status: a.status as string | null,
        start_time: a.start_time as string,
        end_time: a.end_time as string | null,
        notes: a.notes as string | null,
        client_id: a.client_id as string | null,
        client_name: a.client_name as string | null,
        client_avatar_url: a.client_avatar_url as string | null,
      }))}
    />
  );
}