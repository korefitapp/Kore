"use client";

import { create } from "zustand";
import type { OrderStatus, SidebarKey } from "./types";

export type OrderFilter = "all" | OrderStatus;

interface ShopState {
  section: SidebarKey;
  setSection: (s: SidebarKey) => void;
  orderFilter: OrderFilter;
  setOrderFilter: (f: OrderFilter) => void;
  orderQuery: string;
  setOrderQuery: (q: string) => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (v: boolean) => void;
}

export const useShop = create<ShopState>((set) => ({
  section: "overview",
  setSection: (s) => set({ section: s }),
  orderFilter: "all",
  setOrderFilter: (f) => set({ orderFilter: f }),
  orderQuery: "",
  setOrderQuery: (q) => set({ orderQuery: q }),
  mobileNavOpen: false,
  setMobileNavOpen: (v) => set({ mobileNavOpen: v }),
}));
