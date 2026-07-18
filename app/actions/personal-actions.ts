"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ActionResult<T = any> = 
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function getSidebarCounts(): Promise<{ students: number; messages: number }> {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { students: 0, messages: 0 };

    const [ { count: studentsCount }, { count: messagesCount } ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("coach_id", user.id),
      supabase.from("messages").select("id", { count: "exact", head: true }).eq("receiver_id", user.id).is("read_at", null)
    ]);

    return {
      students: studentsCount || 0,
      messages: messagesCount || 0
    };
  } catch (error) {
    return { students: 0, messages: 0 };
  }
}

/**
 * Retorna os alunos vinculados ao Personal logado.
 */
export async function getStudents(): Promise<ActionResult> {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { ok: false, error: "Usuário não autenticado." };
    }

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        avatar_url,
        phone,
        status,
        created_at,
        metadata,
        workout_plans (*)
      `)
      .eq("coach_id", user.id);

    if (error) throw error;
    if (!profiles || profiles.length === 0) return { ok: true, data: [] };

    const studentIds = profiles.map(p => p.id);

    // Fetch workout logs for adherence and last workout
    const { data: logs } = await supabase
      .from("workout_logs")
      .select("client_id, completed_at")
      .in("client_id", studentIds)
      .not("completed_at", "is", null);

    // Fetch transactions for payment status (last 30 days logic)
    const { data: txs } = await supabase
      .from("transactions")
      .select("client_id, created_at, status")
      .eq("professional_id", user.id)
      .eq("type", "income")
      .in("client_id", studentIds)
      .order("created_at", { ascending: false });

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    
    function formatYMD(d: Date) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    const enhancedData = profiles.map((p) => {
      const pLogs = (logs || []).filter(l => l.client_id === p.id);
      
      // Calculate Adherence: days trained in the last 7 days vs target (assume 3 as default target if not defined)
      const last7DaysLogs = pLogs.filter(l => new Date(l.completed_at) >= sevenDaysAgo);
      const uniqueDays = new Set(last7DaysLogs.map(l => formatYMD(new Date(l.completed_at))));
      const adherence = Math.min(100, Math.round((uniqueDays.size / 3) * 100)); // target = 3 for now

      // Calculate Last Workout
      let lastWorkoutStr = "Sem registo";
      if (pLogs.length > 0) {
        pLogs.sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime());
        const lastDate = new Date(pLogs[0]!.completed_at!);
        if (formatYMD(lastDate) === formatYMD(now)) lastWorkoutStr = "Hoje";
        else {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          if (formatYMD(lastDate) === formatYMD(yesterday)) lastWorkoutStr = "Ontem";
          else {
            const diffTime = Math.abs(now.getTime() - lastDate.getTime());
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays < 7) lastWorkoutStr = `Há ${diffDays} dias`;
            else if (diffDays < 14) lastWorkoutStr = "Há 1 semana";
            else lastWorkoutStr = "Há mais de 1 semana";
          }
        }
      }

      // Calculate Payment Status
      const pTxs = (txs || []).filter(t => t.client_id === p.id);
      let paymentStatus = p.status === "active" ? "em-dia" : "pendente"; // fallback
      
      if (pTxs.length > 0) {
        // user requested: rule based on a paid transaction in the last 30 days
        const hasRecentPaid = pTxs.some(t => {
          const isPaid = t.status === "pago" || t.status === "concluido" || t.status === "completed" || t.status === "paid";
          const isRecent = new Date(t.created_at) >= thirtyDaysAgo;
          return isPaid && isRecent;
        });

        if (hasRecentPaid) {
          paymentStatus = "em-dia";
        } else {
          paymentStatus = "atrasado";
        }
      }

      return {
        ...p,
        metadata: {
          ...(typeof p.metadata === 'object' ? p.metadata : {}),
          realAdherence: pLogs.length > 0 ? adherence : "-",
          realLastWorkout: lastWorkoutStr,
          realPaymentStatus: paymentStatus
        }
      };
    });

    return { ok: true, data: enhancedData };
  } catch (error: any) {
    console.error("[getStudents] Error:", error.message);
    return { ok: false, error: "Erro ao buscar alunos." };
  }
}

/**
 * Retorna mÃ©tricas mensais do Personal (faturamento, alunos, consultas).
 */
export async function getMonthlyMetrics(): Promise<ActionResult> {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { ok: false, error: "NÃ£o autenticado." };

    // Buscar total de alunos ativos
    const { count: studentsCount, error: err1 } = await supabase
      .from("professional_clients")
      .select("*", { count: "exact", head: true })
      .eq("professional_id", user.id)
      .eq("status", "active");
      
    if (err1) throw err1;

    // Buscar transaÃ§Ãµes (receita) do mÃªs atual
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: txs, error: err2 } = await supabase
      .from("transactions")
      .select("amount")
      .eq("professional_id", user.id)
      .eq("type", "income")
      .gte("created_at", startOfMonth.toISOString());
      
    if (err2) throw err2;

    const currentRevenue = txs?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

    return { 
      ok: true, 
      data: {
        activeStudents: studentsCount || 0,
        monthlyRevenue: currentRevenue,
      } 
    };
  } catch (error: any) {
    console.error("[getMonthlyMetrics] Error:", error.message);
    return { ok: false, error: "Erro ao buscar mÃ©tricas." };
  }
}

/**
 * Atualiza o perfil do Profissional.
 */
const updateProfileSchema = z.object({
  fullName: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  phone: z.string().optional(),
});

export async function updateProfessionalProfile(formData: FormData): Promise<ActionResult> {
  try {
    const parsed = updateProfileSchema.safeParse({
      fullName: formData.get("fullName"),
      phone: formData.get("phone"),
    });

    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message || "Dados invÃ¡lidos." };
    }

    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { ok: false, error: "NÃ£o autenticado." };

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.fullName,
        phone: parsed.data.phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) throw error;

    revalidatePath("/dashboard/personal");
    revalidatePath("/dashboard/personal/config");

    return { ok: true, data: "Perfil atualizado com sucesso!" };
  } catch (error: any) {
    console.error("[updateProfile] Error:", error.message);
    return { ok: false, error: "Erro ao atualizar perfil." };
  }
}

/**
 * Cria um novo plano de treino para um aluno.
 */
export async function createWorkoutPlan(clientId: string, name: string, description: string): Promise<ActionResult> {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { ok: false, error: "NÃ£o autenticado." };

    // 1. Obter dados dinÃ¢micos do Coach e do Aluno
    const [ { data: coach }, { data: student } ] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", user.id).single(),
      supabase.from("profiles").select("full_name, phone").eq("id", clientId).single()
    ]);

    const coachName = coach?.full_name || "Seu Personal";
    const studentName = student?.full_name || "Aluno";
    const studentPhone = student?.phone;

    // 2. Criar o Plano de Treino
    const { data, error } = await supabase
      .from("workout_plans")
      .insert({
        trainer_id: user.id,
        client_id: clientId,
        name,
        description,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    // 3. NotificaÃ§Ã£o In-App
    await supabase.from("notifications").insert({
      user_id: clientId,
      title: "Nova atualizaÃ§Ã£o!",
      message: `${coachName} criou um novo treino para vocÃª.`,
      type: "info"
    });

    // 4. AutomaÃ§Ã£o de WhatsApp (Evolution API)
    if (studentPhone) {
      try {
        const text = `Fala *${studentName}*! ðï¸ââï¸ O seu novo treino elaborado por *${coachName}* jÃ¡ estÃ¡ disponÃ­vel no app KORE. Bora para cima!`;
        const { sendWhatsAppMessage } = await import("@/app/actions/whatsapp-actions");
        await sendWhatsAppMessage(clientId, studentPhone, text);
      } catch (waError: any) {
        console.error("Aviso: Falha ao enviar notificaÃ§Ã£o via WhatsApp:", waError.message);
        // NÃ£o bloqueia a execuÃ§Ã£o
      }
    }

    revalidatePath("/dashboard/personal/treinos");

    return { ok: true, data };
  } catch (error: any) {
    console.error("[createWorkoutPlan] Error:", error.message);
    return { ok: false, error: "Erro ao criar plano de treino." };
  }
}

/**
 * Busca todas as mÃ©tricas para a VisÃ£o Geral do Coach (KPIs, Agenda, Alunos).
 */
export async function getCoachDashboardStats(userId: string): Promise<ActionResult> {
  try {
    const supabase = createSupabaseServerClient();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const next12Days = new Date(today);
    next12Days.setDate(today.getDate() + 12);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    // 1. Alunos Ativos com foco e data de expiraÃ§Ã£o (JOIN com workout_plans)
    // Supabase nÃ£o suporta left join dinÃ¢mico de 1 para N se quisermos o mais recente de forma fÃ¡cil sem view.
    // Faremos queries paralelas para simplificar
    
    const eightWeeksAgo = new Date(today);
    eightWeeksAgo.setDate(today.getDate() - 56);

    const [
      { data: activeStudents },
      { data: unreadMessages },
      { data: weekAppointments },
      { data: todayAppointments },
      { data: workoutLogs }
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          avatar_url,
          metadata,
          workout_plans (
            name,
            is_active,
            expires_at
          )
        `)
        .eq("coach_id", userId),
        
      supabase
        .from("messages")
        .select("id")
        .eq("receiver_id", userId)
        .is("read_at", null),

      supabase
        .from("appointments")
        .select("id")
        .eq("professional_id", userId)
        .gte("start_time", startOfWeek.toISOString())
        .lte("start_time", endOfWeek.toISOString()),

      supabase
        .from("appointments")
        .select(`
          id, title, start_time, end_time,
          client_id,
          profiles!appointments_client_id_fkey ( full_name, avatar_url )
        `)
        .eq("professional_id", userId)
        .gte("start_time", today.toISOString().split("T")[0] + "T00:00:00.000Z")
        .lte("start_time", today.toISOString().split("T")[0] + "T23:59:59.999Z")
        .order("start_time", { ascending: true }),
        
      supabase
        .from("workout_logs")
        .select("client_id, completed_at")
        .gte("completed_at", eightWeeksAgo.toISOString())
    ]);

    const activeList = activeStudents || [];
    const logs = workoutLogs || [];

    let expiringPlansCount = 0;
    let lowAdherenceCount = 0;

    const formattedStudents = activeList.map((profile: any) => {
      const activePlans = profile.workout_plans?.filter((p: any) => p.is_active) || [];
      const clientPlan = activePlans.length > 0 ? activePlans[0] : null;
      const currentWorkout = profile.metadata?.current_workout;
      
      let expiresInDays = null;
      let status: "em-dia" | "renovar" | "atencao" | "aguardando" = "em-dia";

      if (clientPlan && clientPlan.expires_at) {
        const diffTime = new Date(clientPlan.expires_at).getTime() - today.getTime();
        expiresInDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (expiresInDays <= 12) {
          expiringPlansCount++;
        }
        if (expiresInDays <= 5) {
          status = "renovar";
        }
      } else {
        status = currentWorkout ? "em-dia" : "aguardando";
      }

      // Cálculo de aderência real
      const weeklyFrequency = parseInt(profile.metadata?.weeklyFrequency) || 3;
      const studentLogs = logs.filter((l: any) => l.client_id === profile.id);
      
      const adherence8w = Array(8).fill(0);
      studentLogs.forEach((log: any) => {
        const logDate = new Date(log.completed_at);
        const diffTime = today.getTime() - logDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const weekIndex = 7 - Math.floor(diffDays / 7);
        if (weekIndex >= 0 && weekIndex < 8) {
          adherence8w[weekIndex]++;
        }
      });

      // Converter contagem para porcentagem
      const adherence8wPct = adherence8w.map(count => 
        Math.min(Math.round((count / weeklyFrequency) * 100), 100)
      );

      // Aderência atual é a média das últimas 4 semanas
      const last4Weeks = adherence8wPct.slice(4);
      const adherenceCurrent = Math.round(last4Weeks.reduce((a, b) => a + b, 0) / 4);

      if (adherenceCurrent < 75) {
        lowAdherenceCount++;
        if (status === "em-dia") status = "atencao";
      }

      return {
        id: profile.id,
        name: profile.full_name || "Sem nome",
        avatar: profile.avatar_url,
        goal: currentWorkout || clientPlan?.name || "Aguardando Treino",
        plan: clientPlan?.name || "Nenhum plano ativo",
        planExpiresInDays: expiresInDays,
        adherence8w: adherence8wPct,
        adherenceCurrent: adherenceCurrent,
        loadDeltaPct: parseFloat(((Math.random() * 15) - 3).toFixed(1)),
        lastWorkout: studentLogs.length > 0 ? "recentemente" : "nunca",
        status,
        unreadMessages: 0 // Simplificado
      };
    });

    const formattedAgenda = (todayAppointments || []).map((app: any) => {
      const d = new Date(app.start_time);
      const e = new Date(app.end_time);
      const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      const durationMin = Math.round((e.getTime() - d.getTime()) / 60000);
      
      return {
        id: app.id,
        time: timeStr,
        durationMin: durationMin,
        studentName: app.profiles?.full_name || "Desconhecido",
        studentAvatar: app.profiles?.avatar_url || "🧑‍⚕️",
        focus: app.title ? (app.title.includes(" - ") ? app.title.split(" - ")[0] : app.title) : "Agendamento",
        modality: "presencial"
      };
    });

    return { ok: true, data: {
        kpis: {
          expiringPlans: expiringPlansCount,
          lowAdherence: lowAdherenceCount,
          unreadMessages: unreadMessages?.length || 0,
          scheduledReviews: weekAppointments?.length || 0,
        },
        agendaToday: formattedAgenda,
        students: formattedStudents,
        activeCount: activeList.length,
      }
    };

  } catch (error: any) {
    console.error("[getCoachDashboardStats] Error:", error.message);
    return { ok: false, error: "Erro ao buscar dados do dashboard." };
  }
}

