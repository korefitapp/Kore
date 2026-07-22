"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { buildFallbackSeed, buildWeek } from "./initial-data";
import type {
  AppSeed,
  CartLine,
  DayCheck,
  Exercise,
  MacrosTriplet,
  Meal,
  Product,
  Store,
  Tab,
  Theme,
  UserProfile,
  Trainer,
} from "./types";

export type ProfileView = "menu" | "health" | "orders" | "notifications" | "privacy" | "settings";

export interface KoreState {
  online: boolean;
  user: UserProfile;
  hydrated: boolean;
  pendingSync: boolean;
  syncQueue: any[];

  tab: Tab;
  setTab: (t: Tab) => void;

  profileView: ProfileView;
  setProfileView: (v: ProfileView) => void;

  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;

  streak: number;
  week: DayCheck[];
  weeklyCalendar: DayCheck[];

  waterMl: number;
  waterGoalMl: number;
  addWater: (ml: number) => Promise<void>;
  setWater: (ml: number) => Promise<void>;

  kcalGoal: number;
  macros: MacrosTriplet;
  macrosGoal: MacrosTriplet;

  meals: Meal[];
  toggleMeal: (mealId: string) => void;
  toggleMealItem: (mealId: string, itemId: string) => void;

  exercises: Exercise[];
  activeDay: string;
  setActiveDay: (day: string) => void;
  activeExerciseId: string | null;
  setActive: (id: string | null) => void;
  updateSet: (
    exId: string,
    setIdx: number,
    patch: { load?: string; reps?: string; done?: boolean },
  ) => void;

  address: string;
  setAddress: (a: string) => void;
  stores: Store[];
  products: Product[];
  topTrainers: Trainer[];
  shopFilter: "all" | "supplements" | "fresh" | "pharmacy";
  setShopFilter: (f: "all" | "supplements" | "fresh" | "pharmacy") => void;

  cart: CartLine[];
  addToCart: (productId: string) => void;
  decFromCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartOpen: boolean;
  setCartOpen: (b: boolean) => void;

  hydrateFromSeed: (seed: AppSeed) => void;
  syncOfflineData: () => Promise<void>;
}

function macrosFromMeals(meals: Meal[]): MacrosTriplet {
  return meals
    .filter((m) => m.consumed)
    .flatMap((m) => m.items)
    .reduce<MacrosTriplet>(
      (acc, it) => ({
        protein: acc.protein + it.protein,
        carbs: acc.carbs + it.carbs,
        fat: acc.fat + it.fat,
      }),
      { protein: 0, carbs: 0, fat: 0 },
    );
}

function getLocalYYYYMMDD() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const fallback = buildFallbackSeed();

