export type Tab = "home" | "dieta" | "treino" | "shop" | "perfil";
export type Theme = "light" | "dark";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: "Free" | "Premium" | "Coach";
  memberSince: string;
  coachId?: string | null;
}

export interface Trainer {
  id: string;
  name: string;
  specialty: string;
  distance: string;
  rating: string;
  avatarInitials: string;
}

export interface FoodItem {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  consumed?: boolean;
}

export interface Meal {
  id: string;
  name: string;
  emoji: string;
  targetTime: string;
  items: FoodItem[];
  consumed: boolean;
}

export interface ExerciseSet {
  load: string;
  reps: string;
  done: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  thumb: string;
  videoLabel: string;
  targetReps: string;
  restTime?: number;
  sets: ExerciseSet[];
  day: string;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  price: number;
  oldPrice?: number;
  promo?: string;
  image: string;
}

export interface Store {
  id: string;
  name: string;
  logo: string;
  rating: number;
  distanceKm: number;
  deliveryFee: number;
  category: "supplements" | "fresh" | "pharmacy";
  etaMin: number;
}

export interface CartLine {
  productId: string;
  qty: number;
}

export interface DayCheck {
  day: string;
  date: number;
  progress: number;
  isToday: boolean;
}

export interface MacrosTriplet {
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Snapshot do payload Supabase usado pra hidratar o store no client.
 * Quando `online` é false, o store opera apenas em memória (fallback).
 */
export interface AppSeed {
  online: boolean;
  user: UserProfile;
  waterMl: number;
  waterGoalMl: number;
  kcalGoal: number;
  macrosGoal: MacrosTriplet;
  meals: Meal[];
  exercises: Exercise[];
  stores: Store[];
  products: Product[];
  streak: number;
  address: string;
  weeklyCalendar?: DayCheck[];
  topTrainers?: Trainer[];
}
