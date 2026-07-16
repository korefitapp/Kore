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
  const { data: appointments, error } = await (supabase as SupabaseClient)
    .from("appointments" as any)
    .select(`
      id, title, status, start_time, end_time, professional_id, client_id,
      profiles!appointments_client_id_fkey ( full_name, avatar_url )
    `)
    .eq("professional_id", user.id)
    .gte("start_time", startOfWeek.toISOString())
    .lt("start_time", endOfWeek.toISOString())
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Erro ao buscar agendamentos:", error.message);
  }

  return (
    <AgendaClient
      appointments={(appointments ?? []).map((a: any) => ({
        id: a.id as string,
        title: a.title as string | null,
        focus: a.title ? (a.title.includes(" - ") ? a.title.split(" - ")[0] : a.title) : "Agendamento",
        status: a.status as string | null,
        start_time: a.start_time as string,
        end_time: a.end_time as string | null,
        notes: (a.title && a.title.includes(" - ")) ? a.title.substring(a.title.indexOf(" - ") + 3) : "",
        client_id: a.client_id as string | null,
        client_name: a.profiles?.full_name as string | null,
        client_avatar_url: a.profiles?.avatar_url as string | null,
      }))}
    />
  );
}