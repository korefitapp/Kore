const fs = require('fs');

function patchGetStudents() {
  const path = 'app/actions/personal-actions.ts';
  let content = fs.readFileSync(path, 'utf8');

  const newFunction = `export async function getStudents(): Promise<ActionResult> {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { ok: false, error: "Usuário não autenticado." };
    }

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select(\`
        id,
        full_name,
        avatar_url,
        phone,
        status,
        created_at,
        metadata,
        workout_plans (*)
      \`)
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
      return \`\${d.getFullYear()}-\${String(d.getMonth() + 1).padStart(2, '0')}-\${String(d.getDate()).padStart(2, '0')}\`;
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
        pLogs.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
        const lastDate = new Date(pLogs[0].completed_at);
        if (formatYMD(lastDate) === formatYMD(now)) lastWorkoutStr = "Hoje";
        else {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          if (formatYMD(lastDate) === formatYMD(yesterday)) lastWorkoutStr = "Ontem";
          else {
            const diffTime = Math.abs(now.getTime() - lastDate.getTime());
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays < 7) lastWorkoutStr = \`Há \${diffDays} dias\`;
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
}`;

  content = content.replace(
    /export async function getStudents.*?^}/ms,
    newFunction
  );

  fs.writeFileSync(path, content, 'utf8');
}

patchGetStudents();
