"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  CalendarDays, 
  ChevronRight, 
  Dumbbell, 
  MessageCircle, 
  NotebookPen, 
  Plus, 
  Target, 
  TrendingUp, 
  Utensils 
} from "lucide-react";
import Link from "next/link";
import { Topbar } from "../../_components/Topbar";
import { MobileSidebar, Sidebar } from "../../_components/Sidebar";
import { CreateMealPlanModal } from "../../_components/CreateMealPlanModal";
import { EditPatientModal } from "../../_components/EditPatientModal";
import { Pencil } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, YAxis, Tooltip } from "recharts";

type TabKey = "overview" | "metrics" | "mealplans" | "notes";

interface PatientProfileClientProps {
  patient: any; // Mapped from DB profiles
}

export function PatientProfileClient({ patient }: PatientProfileClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [mealPlanModalOpen, setMealPlanModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const name = patient.display_name || patient.full_name || "Sem Nome";
  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const goal = patient.fitness_goal || patient.metadata?.goal || "Saúde Geral";
  const weight = patient.weight || "--";
  const height = patient.height || "--";

  let imc = "--";
  if (weight !== "--" && height !== "--" && height > 0) {
    const heightInMeters = height / 100;
    imc = (weight / (heightInMeters * heightInMeters)).toFixed(1);
  }

  // Mock data para o gráfico do paciente
  const weightHistory = [
    { name: "Semana 1", weight: weight !== "--" ? Number(weight) + 2 : 80 },
    { name: "Semana 2", weight: weight !== "--" ? Number(weight) + 1 : 79 },
    { name: "Semana 3", weight: weight !== "--" ? Number(weight) + 0.5 : 78.5 },
    { name: "Hoje", weight: weight !== "--" ? Number(weight) : 78 },
  ];

  return (
    <div className="min-h-screen flex bg-kore-bg text-kore-ink">
      <Sidebar />
      <MobileSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-kore-muted">
            <Link 
              href="/dashboard/nutri/patients" 
              className="hover:text-kore-ink transition inline-flex items-center gap-1"
            >
              <ArrowLeft size={14} /> Pacientes
            </Link>
            <ChevronRight size={14} />
            <span className="text-kore-ink font-semibold truncate max-w-[200px]">
              {name}
            </span>
          </div>

          {/* Profile Header */}
          <section className="bg-kore-card/80 backdrop-blur-md border border-kore-border rounded-3xl p-6 sm:p-8 relative overflow-hidden">
            {/* Elemento de background decorativo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-kore-emerald/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative flex flex-col sm:flex-row gap-6 sm:items-center justify-between">
              <div className="flex items-center gap-5">
                {patient.avatar_url ? (
                  <img
                    src={patient.avatar_url}
                    alt={name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-kore-bg shadow-xl"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-kore-emerald-soft to-kore-emerald/20 text-kore-emerald-deep text-3xl font-bold grid place-items-center ring-4 ring-kore-bg shadow-xl">
                    {initials}
                  </div>
                )}
                
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      {name}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider ring-1 ring-emerald-200 dark:ring-emerald-500/20">
                      Ativo
                    </span>
                  </div>
                  <p className="text-kore-muted font-medium text-sm">
                    {patient.email} {patient.phone && `· ${patient.phone}`}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-kore-subink bg-kore-bg px-2.5 py-1 rounded-lg border border-kore-border">
                      <Target size={12} className="text-kore-emerald" /> {goal}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-4 sm:mt-0">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(true)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-kore-bg hover:bg-kore-card border border-kore-border text-kore-ink text-sm font-bold transition active:scale-95"
                >
                  <Pencil size={16} />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setMealPlanModalOpen(true)}
                  className="flex-1 sm:flex-none btn-emerald px-5 py-2.5 text-sm"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  Cardápio
                </button>
              </div>
            </div>
          </section>

          {/* Tabs Navigation */}
          <div className="flex items-center gap-2 sm:gap-6 border-b border-kore-border overflow-x-auto no-scrollbar">
            {[
              { id: "overview", label: "Visão Geral", icon: Target },
              { id: "metrics", label: "Evolução Física", icon: TrendingUp },
              { id: "mealplans", label: "Cardápios", icon: Utensils },
              { id: "notes", label: "Prontuário", icon: NotebookPen },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as TabKey)}
                  className={`relative flex items-center gap-2 py-3 px-1 sm:px-2 text-sm font-bold whitespace-nowrap transition-colors ${
                    isActive ? "text-kore-ink" : "text-kore-muted hover:text-kore-subink"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabNutri"
                      className="absolute left-0 right-0 bottom-[-1px] h-0.5 bg-kore-emerald rounded-t-full"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="outline-none"
            >
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Resumo */}
                  <div className="col-span-1 md:col-span-2 space-y-6">
                    <div className="card p-6 border border-kore-border bg-kore-card/50">
                      <h3 className="font-extrabold text-lg mb-4">Informações do Paciente</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-kore-bg">
                          <p className="text-xs font-bold text-kore-muted uppercase tracking-wider mb-1">Peso Atual</p>
                          <p className="text-xl font-black text-kore-ink">{weight} {weight !== "--" && "kg"}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-kore-bg">
                          <p className="text-xs font-bold text-kore-muted uppercase tracking-wider mb-1">Altura</p>
                          <p className="text-xl font-black text-kore-ink">{height} {height !== "--" && "cm"}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-kore-bg">
                          <p className="text-xs font-bold text-kore-muted uppercase tracking-wider mb-1">IMC</p>
                          <p className="text-xl font-black text-kore-ink">{imc}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-kore-bg">
                          <p className="text-xs font-bold text-kore-muted uppercase tracking-wider mb-1">Objetivo Base</p>
                          <p className="text-xl font-black text-kore-ink">{goal}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar/Widgets */}
                  <div className="space-y-6">
                    <div className="card p-5 border border-kore-border bg-kore-card/50">
                      <div className="flex items-center gap-2 mb-4">
                        <CalendarDays size={16} className="text-kore-emerald" />
                        <h3 className="font-bold text-sm">Próxima Consulta</h3>
                      </div>
                      <p className="text-xs text-kore-muted mb-3">Nenhuma consulta agendada.</p>
                      <button className="w-full py-2 rounded-xl border border-kore-border hover:border-kore-emerald hover:text-kore-emerald transition text-xs font-bold text-kore-ink">
                        Agendar agora
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "metrics" && (
                <div className="space-y-6">
                  <div className="card p-6 border border-kore-border bg-kore-card/50">
                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <h3 className="font-extrabold text-lg">Evolução de Peso</h3>
                        <p className="text-sm text-kore-muted">Variação dos últimos 30 dias</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-kore-muted uppercase">Atual</p>
                        <p className="text-2xl font-black text-kore-emerald-deep">{weight} kg</p>
                      </div>
                    </div>
                    
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weightHistory} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Tooltip 
                            contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                            itemStyle={{ fontWeight: "bold", color: "#10B981" }}
                          />
                          <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
                          <Area 
                            type="monotone" 
                            dataKey="weight" 
                            stroke="#10B981" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorWeight)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "mealplans" && (
                <div className="card p-12 border border-dashed border-kore-border flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-kore-bg grid place-items-center mb-4 text-kore-muted">
                    <Utensils size={24} />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Nenhum cardápio ativo</h3>
                  <p className="text-sm text-kore-muted max-w-md mb-6">
                    Este paciente ainda não possui um plano alimentar estruturado. 
                    Crie o primeiro cardápio para ajudá-lo a alcançar o objetivo de {goal}.
                  </p>
                  <button 
                    onClick={() => setMealPlanModalOpen(true)}
                    className="btn-emerald px-6 py-2.5 text-sm"
                  >
                    Montar Primeiro Cardápio
                  </button>
                </div>
              )}

              {activeTab === "notes" && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-kore-card grid place-items-center flex-shrink-0">
                      <NotebookPen size={16} className="text-kore-emerald" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <textarea 
                        placeholder="Escreva uma anotação clínica (apenas você pode ver)..."
                        className="w-full h-32 px-4 py-3 rounded-2xl bg-kore-card border border-kore-border text-sm font-medium focus:outline-none focus:border-kore-emerald resize-none transition"
                      />
                      <div className="flex justify-end">
                        <button className="btn-emerald px-6 py-2 text-sm">
                          Salvar Anotação
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-kore-border space-y-6 pl-12">
                    <div className="relative">
                      <div className="absolute -left-[35px] top-1 w-3 h-3 rounded-full bg-kore-border" />
                      <div className="absolute -left-[29px] top-4 bottom-[-30px] w-px bg-kore-border" />
                      <p className="text-xs font-bold text-kore-muted mb-1">Há 1 semana</p>
                      <div className="card p-4 text-sm bg-kore-bg">
                        Paciente relatou boa adaptação à dieta, mas sentiu um pouco de fome à noite. Aumentar o aporte de fibras no jantar.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <CreateMealPlanModal 
        open={mealPlanModalOpen} 
        onOpenChange={setMealPlanModalOpen} 
      />
      <EditPatientModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        patient={patient}
      />
    </div>
  );
}
