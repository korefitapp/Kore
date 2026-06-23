import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { PatientProfileClient } from "./PatientProfileClient";

export default async function PatientProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch patient data from profiles
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: patient, error } = await adminClient
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !patient) {
    // Se não encontrar ou não for do nutricionista logado
    redirect("/dashboard/nutri/patients");
  }

  return <PatientProfileClient patient={patient} />;
}
