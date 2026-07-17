"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const EVO_URL = process.env.EVOLUTION_API_URL;
const EVO_KEY = process.env.EVOLUTION_GLOBAL_API_KEY;

export async function connectWhatsAppInstance() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Não autorizado");
  }

  if (!EVO_URL || !EVO_KEY) {
    throw new Error("Credenciais da Evolution API não configuradas no servidor.");
  }

  const instanceName = `kore_nutri_${user.id.substring(0, 8)}`;

  try {
    // 1. Cria a Instância na Evolution API
    const createRes = await fetch(`${EVO_URL}/instance/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: EVO_KEY,
      },
      body: JSON.stringify({
        instanceName: instanceName,
        token: instanceName, // Usamos o próprio nome como token para simplificar
        qrcode: true,
      }),
    });

    const createData = await createRes.json();
    
    // Se a instância já existir, a API normalmente retorna erro ou os dados da mesma.
    // Vamos tentar conectar/buscar o QR Code.
    let qrCodeBase64 = null;

    if (createData.qrcode && createData.qrcode.base64) {
      qrCodeBase64 = createData.qrcode.base64;
    } else {
      // Se não veio no create, chamamos o connect
      const connectRes = await fetch(`${EVO_URL}/instance/connect/${instanceName}`, {
        method: "GET",
        headers: {
          apikey: EVO_KEY,
        },
      });
      const connectData = await connectRes.json();
      if (connectData.base64) {
        qrCodeBase64 = connectData.base64;
      }
    }

    // 2. Grava/Atualiza na tabela whatsapp_instances do Supabase
    const { error: upsertError } = await supabase
      .from("whatsapp_instances")
      .upsert({
        professional_id: user.id,
        instance_name: instanceName,
        status: "connecting",
        qr_code_base64: qrCodeBase64,
        updated_at: new Date().toISOString()
      }, { onConflict: "professional_id" });

    if (upsertError) {
      throw new Error(`Erro ao guardar instância no banco: ${upsertError.message}`);
    }

    return { success: true, qrCode: qrCodeBase64, instanceName };
  } catch (error: any) {
    console.error("Erro na integração WhatsApp:", error);
    throw new Error(error.message || "Falha ao conectar instância.");
  }
}

export async function sendWhatsAppMessage(patientId: string | null, phone: string, text: string) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Não autorizado");
  }

  // 1. Vai buscar a instância ativa do nutricionista/trainer
  const { data: instance, error: instanceError } = await supabase
    .from("whatsapp_instances")
    .select("instance_name, status")
    .eq("professional_id", user.id)
    .single();

  if (instanceError || !instance || instance.status !== "connected") {
    throw new Error("WhatsApp não conectado.");
  }

  if (!EVO_URL || !EVO_KEY) {
    throw new Error("Credenciais da Evolution API ausentes.");
  }

  // 2. Tenta encontrar ou criar o chat_contact
  let { data: contact } = await supabase
    .from("chat_contacts")
    .select("id")
    .eq("professional_id", user.id)
    .eq("phone", phone)
    .single();

  if (!contact) {
    const { data: newContact, error: contactError } = await supabase
      .from("chat_contacts")
      .insert({
        professional_id: user.id,
        patient_id: patientId,
        phone: phone,
        name: phone, // Nome padrao
        last_message_at: new Date().toISOString(),
        last_message_preview: text
      })
      .select("id")
      .single();

    if (contactError) throw new Error("Erro ao criar contato");
    contact = newContact;
  } else {
    await supabase.from("chat_contacts").update({
      last_message_at: new Date().toISOString(),
      last_message_preview: text
    }).eq("id", contact.id);
  }

  try {
    // 3. Envia para a Evolution API
    const sendRes = await fetch(`${EVO_URL}/message/sendText/${instance.instance_name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: EVO_KEY,
      },
      body: JSON.stringify({
        number: phone,
        options: {
          delay: 1200,
          presence: "composing"
        },
        textMessage: {
          text: text
        }
      }),
    });

    if (!sendRes.ok) {
      const errData = await sendRes.json();
      throw new Error(`Evolution API erro: ${JSON.stringify(errData)}`);
    }

    const responseData = await sendRes.json();
    const messageId = responseData.key?.id || `temp_${Date.now()}`;

    // 4. Grava no banco de dados para o histórico do chat
    const { error: insertError } = await supabase
      .from("chat_messages")
      .insert({
        contact_id: contact.id,
        message_id: messageId,
        sender_id: user.id,
        text: text,
        is_from_me: true,
        status: "sent"
      });

    if (insertError) {
      console.error("Mensagem enviada, mas não gravada na BD:", insertError.message);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Erro ao enviar WhatsApp:", error);
    throw new Error(error.message || "Falha ao enviar mensagem.");
  }
}

export async function disconnectWhatsAppInstance() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autorizado");

  const { data: instance } = await supabase
    .from("whatsapp_instances")
    .select("instance_name")
    .eq("professional_id", user.id)
    .single();

  if (instance && EVO_URL && EVO_KEY) {
    // Logout from Evolution API
    await fetch(`${EVO_URL}/instance/logout/${instance.instance_name}`, {
      method: "DELETE",
      headers: { apikey: EVO_KEY }
    });
  }

  await supabase
    .from("whatsapp_instances")
    .update({ status: "disconnected", qr_code_base64: null })
    .eq("professional_id", user.id);

  return { success: true };
}

