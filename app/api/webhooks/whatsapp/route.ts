import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const event = payload.event;
    const instanceName = payload.instance; // e.g. kore_nutri_1234abcd

    const supabase = createSupabaseServerClient();

    if (!instanceName) {
      return NextResponse.json({ error: "No instance provided" }, { status: 400 });
    }

    // Identify professional_id by finding the instance
    const { data: instanceData } = await supabase
      .from("whatsapp_instances")
      .select("professional_id")
      .eq("instance_name", instanceName)
      .single();

    if (!instanceData) {
      return NextResponse.json({ error: "Instance not found in DB" }, { status: 404 });
    }

    const professionalId = instanceData.professional_id;

    // Handle connection update
    if (event === "connection.update") {
      const state = payload.data?.state;
      let status = "connecting";
      
      if (state === "open") status = "connected";
      else if (state === "close" || state === "refused") status = "disconnected";

      await supabase
        .from("whatsapp_instances")
        .update({ status })
        .eq("instance_name", instanceName);

      return NextResponse.json({ success: true, status });
    }

    // Handle incoming messages
    if (event === "messages.upsert") {
      const messages = payload.data?.messages;
      if (!messages || messages.length === 0) {
        return NextResponse.json({ success: true, ignored: true });
      }

      for (const msg of messages) {
        // Ignorar mensagens enviadas por nós mesmos (ou processar se quisermos)
        const isFromMe = msg.key.fromMe;
        
        // Se for de grupo ou status, ignorar
        if (msg.key.remoteJid.includes("@g.us") || msg.key.remoteJid === "status@broadcast") {
          continue;
        }

        const phone = msg.key.remoteJid;
        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
        const messageId = msg.key.id;
        const senderName = msg.pushName || phone.split("@")[0];

        // Se não tiver texto, podemos ignorar neste MVP ou salvar como "[Mídia]"
        const previewText = text ? text : "[Mídia]";

        // 1. Tentar achar ou criar o contato
        let { data: contact } = await supabase
          .from("chat_contacts")
          .select("id")
          .eq("professional_id", professionalId)
          .eq("phone", phone)
          .single();

        if (!contact) {
          const { data: newContact } = await supabase
            .from("chat_contacts")
            .insert({
              professional_id: professionalId,
              name: senderName,
              phone: phone,
              last_message_at: new Date().toISOString(),
              last_message_preview: previewText,
              unread_count: isFromMe ? 0 : 1
            })
            .select("id")
            .single();
          
          if (newContact) contact = newContact;
        } else {
          // Atualiza last_message_at e unread_count
          const { data: currentContact } = await supabase
            .from("chat_contacts")
            .select("unread_count")
            .eq("id", contact.id)
            .single();

          const newUnread = isFromMe ? 0 : ((currentContact?.unread_count || 0) + 1);

          await supabase
            .from("chat_contacts")
            .update({
              last_message_at: new Date().toISOString(),
              last_message_preview: previewText,
              name: senderName, // atualiza nome se mudou
              unread_count: newUnread
            })
            .eq("id", contact.id);
        }

        if (contact) {
          // 2. Inserir a mensagem
          await supabase
            .from("chat_messages")
            .insert({
              contact_id: contact.id,
              message_id: messageId,
              text: previewText,
              is_from_me: isFromMe,
              status: isFromMe ? "sent" : "received"
            });
        }
      }

      return NextResponse.json({ success: true });
    }

    // Return OK for other unhandled events to prevent retries
    return NextResponse.json({ success: true, ignored: true });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
