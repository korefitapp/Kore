"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface MonthlyAdherence {
  month: string;
  year: number;
  progress: number;
}

export interface StudentAdherenceData {
  streak: number;
  weeklyCalendar: {
    day: string;
    date: number;
    progress: number;
    isToday: boolean;
  }[];
  monthlyAdherence: MonthlyAdherence[];
}

export async function getStudentAdherence(clientId?: string): Promise<StudentAdherenceData> {
  const supabase = createSupabaseServerClient();
  let targetId = clientId;

  if (!targetId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado");
    targetId = user.id;
  }

  // Define defaults
  let streak = 0;
  const now = new Date();
  
  // Weekly calendar (últimos 7 dias ou da semana atual, faremos os últimos 7 dias até hoje)
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const weeklyCalendar = [];
  
  // To avoid timezone issues, format dates locally to pt-BR in YYYY-MM-DD
  const formatYMD = (d: Date) => {
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${da}`;
  };

  const todayStr = formatYMD(now);

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    weeklyCalendar.push({
      day: days[d.getDay()],
      date: d.getDate(),
      progress: 0,
      isToday: i === 0,
      dateStr: formatYMD(d)
    });
  }

  // Monthly adherence (last 6 months)
  const monthlyAdherence: MonthlyAdherence[] = [];
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyAdherence.push({
      month: monthNames[d.getMonth()],
      year: d.getFullYear(),
      progress: 0,
    });
  }

  // Fetch workout logs
  const { data: logs, error } = await supabase
    .from("workout_logs")
    .select("completed_at")
    .eq("client_id", targetId)
    .order("completed_at", { ascending: false });

  if (error || !logs) {
    return { streak, weeklyCalendar, monthlyAdherence };
  }

  // Parse logs into YYYY-MM-DD set
  const trainedDates = new Set<string>();
  logs.forEach(log => {
    if (log.completed_at) {
      const d = new Date(log.completed_at);
      trainedDates.add(formatYMD(d));
    }
  });

  // Calculate Streak
  let currentCheckDate = new Date(now);
  let streakCount = 0;
  
  // Check if trained today
  if (trainedDates.has(todayStr)) {
    streakCount++;
    currentCheckDate.setDate(currentCheckDate.getDate() - 1);
  } else {
    // Check if trained yesterday (streak is still alive if they haven't trained *yet* today)
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (trainedDates.has(formatYMD(yesterday))) {
      currentCheckDate = yesterday;
    } else {
      // Streak broken
      currentCheckDate = new Date(0); // Break loop
    }
  }

  while (currentCheckDate.getTime() > 0) {
    if (trainedDates.has(formatYMD(currentCheckDate)) && formatYMD(currentCheckDate) !== todayStr) {
      streakCount++;
      currentCheckDate.setDate(currentCheckDate.getDate() - 1);
    } else if (formatYMD(currentCheckDate) !== todayStr) {
      break; // Gap found
    } else {
      // It's today, we already checked today above, so just go to yesterday
      currentCheckDate.setDate(currentCheckDate.getDate() - 1);
    }
  }
  streak = streakCount;

  // Populate Weekly Calendar progress
  weeklyCalendar.forEach(dayInfo => {
    if (trainedDates.has(dayInfo.dateStr)) {
      dayInfo.progress = 100; // For now, 100% means trained.
    }
  });

  // Populate Monthly Adherence
  monthlyAdherence.forEach(monthInfo => {
    let daysInMonth = new Date(monthInfo.year, monthNames.indexOf(monthInfo.month) + 1, 0).getDate();
    let trainedDaysInMonth = 0;
    
    // If it's the current month, only count days up to today
    if (monthInfo.month === monthNames[now.getMonth()] && monthInfo.year === now.getFullYear()) {
      daysInMonth = now.getDate();
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(monthInfo.year, monthNames.indexOf(monthInfo.month), i);
      if (trainedDates.has(formatYMD(d))) {
        trainedDaysInMonth++;
      }
    }

    monthInfo.progress = daysInMonth > 0 ? Math.round((trainedDaysInMonth / daysInMonth) * 100) : 0;
  });

  return {
    streak,
    weeklyCalendar: weeklyCalendar.map(({ day, date, progress, isToday }) => ({ day, date, progress, isToday })),
    monthlyAdherence,
  };
}
