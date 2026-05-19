"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useKore, useKoreHydrate } from "./store";
import { BottomNav } from "./BottomNav";
import { HomeTab } from "./home/HomeTab";
import { DietaTab } from "./dieta/DietaTab";
import { TreinoTab } from "./treino/TreinoTab";
import { ShopTab } from "./shop/ShopTab";
import { PerfilTab } from "./perfil/PerfilTab";
import { CartDrawer } from "./shop/CartDrawer";
import type { AppSeed } from "./types";

export function AppRoot({ seed }: { seed: AppSeed }) {
  useKoreHydrate(seed);
  const tab = useKore((s) => s.tab);

  return (
    <div className="min-h-screen flex flex-col bg-kore-bg text-kore">
      <main className="flex-1 mx-auto w-full max-w-md px-4 pt-5 pb-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {tab === "home" && <HomeTab />}
            {tab === "dieta" && <DietaTab />}
            {tab === "treino" && <TreinoTab />}
            {tab === "shop" && <ShopTab />}
            {tab === "perfil" && <PerfilTab />}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
      <CartDrawer />
    </div>
  );
}
