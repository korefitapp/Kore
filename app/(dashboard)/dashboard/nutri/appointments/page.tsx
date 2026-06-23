import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AppointmentsPageClient } from "./_components/AppointmentsPageClient";

export const metadata = {
  title: "Gestão de Consultas · Nutricionista",
};

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/nutri/appointments");

  // Buscar appointments da nutri logada na semana atual
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  // Buscar pacientes para o select
  const { data: clientsData } = await (supabase as SupabaseClient)
    .from("professional_clients")
    .select("client:profiles!client_id(id, full_name, avatar_url)")
    .eq("professional_id", user.id);

  const patients = (clientsData || []).map((c: any) => ({
    id: c.client?.id,
    name: c.client?.full_name,
    avatar: c.client?.avatar_url,
  }));

  // Query real na tabela appointments do Supabase
  const { data: appointments, error } = await (supabase as SupabaseClient)
    .from("appointments" as any)
    .select(`
      id, title, modality, focus, status, start_time, end_time, notes, client_id,
      client:profiles!client_id(id, full_name, avatar_url)
    `)
    .eq("professional_id", user.id)
    .gte("start_time", startOfWeek.toISOString())
    .lt("start_time", endOfWeek.toISOString())
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Erro ao buscar consultas:", error.message);
  }

  return (
    <AppointmentsPageClient
      patients={patients}
      appointments={(appointments ?? []).map((a: any) => ({
        id: a.id as string,
        title: a.title as string | null,
        focus: a.focus as string | null,
        modality: a.modality as string | null,
        status: a.status as string | null,
        start_time: a.start_time as string,
        end_time: a.end_time as string | null,
        notes: a.notes as string | null,
        client_id: a.client?.id as string | null,
        client_name: a.client?.full_name as string | null,
        client_avatar_url: a.client?.avatar_url as string | null,
      }))}
    />
  );
}