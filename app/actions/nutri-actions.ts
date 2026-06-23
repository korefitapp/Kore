"use server";

import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function linkExistingPatientToNutri(email: string): Promise<{ success: boolean, message: string }> {
  try {
    const supabaseClient = createSupabaseServerClient();
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) return { success: false, message: "Não autenticado." };

    console.log('[LINK PACIENTE] Iniciando busca pelo e-mail:', email);

    // 1. Instanciação Absoluta do Admin (Service Role)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Passo A: Procurar o utilizador no próprio sistema de Auth
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('[LINK PACIENTE] Erro ao listar utilizadores no Auth:', authError.message);
      return { success: false, message: "Erro interno na busca de utilizadores." };
    }

    const authProfile = authUsers.users.find(u => u.email === email);

    // Passo B: Se não encontrar no Auth, falha
    if (!authProfile) {
      console.log('[LINK PACIENTE] Falha: E-mail não existe no Auth');
      return { success: false, message: "E-mail não registado na plataforma. Utilize a aba 'Cadastrar Novo'." };
    }

    const authId = authProfile.id;
    console.log('[LINK PACIENTE] E-mail encontrado no Auth. ID:', authId);

    // Passo C: Procurar na tabela profiles usando o authId
    const { data: profile, error: searchError } = await supabaseAdmin
      .from("profiles")
      .select("id, nutritionist_id")
      .eq("id", authId)
      .maybeSingle();

    let profileId = authId;

    // Passo D
    if (profile) {
      if (profile.nutritionist_id && profile.nutritionist_id !== null) { 
        if (String(profile.nutritionist_id) === String(user.id)) {
          return { success: false, message: "Este paciente já está na sua lista." };
        } else {
          return { success: false, message: "Este paciente já está vinculado a outra Nutricionista no KORE." };
        }
      }

      // Cenário 1: O perfil público existe. UPDATE cirúrgico
      console.log('[LINK PACIENTE] Perfil público encontrado. Atualizando nutritionist_id...');
      await supabaseAdmin
        .from("profiles")
        .update({ nutritionist_id: user.id })
        .eq("id", authId);
    } else {
      // Cenário 2: O perfil público não existe. INSERT
      console.log('[LINK PACIENTE] Perfil público não existe. Criando novo perfil...');
      
      const fallbackName = authProfile.user_metadata?.full_name || authProfile.user_metadata?.name || 'Paciente (Nome Pendente)';
      
      const { error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: authId,
          full_name: fallbackName,
          role: 'client',
          nutritionist_id: user.id
        });
      
      if (insertError) {
        console.error('[LINK PACIENTE] Falha no INSERT:', insertError.message, insertError.details, insertError.hint);
        return { success: false, message: "Ocorreu um erro ao vincular o paciente. Tente novamente." };
      }
    }

    // Verificar se já existe vínculo na tabela professional_clients
    const { data: existingLink } = await supabaseClient
      .from("professional_clients")
      .select("id")
      .eq("professional_id", user.id)
      .eq("client_id", profileId)
      .maybeSingle();

    if (existingLink) {
      return { success: false, message: "Este paciente já está na sua lista." };
    }

    // Inserir vínculo
    const { error: linkError } = await supabaseClient
      .from("professional_clients")
      .insert({
        professional_id: user.id,
        client_id: profileId,
        status: "active"
      });

    if (linkError) {
      console.error('[LINK PACIENTE] Erro ao criar vínculo:', linkError.message);
      return { success: false, message: "Erro ao vincular paciente na sua lista." };
    }

    console.log('[LINK PACIENTE] Sucesso! Paciente vinculado.');

    revalidatePath("/dashboard/nutri");
    revalidatePath("/dashboard/nutri/patients");
    return { success: true, message: "Paciente vinculado com sucesso!" };
  } catch (error: any) {
    console.error("[LINK PACIENTE ERRO SQL]:", error.message || error);
    return { success: false, message: "Ocorreu um erro ao vincular o paciente. Tente novamente." };
  }
}