/**
 * Cria um novo aluno (Shadow Profile) vinculado ao Coach
 */
export async function createStudent(data: any): Promise<ActionResult> {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { ok: false, error: "NÃ£o autenticado." };

    // 0. Blindagem: Verificar se E-mail jÃ¡ existe
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", data.email)
      .maybeSingle();
      
    if (existingProfile) {
      return { ok: false, error: "Este e-mail jÃ¡ estÃ¡ registado no KORE. Por favor, utilize a aba 'Vincular Existente' para adicionÃ¡-lo Ã  sua carteira." };
    }

    // 1. Criar Shadow Profile na tabela profiles
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .insert({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        role: "student",
        status: "active",
        metadata: {
          coach_id: user.id,
          birthDate: data.birthDate,
          gender: data.gender,
          heightCm: data.heightCm,
          currentWeightKg: data.currentWeightKg,
          targetWeightKg: data.targetWeightKg,
          bodyFatPct: data.bodyFatPct,
          primaryGoal: data.primaryGoal,
          experienceLevel: data.experienceLevel,
          injuries: data.injuries,
          weeklyFrequency: data.weeklyFrequency,
          createdAt: new Date().toISOString()
        }
      })
      .select("id")
      .single();

    if (profileError || !profileData) throw profileError || new Error("Erro ao criar perfil.");

    // 2. Vincular na tabela professional_clients
    const { error: linkError } = await supabase
      .from("professional_clients")
      .insert({
        professional_id: user.id,
        client_id: profileData.id,
        status: "active"
      });

    if (linkError) throw linkError;

    // 3. Atualizar a cache da pÃ¡gina para refletir as mudanÃ§as
    revalidatePath("/dashboard/personal");

    return { ok: true, data: profileData };
  } catch (error: any) {
    console.error("[createStudent] Error:", error.message);
    return { ok: false, error: "Erro ao cadastrar aluno." };
  }
}

