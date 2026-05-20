import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { MessagesClient } from "./_components/MessagesClient";

export const metadata = {
  title: "Central de Mensagens · Nutricionista",
};

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/nutri/messages");

  // Buscar profiles de pacientes
  const { data: profiles, error: profilesError } = await (
    supabase as SupabaseClient
  )
    .from("profiles" as any)
    .select("id, full_name, avatar_url")
    .eq("role", "patient");

  if (profilesError) {
    console.error("Erro ao buscar perfis:", profilesError.message);
  }

  // Buscar mensagens do nutricionista logado
  const { data: messages, error: messagesError } = await (
    supabase as SupabaseClient
  )
    .from("messages" as any)
    .select("id, sender_id, receiver_id, content, created_at, read_at")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: true });

  if (messagesError) {
    console.error("Erro ao buscar mensagens:", messagesError.message);
  }

  return (
    <MessagesClient
      currentUserId={user.id}
      profiles={(profiles ?? []).map((p) => ({
        id: p.id as string,
        full_name: p.full_name as string | null,
        avatar_url: p.avatar_url as string | null,
      }))}
      messages={(messages ?? []).map((m) => ({
        id: m.id as string,
        sender_id: m.sender_id as string,
        receiver_id: m.receiver_id as string,
        content: m.content as string,
        created_at: m.created_at as string,
        read_at: m.read_at as string | null,
      }))}
    />
  );
}