export const useKore = create<KoreState>()(
  persist(
    (set, get) => ({
      online: fallback.online,
      user: fallback.user,
      hydrated: false,
      pendingSync: false,
      syncQueue: [],

  tab: "home",
  setTab: (t) => set({ tab: t }),

  profileView: "menu",
  setProfileView: (v) => set({ profileView: v }),

  theme: "light",
  toggleTheme: () =>
    set((s) => {
      const next: Theme = s.theme === "light" ? "dark" : "light";
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", next === "dark");
      }
      return { theme: next };
    }),
  setTheme: (t) =>
    set(() => {
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", t === "dark");
      }
      return { theme: t };
    }),

  streak: fallback.streak,
  week: buildWeek(),
  weeklyCalendar: fallback.weeklyCalendar || [],

  waterMl: fallback.waterMl,
  waterGoalMl: fallback.waterGoalMl,
  addWater: async (ml) => {
    set((s) => {
      const newVal = Math.max(0, Math.min(s.waterGoalMl, s.waterMl + ml));
      // Fire and forget server action sync
      import("../actions").then(({ logWater }) => {
        logWater(newVal, getLocalYYYYMMDD()).catch(() => {
          set((state) => ({ 
            pendingSync: true,
            syncQueue: [...state.syncQueue, { type: 'WATER_CHECK', payload: { ml: newVal, dateISO: getLocalYYYYMMDD() } }]
          }));
        });
      });
      return { waterMl: newVal };
    });
  },
  setWater: async (ml) => {
    set((s) => {
      const newVal = Math.max(0, Math.min(s.waterGoalMl, ml));
      import("../actions").then(({ logWater }) => {
        logWater(newVal, getLocalYYYYMMDD()).catch(() => {
          set((state) => ({ 
            pendingSync: true,
            syncQueue: [...state.syncQueue, { type: 'WATER_CHECK', payload: { ml: newVal, dateISO: getLocalYYYYMMDD() } }]
          }));
        });
      });
      return { waterMl: newVal };
    });
  },

  kcalGoal: fallback.kcalGoal,
  macros: macrosFromMeals(fallback.meals),
  macrosGoal: fallback.macrosGoal,

  meals: fallback.meals,
  toggleMeal: (mealId) =>
    set((s) => {
      const meals = s.meals.map((m) => {
        if (m.id !== mealId) return m;
        const nextConsumed = !m.consumed;
        return {
          ...m,
          consumed: nextConsumed,
          items: m.items.map((it) => ({ ...it, consumed: nextConsumed })),
        };
      });
      set({ pendingSync: true });
      return { meals, macros: macrosFromMeals(meals) };
    }),
  toggleMealItem: (mealId, itemId) =>
    set((s) => {
      const meals = s.meals.map((m) => {
        if (m.id !== mealId) return m;
        const updatedItems = m.items.map((it) =>
          it.id === itemId ? { ...it, consumed: !it.consumed } : it,
        );
        const allConsumed = updatedItems.length > 0 && updatedItems.every((it) => it.consumed);
        return { ...m, items: updatedItems, consumed: allConsumed };
      });
      set({ pendingSync: true });
      return { meals, macros: macrosFromMeals(meals) };
    }),

  exercises: fallback.exercises,
  activeDay: "A",
  setActiveDay: (day) => set({ activeDay: day }),
  activeExerciseId: null,
  setActive: (id) => set({ activeExerciseId: id }),
  updateSet: (exId, setIdx, patch) =>
    set((s) => {
      const exercises = s.exercises.map((e) =>
        e.id !== exId
          ? e
          : {
              ...e,
              sets: e.sets.map((st, i) =>
                i === setIdx ? { ...st, ...patch } : st,
              ),
            },
      );
      set({ pendingSync: true });
      return { exercises };
    }),

  address: fallback.address || "Endereço não definido",
  setAddress: (a) => set({ address: a }),
  stores: fallback.stores || [],
  products: fallback.products || [],
  topTrainers: fallback.topTrainers || [],
  shopFilter: "all",
  setShopFilter: (f) => set({ shopFilter: f }),

  cart: [],
  addToCart: (productId) =>
    set((s) => {
      const existing = s.cart.find((c) => c.productId === productId);
      if (existing) {
        return {
          cart: s.cart.map((c) =>
            c.productId === productId ? { ...c, qty: c.qty + 1 } : c,
          ),
        };
      }
      return { cart: [...s.cart, { productId, qty: 1 }] };
    }),
  decFromCart: (productId) =>
    set((s) => {
      const existing = s.cart.find((c) => c.productId === productId);
      if (!existing) return s;
      if (existing.qty <= 1) {
        return { cart: s.cart.filter((c) => c.productId !== productId) };
      }
      return {
        cart: s.cart.map((c) =>
          c.productId === productId ? { ...c, qty: c.qty - 1 } : c,
        ),
      };
    }),
  removeFromCart: (productId) =>
    set((s) => ({
      cart: s.cart.filter((c) => c.productId !== productId),
    })),
  clearCart: () => set({ cart: [] }),
  cartOpen: false,
  setCartOpen: (b) => set({ cartOpen: b }),

  hydrateFromSeed: (seed) =>
    set((s) => {
      // Se há dados aguardando sincronia offline, priorizamos o estado local
      // sobre o seed para não resetar a tela do usuário que fez check offline.
      if (s.pendingSync) {
        return {
          online: seed.online,
          user: seed.user,
          hydrated: true,
          // Mantemos meals, exercises e waterMl locais
        };
      }
      
      return {
        online: seed.online,
        user: seed.user,
        hydrated: true,
        streak: seed.streak,
        waterMl: seed.waterMl,
        waterGoalMl: seed.waterGoalMl,
        kcalGoal: seed.kcalGoal,
        macros: macrosFromMeals(seed.meals),
        macrosGoal: seed.macrosGoal,
        meals: seed.meals,
        exercises: seed.exercises,
        weeklyCalendar: seed.weeklyCalendar || [],
        stores: seed.stores,
        products: seed.products,
        address: seed.address,
        topTrainers: seed.topTrainers || [],
      };
    }),
    
  syncOfflineData: async () => {
    const state = get();
    if (!state.syncQueue || state.syncQueue.length === 0) {
      set({ pendingSync: false });
      return;
    }
    
    try {
      const { logWater } = await import("../actions");
      const itemsToKeep = [];
      let hasFailures = false;
      
      for (const item of state.syncQueue) {
        try {
          if (item.type === 'WATER_CHECK') {
            await logWater(item.payload.ml, item.payload.dateISO);
          }
        } catch (err) {
          hasFailures = true;
          itemsToKeep.push(item);
        }
      }
      
      set({
        syncQueue: itemsToKeep,
        pendingSync: hasFailures
      });
    } catch (e) {
      // If the import fails or we are completely offline
    }
  }
    }),
    {
      name: "kore-storage",
      partialize: (state) => ({
        theme: state.theme,
        tab: state.tab,
        waterMl: state.waterMl,
        meals: state.meals,
        exercises: state.exercises,
        streak: state.streak,
        weeklyCalendar: state.weeklyCalendar,
        pendingSync: state.pendingSync,
        syncQueue: state.syncQueue,
      }),
    }
  )
);

/**
 * Hook que aplica o seed do Server Component ao store na 1ª montagem.
 * O `app/app/page.tsx` busca o seed do Supabase e passa pra `<AppRoot>`,
 * que chama esse hook. Mantém SSR/CSR alinhados.
 */
export function useKoreHydrate(seed: AppSeed) {
  useEffect(() => {
    useKore.getState().hydrateFromSeed(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed.user.id]);
}

// Selectors
export const selectConsumedKcal = (s: KoreState) =>
  s.meals
    .filter((m) => m.consumed)
    .flatMap((m) => m.items)
    .reduce((acc, it) => acc + it.kcal, 0);

export const selectCartCount = (s: KoreState) =>
  s.cart.reduce((acc, l) => acc + l.qty, 0);

export const selectCartTotal = (s: KoreState) =>
  s.cart.reduce((acc, l) => {
    const p = s.products.find((p) => p.id === l.productId);
    return acc + (p ? p.price * l.qty : 0);
  }, 0);

export const selectBurnedWorkoutKcal = (s: KoreState) => {
  return s.exercises.reduce((total, ex) => {
    const completedSets = ex.sets.filter(st => st.done).length;
    return total + (completedSets * 15);
  }, 0);
};
