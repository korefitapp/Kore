import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MessagesClient } from "./_components/MessagesClient";
import { getChatContacts } from "@/app/actions/chat-actions";
import type { SupabaseClient } from "@supabase/supabase-js";

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

  const contacts = await getChatContacts();

  // Buscar status da instância do WhatsApp
  const { data: whatsappInstance } = await (
    supabase as SupabaseClient
  )
    .from("whatsapp_instances" as any)
    .select("status, qr_code_base64")
    .eq("professional_id", user.id)
    .single();

  return (
    <MessagesClient
      currentUserId={user.id}
      initialInstanceStatus={whatsappInstance?.status || "disconnected"}
      initialQrCode={whatsappInstance?.qr_code_base64 || null}
      initialContacts={contacts}
    />
  );
}