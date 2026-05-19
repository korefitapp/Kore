import type {
  AppSeed,
  DayCheck,
  Exercise,
  Meal,
  Product,
  Store,
  UserProfile,
} from "./types";

const weekdayLabels = ["S", "T", "Q", "Q", "S", "S", "D"];

export function buildWeek(today = new Date()): DayCheck[] {
  const weekStart = new Date(today);
  const day = weekStart.getDay();
  const diff = (day + 6) % 7;
  weekStart.setDate(weekStart.getDate() - diff);

  return weekdayLabels.map((label, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const isToday = d.toDateString() === today.toDateString();
    const isPast = d < today && !isToday;
    return { label, date: d.getDate(), done: isPast, isToday };
  });
}

export const FALLBACK_MEALS: Meal[] = [
  {
    id: "m1",
    name: "Café da Manhã",
    emoji: "☕️",
    targetTime: "07:30",
    consumed: true,
    items: [
      { id: "f1", name: "Pão Integral (2 fatias)", kcal: 150, protein: 6, carbs: 28, fat: 2 },
      { id: "f2", name: "Ovo Mexido (2 un)", kcal: 180, protein: 14, carbs: 1, fat: 13 },
      { id: "f3", name: "Café preto", kcal: 5, protein: 0, carbs: 1, fat: 0 },
    ],
  },
  {
    id: "m2",
    name: "Lanche da Manhã",
    emoji: "🍎",
    targetTime: "10:30",
    consumed: false,
    items: [
      { id: "f4", name: "Maçã Fuji", kcal: 95, protein: 0, carbs: 25, fat: 0 },
      { id: "f5", name: "Mix de Castanhas (30g)", kcal: 180, protein: 5, carbs: 6, fat: 16 },
    ],
  },
  {
    id: "m3",
    name: "Almoço",
    emoji: "🍛",
    targetTime: "12:30",
    consumed: false,
    items: [
      { id: "f6", name: "Peito de Frango Grelhado (150g)", kcal: 240, protein: 45, carbs: 0, fat: 6 },
      { id: "f7", name: "Arroz Integral (100g)", kcal: 130, protein: 3, carbs: 28, fat: 1 },
      { id: "f8", name: "Feijão Carioca (100g)", kcal: 95, protein: 7, carbs: 17, fat: 0 },
      { id: "f9", name: "Salada Mista + Azeite", kcal: 120, protein: 2, carbs: 8, fat: 9 },
    ],
  },
  {
    id: "m4",
    name: "Pré-Treino",
    emoji: "⚡️",
    targetTime: "16:30",
    consumed: false,
    items: [
      { id: "f10", name: "Banana Prata", kcal: 90, protein: 1, carbs: 23, fat: 0 },
      { id: "f11", name: "Whey Protein (30g)", kcal: 120, protein: 24, carbs: 3, fat: 1 },
    ],
  },
  {
    id: "m5",
    name: "Jantar",
    emoji: "🥗",
    targetTime: "20:00",
    consumed: false,
    items: [
      { id: "f12", name: "Salmão Grelhado (120g)", kcal: 250, protein: 26, carbs: 0, fat: 16 },
      { id: "f13", name: "Batata Doce (150g)", kcal: 130, protein: 2, carbs: 30, fat: 0 },
      { id: "f14", name: "Brócolis no Vapor", kcal: 55, protein: 4, carbs: 11, fat: 1 },
    ],
  },
];

export const FALLBACK_EXERCISES: Exercise[] = [
  {
    id: "e1",
    name: "Supino Reto com Halteres",
    muscle: "Peito",
    thumb: "💪",
    videoLabel: "Execução: 0:00 / 1:24",
    targetReps: "4x 10-12",
    sets: [
      { load: "22", reps: "12", done: false },
      { load: "22", reps: "12", done: false },
      { load: "24", reps: "10", done: false },
      { load: "24", reps: "10", done: false },
    ],
  },
  {
    id: "e2",
    name: "Crucifixo Inclinado",
    muscle: "Peito superior",
    thumb: "🏋️",
    videoLabel: "Execução: 0:00 / 1:08",
    targetReps: "3x 12-15",
    sets: [
      { load: "12", reps: "15", done: false },
      { load: "14", reps: "12", done: false },
      { load: "14", reps: "12", done: false },
    ],
  },
  {
    id: "e3",
    name: "Tríceps Pulley Corda",
    muscle: "Tríceps",
    thumb: "🦾",
    videoLabel: "Execução: 0:00 / 0:58",
    targetReps: "4x 12",
    sets: [
      { load: "25", reps: "12", done: false },
      { load: "27", reps: "12", done: false },
      { load: "27", reps: "12", done: false },
      { load: "30", reps: "10", done: false },
    ],
  },
  {
    id: "e4",
    name: "Tríceps Francês",
    muscle: "Tríceps",
    thumb: "🏋️‍♂️",
    videoLabel: "Execução: 0:00 / 1:12",
    targetReps: "3x 10",
    sets: [
      { load: "14", reps: "10", done: false },
      { load: "14", reps: "10", done: false },
      { load: "16", reps: "8", done: false },
    ],
  },
];

