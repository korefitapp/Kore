import type {
  Consultation,
  MacrosPoint,
  MealPlanToBuild,
  NutriKpi,
  Owner,
  Patient,
} from "./types";

export const OWNER: Owner = {
  name: "Júlia Sant'Anna",
  registry: "CRN-4 18.902",
  avatar: "👩🏼‍⚕️",
};

export const KPIS: NutriKpi[] = [
  {
    id: "to-review",
    icon: "calendar-clock",
    value: 5,
    label: "Pacientes a reavaliar",
    hint: "Renan, Helena e mais 3 pendentes esta semana",
    tone: "amber",
  },
  {
    id: "low-adherence",
    icon: "trending-down",
    value: 3,
    label: "Aderência baixa",
    hint: "Renan, Tatiane e Mateus abaixo de 70%",
    tone: "rose",
  },
  {
    id: "unread",
    icon: "message-warning",
    value: 5,
    label: "Mensagens não lidas",
    hint: "3 pacientes aguardando ajuste de cardápio",
    tone: "sky",
  },
  {
    id: "today",
    icon: "salad",
    value: 4,
    label: "Consultas hoje",
    hint: "2 presenciais · 2 online · 195min totais",
    tone: "emerald",
  },
];

export const PATIENTS: Patient[] = [
  {
    id: "helena-prado",
    name: "Helena Prado",
    avatar: "🥗",
    goal: "Emagrecimento",
    plan: "Trimestral",
    planExpiresInDays: 6,
    adherence8w: [72, 76, 78, 82, 84, 86, 88, 90],
    adherenceCurrent: 90,
    weightDeltaKg: -3.4,
    lastWeighIn: "há 3d",
    status: "reavaliar",
    unreadMessages: 2,
  },
  {
    id: "renan-castro",
    name: "Renan Castro",
    avatar: "🍳",
    goal: "Hipertrofia",
    plan: "Mensal",
    planExpiresInDays: 9,
    adherence8w: [70, 68, 66, 62, 60, 58, 56, 54],
    adherenceCurrent: 54,
    weightDeltaKg: -0.6,
    lastWeighIn: "há 8d",
    status: "atencao",
    unreadMessages: 3,
  },
  {
    id: "tatiane-moura",
    name: "Tatiane Moura",
    avatar: "🥑",
    goal: "Saúde clínica",
    plan: "Semestral",
    planExpiresInDays: 84,
    adherence8w: [62, 60, 58, 56, 56, 54, 52, 52],
    adherenceCurrent: 52,
    weightDeltaKg: 0.4,
    lastWeighIn: "há 12d",
    status: "atencao",
  },
  {
    id: "ana-souza",
    name: "Ana Souza",
    avatar: "🍇",
    goal: "Emagrecimento",
    plan: "Trimestral",
    planExpiresInDays: 33,
    adherence8w: [78, 80, 82, 84, 84, 86, 88, 88],
    adherenceCurrent: 88,
    weightDeltaKg: -4.2,
    lastWeighIn: "há 4d",
    status: "em-dia",
  },
  {
    id: "marcos-figueiredo",
    name: "Marcos Figueiredo",
    avatar: "🥩",
    goal: "Performance",
    plan: "Anual",
    planExpiresInDays: 197,
    adherence8w: [82, 84, 86, 88, 90, 92, 94, 96],
    adherenceCurrent: 96,
    weightDeltaKg: 2.1,
    lastWeighIn: "há 2d",
    status: "em-dia",
    unreadMessages: 1,
  },
  {
    id: "mateus-oliveira",
    name: "Mateus Oliveira",
    avatar: "🍱",
    goal: "Recomposição",
    plan: "Mensal",
    planExpiresInDays: 3,
    adherence8w: [74, 72, 70, 68, 68, 66, 66, 68],
    adherenceCurrent: 68,
    weightDeltaKg: -1.1,
    lastWeighIn: "há 1d",
    status: "reavaliar",
    unreadMessages: 1,
  },
  {
    id: "beatriz-lopes",
    name: "Beatriz Lopes",
    avatar: "🥕",
    goal: "Saúde clínica",
    plan: "Trimestral",
    planExpiresInDays: 58,
    adherence8w: [76, 78, 80, 82, 82, 84, 84, 85],
    adherenceCurrent: 85,
    weightDeltaKg: -1.8,
    lastWeighIn: "há 6d",
    status: "em-dia",
  },
  {
    id: "felipe-carvalho",
    name: "Felipe Carvalho",
    avatar: "🥥",
    goal: "Recomposição",
    plan: "Semestral",
    planExpiresInDays: 112,
    adherence8w: [80, 82, 82, 84, 84, 84, 86, 86],
    adherenceCurrent: 86,
    weightDeltaKg: -2.3,
    lastWeighIn: "ontem",
    status: "em-dia",
  },
];

export const AGENDA_TODAY: Consultation[] = [
  {
    id: "cons-1",
    time: "07:30",
    durationMin: 45,
    patientName: "Helena Prado",
    patientAvatar: "🥗",
    focus: "Avaliação trimestral · bioimpedância",
    modality: "presencial",
  },
  {
    id: "cons-2",
    time: "09:00",
    durationMin: 30,
    patientName: "Renan Castro",
    patientAvatar: "🍳",
    focus: "Retorno · ajuste de carboidratos",
    modality: "retorno",
  },
  {
    id: "cons-3",
    time: "11:30",
    durationMin: 60,
    patientName: "Marcos Figueiredo",
    patientAvatar: "🥩",
    focus: "Estratégia pré-competição",
    modality: "online",
  },
  {
    id: "cons-4",
    time: "15:00",
    durationMin: 60,
    patientName: "Beatriz Lopes",
    patientAvatar: "🥕",
    focus: "Anamnese inicial · perfil clínico",
    modality: "presencial",
  },
];

export const MEAL_PLANS_TO_BUILD: MealPlanToBuild[] = [
  {
    id: "build-1",
    patientName: "Renan Castro",
    patientAvatar: "🍳",
    block: "Bloco bulking · Semana 3",
    dueInDays: 1,
  },
  {
    id: "build-2",
    patientName: "Tatiane Moura",
    patientAvatar: "🥑",
    block: "Plano clínico · ajuste glicêmico",
    dueInDays: 2,
  },
  {
    id: "build-3",
    patientName: "Mateus Oliveira",
    patientAvatar: "🍱",
    block: "Recomposição · Fase 2",
    dueInDays: 3,
  },
];

export const WEEKLY_MACROS: MacrosPoint[] = [
  { day: "Seg", proteina: 138, carbo: 220, gordura: 62 },
  { day: "Ter", proteina: 144, carbo: 210, gordura: 60 },
  { day: "Qua", proteina: 152, carbo: 232, gordura: 64 },
  { day: "Qui", proteina: 148, carbo: 226, gordura: 63 },
  { day: "Sex", proteina: 156, carbo: 240, gordura: 66 },
  { day: "Sáb", proteina: 162, carbo: 252, gordura: 70 },
  { day: "Dom", proteina: 132, carbo: 198, gordura: 58 },
];

export function statusLabel(s: Patient["status"]): string {
  switch (s) {
    case "em-dia":
      return "Em dia";
    case "reavaliar":
      return "Reavaliar";
    case "atencao":
      return "Atenção";
  }
}