export async function createPatient(formData: FormData) {
  const supabaseClient = createSupabaseServerClient();
  const { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    throw new Error("Não autenticado");
  }

  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const birth_date = formData.get("birth_date") as string;
  const gender = formData.get("gender") as string;
  const heightStr = formData.get("height") as string;
  const weightStr = formData.get("weight") as string;
  const targetWeightStr = formData.get("target_weight") as string;
  const bodyFatStr = formData.get("body_fat") as string;
  const targetBodyFatStr = formData.get("target_body_fat") as string;
  const goal = formData.get("goal") as string;
  const training_frequency = formData.get("training_frequency") as string;
  const dietary_restrictions = formData.get("dietary_restrictions") as string;
  const waterGoalStr = formData.get("water_goal") as string;

  const profileUpdates = {
    phone,
    birth_date: birth_date || null,
    gender: gender || null,
    height: heightStr ? parseFloat(heightStr) : null,
    weight: weightStr ? parseFloat(weightStr) : null,
    target_weight: targetWeightStr ? parseFloat(targetWeightStr) : null,
    body_fat: bodyFatStr ? parseFloat(bodyFatStr) : null,
    target_body_fat: targetBodyFatStr ? parseFloat(targetBodyFatStr) : null,
    training_frequency: training_frequency || null,
    dietary_restrictions: dietary_restrictions || null,
    water_goal: waterGoalStr ? parseFloat(waterGoalStr) : null,
  };

  // Usa a chave Service Role (Admin) para interagir com Auth sem deslogar
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

  // 1. Verificação Prévia (Busca no Auth)
  const { data: usersData } = await adminAuthClient.auth.admin.listUsers();
  const existingAuthUser = usersData?.users.find(u => u.email === email);

  if (existingAuthUser) {
    // Cenário B: E-mail já existe no banco
    const { data: existingProfile } = await adminAuthClient
      .from("profiles")
      .select("id, metadata")
      .eq("id", existingAuthUser.id)
      .single();

    if (existingProfile) {
      const nutriId = existingProfile.metadata?.nutritionist_id;
      if (nutriId && nutriId !== user.id) {
        throw new Error("Este usuário já possui um acompanhamento nutricional ativo no sistema.");
      }
      if (nutriId === user.id) {
        throw new Error("Este usuário já é seu paciente.");
      }
    }

    // Se NÃO tem nutri (Agente Livre): Atualiza o perfil existente vinculando
    const newMetadata = {
      ...(existingProfile?.metadata || {}),
      fitness_goal: goal,
      nutritionist_id: user.id,
    };

    const { error: updateError } = await adminAuthClient
      .from("profiles")
      .update({
        ...profileUpdates,
        metadata: newMetadata
      })
      .eq("id", existingAuthUser.id);

    if (updateError) {
      throw new Error("Erro ao vincular paciente existente: " + updateError.message);
    }

    // Vincula na tabela professional_clients
    await adminAuthClient.from("professional_clients").upsert({
      professional_id: user.id,
      client_id: existingAuthUser.id,
      status: "active",
    }, { onConflict: "professional_id,client_id" });

    revalidatePath("/dashboard/nutri");
    revalidatePath("/dashboard/nutri/patients");
    return { status: "linked", message: "Paciente vinculado com sucesso!" };
  }

  // Cenário A: Cria a conta de paciente como "Shadow Profile"
  // Gera PIN de ativação seguro (ex: KORE-X7B9)
  const activationPin = "KORE-" + Math.random().toString(36).substring(2, 6).toUpperCase();
  const pinExpiresAt = new Date();
  pinExpiresAt.setDate(pinExpiresAt.getDate() + 7); // 7 dias

  const { data: newProfile, error: insertError } = await adminAuthClient
    .from("profiles")
    .insert({
      full_name: fullName,
      phone: phone,
      ...profileUpdates,
      metadata: { fitness_goal: goal, nutritionist_id: user.id },
      activation_pin: activationPin,
      pin_expires_at: pinExpiresAt.toISOString(),
      status: "active",
    })
    .select("id")
    .single();

  if (insertError || !newProfile) {
    console.error("Erro ao criar shadow profile do paciente:", insertError);
    throw new Error("Erro ao criar paciente: " + insertError?.message);
  }

  // Vincula na tabela professional_clients
  await adminAuthClient.from("professional_clients").insert({
    professional_id: user.id,
    client_id: newProfile.id,
    status: "active",
  });

  // Gatilho WhatsApp (Exemplo Genérico usando fetch)
  if (process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_TOKEN) {
    try {
      const message = `Olá ${fullName}! Seu plano alimentar está pronto no aplicativo KORE. Baixe o app e ative sua conta usando o código: *${activationPin}*`;
      await fetch(process.env.WHATSAPP_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.WHATSAPP_API_TOKEN}`
        },
        body: JSON.stringify({
          phone: phone,
          message: message
        })
      });
    } catch (waError) {
      console.error("Erro ao enviar WhatsApp:", waError);
      // Não bloqueia o sucesso da criação do paciente se o WhatsApp falhar
    }
  }

  revalidatePath("/dashboard/nutri");
  revalidatePath("/dashboard/nutri/patients");
  return { status: "created", message: "Paciente cadastrado com sucesso!" };
}

export async function createAppointment(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Não autenticado");
  }

  const patientId = formData.get("patient_id") as string;
  const modality = formData.get("modality") as string;
  const focus = formData.get("focus") as string;
  const dateStr = formData.get("date") as string; // YYYY-MM-DD
  const timeStr = formData.get("time") as string; // HH:mm
  const durationStr = formData.get("duration") as string; // min

  if (!patientId || !dateStr || !timeStr || !durationStr) {
    throw new Error("Campos obrigatórios faltando");
  }

  const startTime = new Date(`${dateStr}T${timeStr}:00`);
  const durationMs = parseInt(durationStr, 10) * 60000;
  const endTime = new Date(startTime.getTime() + durationMs);

  const { error } = await supabase.from("appointments").insert({
    professional_id: user.id,
    client_id: patientId,
    title: focus || "Consulta",
    modality: modality || "presencial",
    focus: focus || "",
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    status: "pendente",
  });

  if (error) {
    console.error("Erro ao criar consulta:", error);
    throw new Error("Falha ao criar consulta: " + error.message);
  }

  revalidatePath("/dashboard/nutri");
  revalidatePath("/dashboard/nutri/appointments");
  
  return { success: true };
}

export async function createMealPlan(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autenticado");

  const title = formData.get("title") as string;
  const patientId = formData.get("patientId") as string;
  const is_template = formData.get("is_template") === "true";
  const objective = formData.get("objective") as string;
  const daily_kcal_goal = formData.get("daily_kcal_goal") as string;
  const templateId = formData.get("templateId") as string;

  if (!title) throw new Error("Nome do cardápio é obrigatório");
  if (!patientId) throw new Error("Selecione um paciente");

  const { data: newPlan, error } = await supabase
    .from("meal_plans")
    .insert({
      nutritionist_id: user.id,
      patient_id: patientId || null,
      title: title,
      is_template: is_template,
      objective: objective || null,
      daily_kcal_goal: daily_kcal_goal ? parseFloat(daily_kcal_goal) : null,
    })
    .select("id")
    .single();

  if (error || !newPlan) {
    console.error("Erro ao criar cardápio:", error);
    throw new Error("Erro ao criar o cardápio no banco.");
  }

  if (templateId) {
    const { data: originalMeals } = await supabase
      .from("meals")
      .select("id, name, time")
      .eq("meal_plan_id", templateId);
      
    if (originalMeals && originalMeals.length > 0) {
      for (const meal of originalMeals) {
        const { data: newMeal } = await supabase
          .from("meals")
          .insert({
            meal_plan_id: newPlan.id,
            name: meal.name,
            time: meal.time
          })
          .select("id")
          .single();
          
        if (newMeal) {
          const { data: items } = await supabase
            .from("meal_items")
            .select("*")
            .eq("meal_id", meal.id);
            
          if (items && items.length > 0) {
            const newItems = items.map(item => ({
              meal_id: newMeal.id,
              food_id: item.food_id,
              food_name: item.food_name,
              quantity_g: item.quantity_g,
              kcal: item.kcal,
              protein_g: item.protein_g,
              carbs_g: item.carbs_g,
              fat_g: item.fat_g,
              // Mantemos fallback de colunas antigas por segurança:
              quantity: item.quantity,
              calories: item.calories
            }));
            await supabase.from("meal_items").insert(newItems);
          }
        }
      }
    }
  }

  revalidatePath("/dashboard/nutri");
  revalidatePath("/dashboard/nutri/patients/[id]", "page");
  
  return newPlan.id;
}

export async function getNutriTemplates() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Busca todos os cardápios (marcados como template do nutri ou globais)
  const { data } = await adminClient
    .from("meal_plans")
    .select("id, title, objective, daily_kcal_goal, is_template, is_global_template")
    .or(`nutritionist_id.eq.${user.id},is_global_template.eq.true`)
    .eq("is_template", true)
    .order("created_at", { ascending: false });

  return data || [];
}

export async function saveMealBuilderGraph(planId: string, meals: any[], planTotals: any, isTemplate: boolean) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  // 1. Apaga as refeições antigas desse plano (em cascata, os items serão apagados)
  await supabase.from("meals").delete().eq("meal_plan_id", planId);

  // 2. Insere as novas refeições
  for (let i = 0; i < meals.length; i++) {
    const meal = meals[i];
    const { data: newMeal, error: mealError } = await supabase
      .from("meals")
      .insert({
        meal_plan_id: planId,
        name: meal.name,
        time: meal.time
      })
      .select("id")
      .single();

    if (mealError) throw new Error("Erro ao salvar refeição.");

    // 3. Insere os itens dessa refeição
    if (meal.items && meal.items.length > 0) {
      const itemsToInsert = meal.items.map((item: any) => ({
        meal_id: newMeal.id,
        food_id: item.food_id,
        food_name: item.food_name,
        quantity_g: item.quantity_g,
        kcal: item.kcal,
        protein_g: item.protein_g,
        carbs_g: item.carbs_g,
        fat_g: item.fat_g
      }));
      
      const { error: itemsError } = await supabase.from("meal_items").insert(itemsToInsert);
      if (itemsError) throw new Error("Erro ao salvar alimentos.");
    }
  }

  // 4. Atualiza os totais e is_template no meal_plan pai
  await supabase.from("meal_plans").update({
    daily_kcal_goal: planTotals.kcal,
    protein_g: planTotals.protein,
    carbs_g: planTotals.carbs,
    fat_g: planTotals.fat,
    is_template: isTemplate
  }).eq("id", planId);

  // 5. Notificações In-App & WhatsApp
  const { data: plan } = await supabase.from("meal_plans").select("patient_id").eq("id", planId).single();
  const patientId = plan?.patient_id;

  if (patientId && !isTemplate) {
    const { data: nutri } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
    const nutriName = nutri?.full_name || 'Sua Nutri';

    const { data: student } = await supabase.from('profiles').select('full_name, phone').eq('id', patientId).single();
    const studentName = student?.full_name || "Paciente";
    const studentPhone = student?.phone;

    await supabase.from("notifications").insert({
      user_id: patientId,
      title: "Novo Cardápio!",
      message: `${nutriName} atualizou o seu plano alimentar.`,
      type: "diet_update"
    });

    if (studentPhone) {
      try {
        const text = `Olá *${studentName}*! 🍏 O seu novo plano alimentar elaborado por *${nutriName}* já está atualizado e disponível no app KORE. Qualquer dúvida, é só chamar aqui!`;
        const { sendWhatsAppMessage } = await import("@/app/actions/whatsapp-actions");
        await sendWhatsAppMessage(patientId, studentPhone, text);
      } catch (waError: any) {
        console.error("Aviso: Falha ao enviar notificação via WhatsApp:", waError.message);
      }
    }
  }

  revalidatePath("/dashboard/nutri/meal-plans");
  revalidatePath(`/dashboard/nutri/meal-plans/${planId}/builder`);
  
  return { success: true };
}

export async function searchFoods(query: string) {
  const supabase = createSupabaseServerClient();
  
  // Exemplo de busca full text ou like. O Supabase suporta .ilike()
  const { data } = await supabase
    .from("foods")
    .select("id, name, kcal, protein_g, carbs_g, fat_g, base_amount, popularity")
    .ilike("name", `%${query}%`)
    .order("popularity", { ascending: false, nullsFirst: false })
    .limit(20);

  return data || [];
}

export async function getNutriPatients() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data } = await adminClient
    .from("profiles")
    .select("id, full_name, display_name, weight, height, metadata")
    .eq("metadata->>nutritionist_id", user.id)
    .order("full_name");

  return data || [];
}

export async function updatePatientProfile(patientId: string, formData: FormData) {
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const phone = formData.get("phone") as string;
  const goal = formData.get("goal") as string;
  const weight = formData.get("weight") as string;
  const height = formData.get("height") as string;

  const birth_date = formData.get("birth_date") as string;
  const gender = formData.get("gender") as string;
  const goal_weight = formData.get("goal_weight") as string;
  const body_fat_percentage = formData.get("body_fat_percentage") as string;
  const goal_body_fat = formData.get("goal_body_fat") as string;
  const training_frequency = formData.get("training_frequency") as string;
  const dietary_restrictions = formData.get("dietary_restrictions") as string;
  const water_goal = formData.get("water_goal") as string;

  const { data: existingProfile } = await adminClient
    .from("profiles")
    .select("metadata")
    .eq("id", patientId)
    .single();

  const newMetadata = {
    ...(existingProfile?.metadata || {}),
    fitness_goal: goal,
    birth_date,
    gender,
    goal_weight: goal_weight ? parseFloat(goal_weight) : null,
    body_fat_percentage: body_fat_percentage ? parseFloat(body_fat_percentage) : null,
    goal_body_fat: goal_body_fat ? parseFloat(goal_body_fat) : null,
    training_frequency,
    dietary_restrictions,
    water_goal: water_goal ? parseFloat(water_goal) : null,
  };

  const { error } = await adminClient
    .from("profiles")
    .update({
      phone: phone,
      weight: weight ? parseFloat(weight) : null,
      height: height ? parseFloat(height) : null,
      metadata: newMetadata,
    })
    .eq("id", patientId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/nutri/patients");
  revalidatePath(`/dashboard/nutri/patients/${patientId}`);
  return { success: true };
}

export async function createMeal(planId: string, name: string, time: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("meals")
    .insert({ meal_plan_id: planId, name, time })
    .select()
    .single();
  if (error) throw new Error("Erro ao criar refeição");
  revalidatePath(`/dashboard/nutri/meal-plans/${planId}/builder`);
  return data;
}

export async function createMealItem(mealId: string, foodName: string, quantity: string, calories: number, planId: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("meal_items")
    .insert({ meal_id: mealId, food_name: foodName, quantity, calories })
    .select()
    .single();
  if (error) throw new Error("Erro ao adicionar alimento");
  revalidatePath(`/dashboard/nutri/meal-plans/${planId}/builder`);
  return data;
}

export async function cloneGlobalTemplate(templateId: string) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autenticado");

  // Busca o template original (global ou não, mas focado no global)
  const { data: template, error: templateError } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("id", templateId)
    .single();

  if (templateError || !template) {
    throw new Error("Erro ao buscar o modelo original.");
  }

  // Cria um novo cardápio como propriedade do Nutri
  const { data: newPlan, error: insertError } = await supabase
    .from("meal_plans")
    .insert({
      nutritionist_id: user.id,
      patient_id: null,
      title: `${template.title} (Cópia)`,
      description: template.description,
      daily_kcal_goal: template.daily_kcal_goal,
      carbs_g: template.carbs_g,
      protein_g: template.protein_g,
      fat_g: template.fat_g,
      objective: template.objective,
      meals_count: template.meals_count,
      is_template: true, // vira um modelo pessoal
      is_global_template: false, // DEIXA de ser global
    })
    .select("id")
    .single();

  if (insertError || !newPlan) {
    console.error("Erro ao duplicar:", insertError);
    throw new Error("Erro ao duplicar o modelo.");
  }

  // Clona as refeições se houver
  const { data: originalMeals } = await supabase
    .from("meals")
    .select("*")
    .eq("meal_plan_id", template.id);

  if (originalMeals && originalMeals.length > 0) {
    for (const meal of originalMeals) {
      const { data: newMeal } = await supabase
        .from("meals")
        .insert({
          meal_plan_id: newPlan.id,
          name: meal.name,
          time: meal.time
        })
        .select("id")
        .single();
        
      if (newMeal) {
        const { data: items } = await supabase
          .from("meal_items")
          .select("*")
          .eq("meal_id", meal.id);
          
        if (items && items.length > 0) {
          const itemsToInsert = items.map(item => ({
            meal_id: newMeal.id,
            food_id: item.food_id,
            food_name: item.food_name,
            quantity_g: item.quantity_g,
            kcal: item.kcal,
            protein_g: item.protein_g,
            carbs_g: item.carbs_g,
            fat_g: item.fat_g
          }));
          await supabase.from("meal_items").insert(itemsToInsert);
        }
      }
    }
  }

  revalidatePath("/dashboard/nutri/meal-plans");
  return newPlan.id;
}

export async function deleteMealPlan(planId: string) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { error } = await supabase
    .from("meal_plans")
    .delete()
    .eq("id", planId)
    .eq("nutritionist_id", user.id);

  if (error) {
    console.error("Erro ao excluir cardápio:", error);
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/nutri/meal-plans");
  return { success: true };
}

export async function createFood(foodData: {
  name: string;
  base_amount: number;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  locale?: string;
}) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  // Força o created_by a ser o ID da nutricionista
  const { data, error } = await supabase.from("foods").insert({
    ...foodData,
    locale: foodData.locale || "pt-BR",
    created_by: user.id, // Segurança
    popularity: 0
  }).select().single();

  if (error) {
    console.error("Erro ao criar alimento:", error);
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/nutri/food-database");
  return data;
}

export async function assignMealPlanToPatient(planId: string, patientId: string) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  // 1. Buscar o modelo original
  const { data: template, error: templateError } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("id", planId)
    .single();

  if (templateError || !template) throw new Error("Erro ao buscar o modelo original.");

  // 2. Buscar o nome do paciente para título inteligente
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  
  const { data: patientProfile } = await adminClient
    .from("profiles")
    .select("full_name, display_name")
    .eq("id", patientId)
    .single();

  let patientFirstName = "Paciente";
  if (patientProfile) {
    const fullName = patientProfile.full_name || patientProfile.display_name || "Paciente";
    patientFirstName = fullName.split(" ")[0];
  }

  // Título inteligente
  const newTitle = template.title.startsWith("KORE") 
    ? template.title.replace("KORE", patientFirstName) 
    : `${template.title} (Atribuído a ${patientFirstName})`;

  // 3. Criar o novo plano base
  const { data: newPlan, error: insertError } = await supabase
    .from("meal_plans")
    .insert({
      nutritionist_id: user.id,
      patient_id: patientId,
      title: newTitle,
      description: template.description,
      daily_kcal_goal: template.daily_kcal_goal,
      carbs_g: template.carbs_g,
      protein_g: template.protein_g,
      fat_g: template.fat_g,
      objective: template.objective,
      meals_count: template.meals_count,
      is_template: false,
      is_global_template: false,
    })
    .select("*")
    .single();

  if (insertError || !newPlan) throw new Error("Erro ao atribuir o modelo base.");

  // 4. Clonagem Profunda: Buscar Meals originais
  const { data: originalMeals } = await supabase
    .from("meals")
    .select("*")
    .eq("meal_plan_id", template.id);

  if (originalMeals && originalMeals.length > 0) {
    for (const meal of originalMeals) {
      // Inserir a cópia da meal
      const { data: newMeal } = await supabase
        .from("meals")
        .insert({
          meal_plan_id: newPlan.id,
          name: meal.name,
          time: meal.time
        })
        .select("id")
        .single();

      if (newMeal) {
        // Clonagem Profunda: Buscar Meal Items originais
        const { data: items } = await supabase
          .from("meal_items")
          .select("*")
          .eq("meal_id", meal.id);

        if (items && items.length > 0) {
          const itemsToInsert = items.map(item => ({
            meal_id: newMeal.id,
            food_id: item.food_id,
            food_name: item.food_name,
            quantity_g: item.quantity_g,
            kcal: item.kcal,
            protein_g: item.protein_g,
            carbs_g: item.carbs_g,
            fat_g: item.fat_g
          }));
          if (itemsToInsert.length > 0) {
            const { error: itemsError } = await supabase.from("meal_items").insert(itemsToInsert);
            if (itemsError) {
              console.error("Erro ao clonar meal_items:", itemsError);
              throw new Error("Erro ao clonar alimentos.");
            }
          }
        }
      }
    }
  }

  // RECALCULAR MACROS REAIS DA NOVA DIETA CLONADA
  await recalculateMealPlanMacros(newPlan.id);

  revalidatePath("/dashboard/nutri/meal-plans");
  revalidatePath(`/dashboard/nutri/patients/${patientId}`);
  return newPlan; // Retorna o objeto completo para a UI
}

export async function recalculateMealPlanMacros(planId: string) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  // 1. Puxar todos os meal_items deste planId (através das meals)
  const { data: meals, error: mealsError } = await supabase
    .from("meals")
    .select("id, meal_items(*)")
    .eq("meal_plan_id", planId);

  if (mealsError) {
    console.error("Erro ao buscar meals para recálculo:", mealsError);
    return;
  }

  let totalKcal = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  for (const meal of meals) {
    if (meal.meal_items) {
      for (const item of meal.meal_items) {
        // Usa os valores da própria meal_items. 
        totalKcal += Number(item.kcal || 0);
        totalProtein += Number(item.protein_g || 0);
        totalCarbs += Number(item.carbs_g || 0);
        totalFat += Number(item.fat_g || 0);
      }
    }
  }

  // 2. Atualizar o meal_plan pai
  const { error: updateError } = await supabase
    .from("meal_plans")
    .update({
      daily_kcal_goal: Math.round(totalKcal),
      protein_g: Math.round(totalProtein),
      carbs_g: Math.round(totalCarbs),
      fat_g: Math.round(totalFat)
    })
    .eq("id", planId);

  if (updateError) {
    console.error("Erro ao atualizar macros do meal_plan:", updateError);
  }
}

export async function getMealPlanBuilderData(planId: string) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("meals")
    .select("*, items:meal_items(*)")
    .eq("meal_plan_id", planId)
    .order("time", { ascending: true });

  if (error) {
    console.error("Erro ao buscar meals:", error);
    return [];
  }
  return data || [];
}

export async function searchFoodBank(query: string) {
  if (!query || query.length < 2) return [];
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("foods")
    .select("id, name, base_amount, kcal, protein_g, carbs_g, fat_g")
    .eq("locale", "pt-BR")
    .ilike("name", `%${query}%`)
    .order("popularity", { ascending: false })
    .order("name", { ascending: true })
    .limit(15);
  
  // Mapeia base_amount para serving_size apenas para compatibilidade com o frontend atual, 
  // se o frontend já estiver usando serving_size.
  return (data || []).map(item => ({
    ...item,
    serving_size: item.base_amount
  }));
}

export async function saveMealPlanBuilder(planId: string, meals: any[], macros: any) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  // 1. Verificar se o plan pertence ao nutricionista
  const { data: plan } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("id", planId)
    .eq("nutritionist_id", user.id)
    .single();

  if (!plan) throw new Error("Cardápio não encontrado ou sem permissão.");

  // 2. Apagar refeições antigas (cascade apagará os items)
  await supabase.from("meals").delete().eq("meal_plan_id", planId);

  // 3. Inserir novas refeições
  if (meals.length > 0) {
    for (const meal of meals) {
      const { data: newMeal, error: mealErr } = await supabase
        .from("meals")
        .insert({
          meal_plan_id: planId,
          name: meal.name,
          time: meal.time
        })
        .select("id")
        .single();

      if (newMeal && meal.items && meal.items.length > 0) {
        const itemsToInsert = meal.items.map((item: any) => ({
          meal_id: newMeal.id,
          food_id: item.food_id || null,
          food_name: item.food_name,
          quantity_g: item.quantity_g,
          kcal: item.kcal,
          protein_g: item.protein_g,
          carbs_g: item.carbs_g,
          fat_g: item.fat_g
        }));
        await supabase.from("meal_items").insert(itemsToInsert);
      }
    }
  }

  // 4. Atualizar os macros no meal_plan
  await supabase
    .from("meal_plans")
    .update({
      daily_kcal_goal: macros.kcal,
      carbs_g: macros.carbs_g,
      protein_g: macros.protein_g,
      fat_g: macros.fat_g,
      meals_count: meals.length
    })
    .eq("id", planId);

  // 5. Notificações In-App & WhatsApp
  const { data: planToNotify } = await supabase.from("meal_plans").select("patient_id, is_template").eq("id", planId).single();
  const notifyPatientId = planToNotify?.patient_id;
  const isNotifyTemplate = planToNotify?.is_template;

  if (notifyPatientId && !isNotifyTemplate) {
    const { data: nutri } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
    const nutriName = nutri?.full_name || 'Sua Nutri';

    const { data: student } = await supabase.from('profiles').select('full_name, phone').eq('id', notifyPatientId).single();
    const studentName = student?.full_name || "Paciente";
    const studentPhone = student?.phone;

    await supabase.from("notifications").insert({
      user_id: notifyPatientId,
      title: "Novo Cardápio!",
      message: `${nutriName} atualizou o seu plano alimentar.`,
      type: "diet_update"
    });

    if (studentPhone) {
      try {
        const text = `Olá *${studentName}*! 🍏 O seu novo plano alimentar elaborado por *${nutriName}* já está atualizado e disponível no app KORE. Qualquer dúvida, é só chamar aqui!`;
        const { sendWhatsAppMessage } = await import("@/app/actions/whatsapp-actions");
        await sendWhatsAppMessage(notifyPatientId, studentPhone, text);
      } catch (waError: any) {
        console.error("Aviso: Falha ao enviar notificação via WhatsApp:", waError.message);
      }
    }
  }

  revalidatePath("/dashboard/nutri/meal-plans");
}

export async function deletePatient(patientId: string) {
  const supabaseClient = createSupabaseServerClient();
  const { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    throw new Error("Não autenticado");
  }

  const adminAuthClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Excluir a relação no professional_clients
  const { error: relError } = await adminAuthClient
    .from("professional_clients")
    .delete()
    .eq("professional_id", user.id)
    .eq("client_id", patientId);

  if (relError) throw new Error("Erro ao excluir vínculo: " + relError.message);

  // Desvincular do nutritionist_id para evitar exclusão acidental da conta
  await adminAuthClient.from("profiles").update({ metadata: {} }).eq("id", patientId);

  revalidatePath("/dashboard/nutri");
  revalidatePath("/dashboard/nutri/patients");
  return { success: true };
}

export async function getWalletBalance() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Não autorizado");
  }

  // Tenta buscar a carteira
  const { data: wallet, error } = await supabase
    .from("wallets")
    .select("available_balance, pending_balance, stripe_account_id, mp_access_token")
    .eq("professional_id", user.id)
    .single();

  if (error && error.code === "PGRST116") {
    // Carteira não encontrada (PGRST116: JSON object requested, multiple (or no) rows returned)
    // Lazy Initialization: criar a carteira zerada silenciosamente
    const { data: newWallet, error: insertError } = await supabase
      .from("wallets")
      .insert({
        professional_id: user.id,
        available_balance: 0,
        pending_balance: 0
      })
      .select("available_balance, pending_balance, stripe_account_id, mp_access_token")
      .single();

    if (insertError) {
      console.error("Erro ao realizar lazy initialization da carteira:", insertError);
      return { available_balance: 0, pending_balance: 0, stripe_account_id: null, mp_access_token: null };
    }

    return newWallet;
  }

  return wallet || { available_balance: 0, pending_balance: 0, stripe_account_id: null, mp_access_token: null };
}

export async function requestPixWithdrawal(amount: number, pixKey: string) {
  const supabaseClient = createSupabaseServerClient();
  const { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    throw new Error("Não autorizado");
  }

  // Validação prévia de saldo na Server Action usando nossa nova função de Lazy Init
  const currentWallet = await getWalletBalance();
  if (amount > currentWallet.available_balance) {
    throw new Error("Saldo insuficiente para efetuar o saque.");
  }

  // Chamar RPC request_pix_withdrawal para executar como transação segura no banco de dados
  const { data, error } = await supabaseClient.rpc("request_pix_withdrawal", {
    p_amount: amount,
    p_pix_key: pixKey,
  });

  if (error) {
    console.error("Withdrawal error:", error);
    throw new Error(error.message || "Erro ao solicitar saque");
  }

  revalidatePath("/dashboard/nutri/settings/payments");
  return data;
}
