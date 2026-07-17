"use client";

import React from "react";

import { motion } from "framer-motion";
import { Flame, Activity, Droplets, ArrowUpRight, Check, Bell, User, Sun, Moon, Plus, Minus } from "lucide-react";
import { useKore, selectBurnedWorkoutKcal } from "../store";

// --- Subcomponents ---

function WeeklyCalendar() {
  const waterMl = useKore((s) => s.waterMl);
  const waterGoalMl = useKore((s) => s.waterGoalMl);
  const meals = useKore((s) => s.meals);
  const exercises = useKore((s) => s.exercises);
  const weeklyCalendar = useKore((s) => s.weeklyCalendar);

  const waterCompleted = waterMl >= waterGoalMl && waterGoalMl > 0;
  const dietCompleted = meals.length > 0 && meals.every((m) => m.consumed);
  const workoutCompleted = exercises.length > 0 && exercises.every((e) => e.sets.length > 0 && e.sets.every((st) => st.done));
  
  let todayProgress = 0;
  if (waterCompleted) todayProgress += 33.33;
  if (dietCompleted) todayProgress += 33.33;
  if (workoutCompleted) todayProgress += 33.34;
  todayProgress = Math.round(todayProgress);

  const displayCalendar = weeklyCalendar || [];

  return (
    <section className="mb-4">
      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[24px] py-4 px-2 shadow-sm flex justify-between items-center gap-1">
        {displayCalendar.map((item, idx) => {
          // 33.3% para cada etapa (Água, Treino, Dieta)
          const progress = item.isToday ? todayProgress : item.progress;
          const progressDeg = (progress / 100) * 360;
          
          return (
            <div key={idx} className="flex flex-col items-center gap-2">
              <span className={`text-[11px] font-medium uppercase tracking-wider ${item.isToday ? 'text-emerald-500 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-zinc-500'}`}>
                {item.day}
              </span>
              <div 
                className={`relative w-[42px] h-[42px] rounded-full flex items-center justify-center ${
                  item.isToday ? 'shadow-[0_0_15px_rgba(52,211,153,0.3)]' : ''
                }`}
                style={{
                  background: `conic-gradient(#34d399 ${progressDeg}deg, rgba(150,150,150,0.1) ${progressDeg}deg)`
                }}
              >
                {/* Inner circle for the "border" effect */}
                <div className={`w-[36px] h-[36px] rounded-full flex items-center justify-center ${item.isToday ? 'bg-slate-100 dark:bg-zinc-800' : 'bg-white dark:bg-[#1a1a1a]'}`}>
                  <span className={`text-sm ${item.isToday ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-zinc-400'}`}>
                    {item.date}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function DailyMetrics() {
  const waterMl = useKore((s) => s.waterMl);
  const caloriesOut = useKore(selectBurnedWorkoutKcal);
  const streak = useKore((s) => s.streak);
  const meals = useKore((s) => s.meals);

  const caloriesIn = Math.round(meals.filter((m) => m.consumed).flatMap((m) => m.items).reduce((acc, it) => acc + it.kcal, 0));

  return (
    <section className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-slate-900 dark:text-white font-bold text-lg">Resumo Diário</h2>
        <div className="flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]">
          <Check size={14} strokeWidth={3} />
          <span>{streak} Dias Seguidos</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {/* Metric 1 - Calorias Ingeridas */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[24px] p-4 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(52,211,153,0.2)]">
            <Flame size={20} />
          </div>
          <span className="text-slate-900 dark:text-white font-extrabold text-xl">{caloriesIn}</span>
          <span className="text-slate-400 dark:text-zinc-400 text-[10px] uppercase font-bold tracking-wider mt-1">Kcal Ing.</span>
        </div>

        {/* Metric 2 - Calorias Gastas */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[24px] p-4 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Activity size={20} />
          </div>
          <span className="text-slate-900 dark:text-white font-extrabold text-xl">{caloriesOut}</span>
          <span className="text-slate-400 dark:text-zinc-400 text-[10px] uppercase font-bold tracking-wider mt-1">Kcal Gastas</span>
        </div>

        {/* Metric 3 - Água */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[24px] p-4 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <Droplets size={20} />
          </div>
          <span className="text-slate-900 dark:text-white font-extrabold text-xl">{(waterMl / 1000).toFixed(1).replace('.0', '')}L</span>
          <span className="text-slate-400 dark:text-zinc-400 text-[10px] uppercase font-bold tracking-wider mt-1">Água</span>
        </div>
      </div>
    </section>
  );
}

function TaskShortcuts() {
  const setTab = useKore((s) => s.setTab);
  const waterMl = useKore((s) => s.waterMl);
  const waterGoalMl = useKore((s) => s.waterGoalMl);
  const addWater = useKore((s) => s.addWater);
  const waterProgress = Math.min((waterMl / Math.max(waterGoalMl, 1)) * 100, 100);

  return (
    <section className="mb-4 pb-20">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-slate-900 dark:text-white font-bold text-lg">Tarefas de Hoje</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Training Card */}
        <div 
          onClick={() => setTab("treino")}
          className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[28px] p-2 flex flex-col relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all shadow-sm"
        >
          <div className="bg-purple-500 text-white rounded-[20px] p-4 flex items-center justify-between shadow-lg shadow-purple-500/20">
            <span className="font-extrabold text-sm leading-tight">Treino<br/>de Hoje</span>
            <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center group-active:scale-90 transition-transform">
              <ArrowUpRight size={18} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Nutrition Card */}
        <div 
          onClick={() => setTab("dieta")}
          className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[28px] p-2 flex flex-col relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all shadow-sm"
        >
          <div className="bg-emerald-500 text-white rounded-[20px] p-4 flex items-center justify-between shadow-lg shadow-emerald-500/20">
            <span className="font-extrabold text-sm leading-tight">Dieta<br/>de Hoje</span>
            <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center group-active:scale-90 transition-transform">
              <ArrowUpRight size={18} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Hydration Card */}
        <div className="col-span-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[28px] p-4 flex flex-col relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <Droplets size={20} />
              </div>
              <div>
                <p className="text-slate-400 dark:text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Hidratação</p>
                <p className="font-extrabold text-slate-900 dark:text-white text-lg">{waterMl} <span className="text-sm font-medium text-slate-400 dark:text-zinc-500">/ {waterGoalMl} ml</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => addWater(-250)}
                className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-zinc-300 rounded-[16px] w-9 h-9 flex items-center justify-center active:scale-95 transition-transform"
              >
                <Minus size={16} strokeWidth={3} />
              </button>
              <button 
                onClick={() => addWater(250)}
                className="bg-cyan-500 hover:bg-cyan-400 text-white rounded-[16px] px-4 py-2 text-sm font-extrabold shadow-[0_0_15px_rgba(34,211,238,0.3)] active:scale-95 transition-transform flex items-center gap-1"
              >
                <Plus size={16} strokeWidth={3} />
                250ml
              </button>
            </div>
          </div>
          
          <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-3 overflow-hidden shadow-inner">
            <motion.div 
              className="bg-gradient-to-r from-cyan-400 to-cyan-500 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${waterProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Main Component ---
export function HomeTab() {
  const user = useKore((s) => s.user);
  const fullName = user.name;
  const setProfileView = useKore((s) => s.setProfileView);
  const setTab = useKore((s) => s.setTab);
  const theme = useKore((s) => s.theme);
  const toggleTheme = useKore((s) => s.toggleTheme);

  const [dateStr, setDateStr] = React.useState("");
  React.useEffect(() => {
    const str = new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(new Date());
    setDateStr(str);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-50 dark:bg-[#121212] min-h-[100dvh] text-slate-900 dark:text-white -mx-4 -mt-4 px-5 pt-4 overflow-y-auto pb-6"
    >
      <header className="flex items-center justify-between gap-3 mb-4">
        <div className="min-w-0 flex items-center gap-3">
          <div 
            onClick={() => {
              setProfileView("menu");
              setTab("perfil");
            }}
            className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 dark:bg-white/10 border-2 border-white dark:border-white/20 flex items-center justify-center cursor-pointer active:scale-95 transition-transform shrink-0 shadow-sm"
          >
            {user.avatar && user.avatar.startsWith("http") ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={24} className="text-slate-400 dark:text-zinc-400" />
            )}
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold tracking-wide uppercase">
              {dateStr || "Carregando..."}
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight truncate flex items-center gap-1.5">
              <span>{fullName}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => toggleTheme()}
            className="relative w-11 h-11 rounded-[18px] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-zinc-300 active:scale-95 transition shadow-sm"
            aria-label="Alternar Tema"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button
            className="relative w-11 h-11 rounded-[18px] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-zinc-300 active:scale-95 transition shadow-sm"
            aria-label="Notificações"
          >
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)] border-2 border-white dark:border-[#121212]" />
          </button>
        </div>
      </header>

      <WeeklyCalendar />
      <DailyMetrics />
      <TaskShortcuts />
    </motion.div>
  );
}