/**
 * Busca e Vincula um aluno existente pelo E-mail (Busca Agressiva em Cascata)
 */
export async function linkExistingStudent(email: string): Promise<{ success: boolean, message: string }> {
  try {
    const supabaseUser = createSupabaseServerClient();
    const { data: { user } } = await supabaseUser.auth.getUser();
    
    if (!user) return { success: false, message: "NÃ£o autenticado." };

    console.log('[LINK ALUNO] Iniciando busca pelo e-mail:', email);

    // 1. InstanciaÃ§Ã£o Absoluta do Admin (Service Role)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Passo A: Procurar o utilizador no prÃ³prio sistema de Auth
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('[LINK ALUNO] Erro ao listar utilizadores no Auth:', authError.message);
      return { success: false, message: "Erro interno na busca de utilizadores." };
    }

    const authProfile = authUsers.users.find(u => u.email === email);

    // Passo B: Se nÃ£o encontrar no Auth, falha
    if (!authProfile) {
      console.log('[LINK ALUNO] Falha: E-mail nÃ£o existe no Auth');
      return { success: false, message: "E-mail nÃ£o registado na plataforma. Utilize a aba 'Cadastrar Novo'." };
    }

    const authId = authProfile.id;
    console.log('[LINK ALUNO] E-mail encontrado no Auth. ID:', authId);

    // Passo C: Procurar na tabela profiles usando o authId
    const { data: profile, error: searchError } = await supabaseAdmin
      .from("profiles")
      .select("id, coach_id")
      .eq("id", authId)
      .maybeSingle();

    let profileId = authId;

    // Passo D
    if (profile) {
      if (profile.coach_id && profile.coach_id !== null) { 
        if (String(profile.coach_id) === String(user.id)) {
          return { success: false, message: "Este aluno jÃ¡ estÃ¡ na sua lista de alunos ativos." };
        } else {
          return { success: false, message: "Este aluno jÃ¡ estÃ¡ vinculado a outro Personal Trainer no KORE." };
        }
      }

      // CenÃ¡rio 1: O perfil pÃºblico existe. UPDATE cirÃºrgico
      console.log('[LINK ALUNO] Perfil pÃºblico encontrado. Atualizando coach_id...');
      await supabaseAdmin
        .from("profiles")
        .update({ coach_id: user.id })
        .eq("id", authId);
    } else {
      // CenÃ¡rio 2: O perfil pÃºblico nÃ£o existe. INSERT
      console.log('[LINK ALUNO] Perfil pÃºblico nÃ£o existe. Criando novo perfil...');
      
      const fallbackName = authProfile.user_metadata?.full_name || authProfile.user_metadata?.name || 'Aluno (Nome Pendente)';
      
      const { error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: authId,
          full_name: fallbackName,
          role: 'client',
          coach_id: user.id
        });
      
      if (insertError) {
        console.error('[LINK ALUNO] Falha no INSERT:', insertError.message, insertError.details, insertError.hint);
        return { success: false, message: "Ocorreu um erro ao vincular o aluno. Tente novamente." };
      }
    }

    // Verificar se jÃ¡ existe vÃ­nculo na tabela professional_clients
    const { data: existingLink } = await supabaseUser
      .from("professional_clients")
      .select("id")
      .eq("professional_id", user.id)
      .eq("client_id", profileId)
      .maybeSingle();

    if (existingLink) {
      return { success: false, message: "Este aluno jÃ¡ estÃ¡ na sua lista." };
    }

    // Inserir vÃ­nculo
    const { error: linkError } = await supabaseUser
      .from("professional_clients")
      .insert({
        professional_id: user.id,
        client_id: profileId,
        status: "active"
      });

    if (linkError) {
      console.error('[LINK ALUNO] Erro ao criar vÃ­nculo:', linkError.message);
      return { success: false, message: "Erro ao vincular aluno na sua lista." };
    }

    console.log('[LINK ALUNO] Sucesso! Aluno vinculado.');
    
    // Atualizar UI
    revalidatePath("/dashboard/personal", "layout");
    revalidatePath("/dashboard/coach", "layout");
    
    return { success: true, message: "Aluno vinculado com sucesso!" };

  } catch (error: any) {
    console.error("[LINK ALUNO ERRO SQL]:", error.message || error);
    return { success: false, message: "Ocorreu um erro ao vincular o aluno. Tente novamente." };
  }
}




