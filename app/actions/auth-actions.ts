"use server";

import { createClient } from "@supabase/supabase-js";

export async function claimPatientAccount(phone: string, pin: string, email: string, fullName: string) {
  // Configuração do Supabase Admin para ignorar RLS
  const adminAuthClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // 1. Busca o Shadow Profile usando phone e PIN (e verifica expiração)
  const { data: profile, error: searchError } = await adminAuthClient
    .from("profiles")
    .select("id, pin_expires_at, auth_user_id")
    .eq("phone", phone)
    .eq("activation_pin", pin)
    .single();

  if (searchError || !profile) {
    throw new Error("Código PIN inválido ou telefone incorreto.");
  }

  if (profile.auth_user_id) {
    throw new Error("Esta conta já foi ativada anteriormente.");
  }

  if (new Date(profile.pin_expires_at) < new Date()) {
    throw new Error("O código PIN expirou. Solicite um novo código ao seu nutricionista.");
  }

  // 2. Cria o Utilizador Oficial no Auth
  const { data: authData, error: authError } = await adminAuthClient.auth.admin.createUser({
    email: email,
    password: pin + "KORE!", // Senha temporária baseada no PIN (o ideal é pedir ao user para criar)
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: "client",
    },
  });

  if (authError || !authData.user) {
    console.error("Erro ao criar Auth User:", authError);
    throw new Error("Erro ao criar a sua conta de acesso.");
  }

  // 3. Atualiza o Profile conectando o auth_user_id e anulando o PIN
  const { error: updateError } = await adminAuthClient
    .from("profiles")
    .update({
      auth_user_id: authData.user.id,
      activation_pin: null, // Anula o PIN para evitar reuso
    })
    .eq("id", profile.id);

  if (updateError) {
    console.error("Erro ao vincular Shadow Profile:", updateError);
    // Idealmente faria rollback no Auth, mas loga por agora
    throw new Error("Conta criada, mas ocorreu um erro no vínculo.");
  }

  return { success: true, message: "Conta ativada com sucesso!" };
}
