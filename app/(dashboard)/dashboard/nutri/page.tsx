import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { OWNER } from "./_components/data";
import { NutriShell } from "./_components/NutriShell";

export const metadata = {
  title: "Dashboard · Nutricionista",
};

export default async function NutriDashboard() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/nutri");

  const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const startOfToday = `${todayStr}T00:00:00.000Z`;
  const endOfToday = `${todayStr}T23:59:59.999Z`;

  // Queries Paralelas de Alta Performance
  const [
    profileRes,
    clientsRes,
    appointmentsRes,
    messagesRes,
    mealPlansRes
  ] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    
    supabase
      .from("professional_clients")
      .select(`
        status, 
        client:profiles!client_id(id, full_name, avatar_url)
      `)
      .eq("professional_id", user.id),
      
    supabase
      .from("appointments")
      .select(`
        id, title, start_time, end_time, status, modality, focus,
        client:profiles!client_id(full_name, avatar_url)
      `)
      .eq("professional_id", user.id)
      .gte("start_time", startOfToday)
      .lte("start_time", endOfToday)
      .order("start_time", { ascending: true }),
      
    supabase
      .from("messages")
      .select("id")
      .eq("receiver_id", user.id)
      .is("read_at", null),
      
    supabase
      .from("meal_plans")
      .select(`
        id, title, patient_id, is_template, objective, created_at,
        client:profiles!patient_id(full_name, avatar_url)
      `)
      .eq("nutritionist_id", user.id)
      .eq("is_template", false)
      .order("created_at", { ascending: false })
      .limit(10)
  ]);

  console.log('ID do Profissional:', user.id);
  console.log('Pacientes retornados (professional_clients):', clientsRes.data, clientsRes.error);

  const nutriName =
    profileRes.data?.full_name ?? user.email?.split("@")[0] ?? OWNER.name;

  // Montar props para a interface
  const dashboardData = {
    patients: clientsRes.data || [],
    appointmentsToday: appointmentsRes.data || [],
    unreadMessagesCount: messagesRes.data?.length || 0,
    mealPlans: mealPlansRes.data || []
  };

  return <NutriShell nutriName={nutriName} dashboardData={dashboardData} />;
}
