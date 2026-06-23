import type {
  AgendaSession,
  Owner,
  PersonalKpi,
  Student,
  VolumePoint,
  WorkoutToBuild,
} from "./types";

export const OWNER: Owner = {
  name: "Diego Martins",
  registry: "CREF 010234-G/SP",
  avatar: "🧑‍🏫",
};

export const KPIS: PersonalKpi[] = [
  {
    id: "expiring",
    icon: "calendar-clock",
    value: 3,
    label: "Treinos vencendo",
    hint: "Ana, Felipe e Carla nos próximos 12 dias",
    tone: "amber",
  },
  {
    id: "low-adherence",
    icon: "trending-down",
    value: 2,
    label: "Aderência baixa",
    hint: "Carla e Felipe abaixo de 75%",
    tone: "rose",
  },
  {
    id: "unread",
    icon: "message-warning",
    value: 7,
    label: "Mensagens não lidas",
    hint: "4 alunos aguardando resposta",
    tone: "sky",
  },
  {
    id: "reviews",
    icon: "activity",
    value: 4,
    label: "Revisões agendadas",
    hint: "Periodização desta semana",
    tone: "emerald",
  },
];

export const STUDENTS: Student[] = [
  {
    id: "ana-souza",
    name: "Ana Souza",
    avatar: "🧘‍♀️",
    goal: "Hipertrofia",
    plan: "Trimestral",
    planExpiresInDays: 4,
    adherence8w: [70, 76, 82, 78, 82, 84, 86, 92],
    adherenceCurrent: 92,
    loadDeltaPct: 8.4,
    lastWorkout: "há 6h",
    status: "renovar",
    unreadMessages: 2,
  },
  {
    id: "bruno-lima",
    name: "Bruno Lima",
    avatar: "🏋️‍♂️",
    goal: "Força máxima",
    plan: "Semestral",
    planExpiresInDays: 73,
    adherence8w: [72, 74, 78, 80, 82, 84, 86, 88],
    adherenceCurrent: 88,
    loadDeltaPct: 11.2,
    lastWorkout: "ontem",
    status: "em-dia",
  },
  {
    id: "carla-tavares",
    name: "Carla Tavares",
    avatar: "🤸‍♀️",
    goal: "Emagrecimento",
    plan: "Mensal",
    planExpiresInDays: 12,
    adherence8w: [68, 64, 62, 60, 58, 56, 54, 54],
    adherenceCurrent: 54,
    loadDeltaPct: -2.1,
    lastWorkout: "há 4 dias",
    status: "atencao",
    unreadMessages: 1,
  },
  {
    id: "daniel-reis",
    name: "Daniel Reis",
    avatar: "🏃‍♂️",
    goal: "Performance corrida",
    plan: "Trimestral",
    planExpiresInDays: 31,
    adherence8w: [70, 72, 74, 76, 78, 80, 81, 81],
    adherenceCurrent: 81,
    loadDeltaPct: 4.6,
    lastWorkout: "hoje",
    status: "em-dia",
  },
  {
    id: "erika-pacheco",
    name: "Erika Pacheco",
    avatar: "💪",
    goal: "Hipertrofia",
    plan: "Anual",
    planExpiresInDays: 220,
    adherence8w: [82, 84, 86, 88, 90, 92, 94, 96],
    adherenceCurrent: 96,
    loadDeltaPct: 14.8,
    lastWorkout: "há 2h",
    status: "em-dia",
  },
  {
    id: "felipe-carvalho",
    name: "Felipe Carvalho",
    avatar: "🥋",
    goal: "Condicionamento",
    plan: "Mensal",
    planExpiresInDays: 2,
    adherence8w: [76, 74, 72, 72, 70, 68, 70, 71],
    adherenceCurrent: 71,
    loadDeltaPct: 1.9,
    lastWorkout: "há 1 dia",
    status: "renovar",
    unreadMessages: 3,
  },
  {
    id: "gabriela-santanna",
    name: "Gabriela Sant'Anna",
    avatar: "🧗‍♀️",
    goal: "Mobilidade + força",
    plan: "Trimestral",
    planExpiresInDays: 48,
    adherence8w: [74, 76, 78, 80, 82, 82, 84, 84],
    adherenceCurrent: 84,
    loadDeltaPct: 6.2,
    lastWorkout: "há 12h",
    status: "em-dia",
  },
  {
    id: "henrique-alves",
    name: "Henrique Alves",
    avatar: "🚴‍♂️",
    goal: "Resistência",
    plan: "Semestral",
    planExpiresInDays: 96,
    adherence8w: [70, 72, 74, 74, 76, 76, 78, 78],
    adherenceCurrent: 78,
    loadDeltaPct: 3.4,
    lastWorkout: "há 1 dia",
    status: "em-dia",
    unreadMessages: 1,
  },
];

export const AGENDA_TODAY: AgendaSession[] = [
  {
    id: "sess-1",
    time: "07:00",
    durationMin: 60,
    studentName: "Erika Pacheco",
    studentAvatar: "💪",
    focus: "Push A · Peito · Tríceps",
    modality: "presencial",
  },
  {
    id: "sess-2",
    time: "09:30",
    durationMin: 50,
    studentName: "Ana Souza",
    studentAvatar: "🧘‍♀️",
    focus: "Pull A · Costas · Bíceps",
    modality: "online",
  },
  {
    id: "sess-3",
    time: "12:00",
    durationMin: 30,
    studentName: "Daniel Reis",
    studentAvatar: "🏃‍♂️",
    focus: "Revisão de periodização",
    modality: "consultoria",
  },
  {
    id: "sess-4",
    time: "17:00",
    durationMin: 75,
    studentName: "Bruno Lima",
    studentAvatar: "🏋️‍♂️",
    focus: "Legs Heavy · Agachamento RPE 8",
    modality: "presencial",
  },
  {
    id: "sess-5",
    time: "19:00",
    durationMin: 45,
    studentName: "Gabriela Sant'Anna",
    studentAvatar: "🧗‍♀️",
    focus: "Mobilidade + Core",
    modality: "online",
  },
];

export const WORKOUTS_TO_BUILD: WorkoutToBuild[] = [
  {
    id: "build-1",
    studentName: "Carla Tavares",
    studentAvatar: "🤸‍♀️",
    block: "Bloco 3 · Semana 2",
    dueInDays: 1,
  },
  {
    id: "build-2",
    studentName: "Henrique Alves",
    studentAvatar: "🚴‍♂️",
    block: "Cutting · Semana 4",
    dueInDays: 2,
  },
  {
    id: "build-3",
    studentName: "Felipe Carvalho",
    studentAvatar: "🥋",
    block: "Cond. geral · Semana 1",
    dueInDays: 3,
  },
];

export const WEEKLY_VOLUME: VolumePoint[] = [
  { day: "Seg", treinos: 18, kcal100: 64 },
  { day: "Ter", treinos: 22, kcal100: 78 },
  { day: "Qua", treinos: 26, kcal100: 92 },
  { day: "Qui", treinos: 24, kcal100: 85 },
  { day: "Sex", treinos: 30, kcal100: 105 },
  { day: "Sáb", treinos: 32, kcal100: 112 },
  { day: "Dom", treinos: 14, kcal100: 48 },
];

export function statusLabel(s: Student["status"]): string {
  switch (s) {
    case "em-dia":
      return "Em dia";
    case "renovar":
      return "Renovar";
    case "atencao":
      return "Atenção";
    case "aguardando":
      return "Aguardando Treino";
  }
}