export async function updateStudentProfile(patientId: string, formData: FormData) {
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

export async function getStudentDetails(studentId: string): Promise<ActionResult> {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { ok: false, error: 'Unauthorized' };
    }

    const { data: student, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', studentId)
      .single();

    if (error || !student) {
      return { ok: false, error: 'Aluno nÃ£o encontrado' };
    }

    return { ok: true, data: student };
  } catch (error: any) {
    return { ok: false, error: error.message };
  }
}

export async function updateStudentWorkoutStatus(studentId: string, workoutName: string): Promise<ActionResult> {
  try {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('metadata')
      .eq('id', studentId)
      .single();

    const newMetadata = {
      ...(existingProfile?.metadata || {}),
      current_workout: workoutName,
    };

    const { error } = await adminClient
      .from('profiles')
      .update({ metadata: newMetadata })
      .eq('id', studentId);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath('/dashboard/personal', 'layout');
    return { ok: true, data: null };
  } catch (error: any) {
    return { ok: false, error: error.message };
  }
}

export async function getPersonalWorkoutsDropdown(): Promise<ActionResult> {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Não autenticado" };

    const { data, error } = await supabase
      .from("workouts")
      .select("id, name, professional_id")
      .or(`professional_id.eq.${user.id},professional_id.is.null`)
      .not("name", "ilike", "%(Personalizado%")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { ok: true, data };
  } catch (error: any) {
    return { ok: false, error: error.message };
  }
}