export const FALLBACK_STORES: Store[] = [
  {
    id: "s1",
    name: "Growth Suplementos · Centro",
    logo: "🥤",
    rating: 4.9,
    distanceKm: 0.8,
    deliveryFee: 4.99,
    category: "supplements",
    etaMin: 25,
  },
  {
    id: "s2",
    name: "Hortifruti do Bairro",
    logo: "🥗",
    rating: 4.7,
    distanceKm: 1.2,
    deliveryFee: 6.9,
    category: "fresh",
    etaMin: 35,
  },
  {
    id: "s3",
    name: "Farmácia Saúde+",
    logo: "💊",
    rating: 4.8,
    distanceKm: 0.5,
    deliveryFee: 3.5,
    category: "pharmacy",
    etaMin: 20,
  },
  {
    id: "s4",
    name: "Mundo Fit Store",
    logo: "🛒",
    rating: 4.6,
    distanceKm: 2.1,
    deliveryFee: 7.9,
    category: "supplements",
    etaMin: 40,
  },
];

export const FALLBACK_PRODUCTS: Product[] = [
  { id: "p1", storeId: "s1", name: "Whey Concentrado 900g", price: 109.9, oldPrice: 129.9, promo: "-15%", image: "🥛" },
  { id: "p2", storeId: "s1", name: "Creatina Monohidratada 300g", price: 89.9, oldPrice: 119.9, promo: "-25%", image: "💊" },
  { id: "p3", storeId: "s1", name: "BCAA 2:1:1 (120 caps)", price: 59.9, image: "💪" },
  { id: "p4", storeId: "s1", name: "Pré-Treino Insano", price: 119.9, oldPrice: 139.9, promo: "-14%", image: "⚡️" },
  { id: "p5", storeId: "s1", name: "Albumina Pura 500g", price: 49.9, image: "🥚" },
  { id: "p6", storeId: "s2", name: "Banana Prata (kg)", price: 6.49, image: "🍌" },
  { id: "p7", storeId: "s2", name: "Mix Salada Pronta", price: 12.9, oldPrice: 14.9, promo: "-13%", image: "🥗" },
  { id: "p8", storeId: "s2", name: "Brócolis Orgânico", price: 8.9, image: "🥦" },
  { id: "p9", storeId: "s2", name: "Frango Resfriado (kg)", price: 21.9, image: "🍗" },
  { id: "p10", storeId: "s2", name: "Salmão Fresco (200g)", price: 34.9, oldPrice: 39.9, promo: "-12%", image: "🐟" },
  { id: "p11", storeId: "s3", name: "Vitamina D3 5000UI", price: 39.9, image: "☀️" },
  { id: "p12", storeId: "s3", name: "Magnésio Quelato", price: 49.9, oldPrice: 59.9, promo: "-16%", image: "💊" },
  { id: "p13", storeId: "s3", name: "Ômega 3 1000mg", price: 69.9, image: "🐟" },
  { id: "p14", storeId: "s3", name: "Multivitamínico Premium", price: 89.9, image: "💎" },
  { id: "p15", storeId: "s4", name: "Barra de Proteína Cookies", price: 8.9, oldPrice: 10.9, promo: "-18%", image: "🍫" },
  { id: "p16", storeId: "s4", name: "Pasta de Amendoim 1kg", price: 39.9, image: "🥜" },
  { id: "p17", storeId: "s4", name: "Whey Isolado 900g", price: 159.9, oldPrice: 189.9, promo: "-16%", image: "🥤" },
  { id: "p18", storeId: "s4", name: "Coqueteleira Premium", price: 29.9, image: "🍶" },
];

export const FALLBACK_USER: UserProfile = {
  id: "anon",
  name: "Cliente KORE",
  email: "cliente@kore.app",
  avatar: "🧘‍♀️",
  plan: "Premium",
  memberSince: "Março 2025",
};

export const DEFAULT_ADDRESS = "Av. Paulista, 1578 — Bela Vista, SP";
export const DEFAULT_STREAK = 12;

export function buildFallbackSeed(): AppSeed {
  return {
    online: false,
    user: FALLBACK_USER,
    waterMl: 1200,
    waterGoalMl: 3000,
    kcalGoal: 2400,
    macrosGoal: { protein: 180, carbs: 280, fat: 70 },
    meals: FALLBACK_MEALS,
    exercises: FALLBACK_EXERCISES,
    stores: FALLBACK_STORES,
    products: FALLBACK_PRODUCTS,
    streak: DEFAULT_STREAK,
    address: DEFAULT_ADDRESS,
  };
}
