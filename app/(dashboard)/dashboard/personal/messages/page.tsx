import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { MessagesClient } from "./_components/MessagesClient";

export const metadata = {
  title: "Central de Mensagens · Personal",
};

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/personal/messages");

  // Tentar buscar perfis de alunos (contacts) do Supabase
  const { data: profiles, error: profilesError } = await (
    supabase as SupabaseClient
  )
    .from("profiles" as any)
    .select("id, full_name, avatar_url, role")
    .eq("role", "student")
    .order("full_name", { ascending: true });

  if (profilesError) {
    console.error("Erro ao buscar perfis:", profilesError.message);
  }

  // Tentar buscar mensagens do Supabase
  const { data: messages, error: messagesError } = await (
    supabase as SupabaseClient
  )
    .from("messages" as any)
    .select(
      "id, sender_id, receiver_id, content, created_at, read_at"
    )
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: true })
    .limit(500);

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