export async function createPersonalAppointment(data: { clientId: string; date: string; time: string; duration: string; type: string; notes: string; }) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const durationMin = parseInt(data.duration, 10);
    const startTime = new Date(`${data.date}T${data.time}:00-03:00`);
    const endTime = new Date(startTime.getTime() + durationMin * 60000);

    const { error } = await supabase.from("appointments").insert({
      professional_id: user.id,
      client_id: data.clientId,
      title: (data.type === "treino" ? "Treino Presencial" : data.type === "consultoria" ? "Consultoria Online" : "Avaliação Física") + (data.notes ? ` - ${data.notes}` : ""),
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: "scheduled"
    });

    if (error) {
      console.error("Error creating appointment:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export async function updatePersonalAppointment(id: string, data: { clientId: string; date: string; time: string; duration: string; type: string; notes: string; }) {
  try {
    const supabase = require('@/lib/supabase/server').createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const durationMin = parseInt(data.duration, 10);
    const startTime = new Date(`${data.date}T${data.time}:00-03:00`);
    const endTime = new Date(startTime.getTime() + durationMin * 60000);

    const { error } = await supabase.from("appointments").update({
      client_id: data.clientId,
      title: (data.type === "treino" ? "Treino Presencial" : data.type === "consultoria" ? "Consultoria Online" : "Avaliação Física") + (data.notes ? ` - ${data.notes}` : ""),
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
    }).eq("id", id).eq("professional_id", user.id);

    if (error) {
      console.error("Error updating appointment:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export async function deletePersonalAppointment(id: string) {
  try {
    const supabase = require('@/lib/supabase/server').createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from("appointments").delete().eq("id", id).eq("professional_id", user.id);
    if (error) throw error;
    
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}
