"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useKore, useKoreHydrate } from "./store";
import { BottomNav } from "./BottomNav";
import { HomeTab } from "./home/HomeTab";
import { DietaTab } from "./dieta/DietaTab";
import { TreinoTab } from "./treino/TreinoTab";
import { ShopTab } from "./shop/ShopTab";
import { PerfilTab } from "./perfil/PerfilTab";
import { CartDrawer } from "./shop/CartDrawer";
import { InstallPrompt } from "./InstallPrompt";
import { Loader2 } from "lucide-react";
import type { AppSeed } from "./types";

export function AppRoot({ seed }: { seed: AppSeed }) {
  useKoreHydrate(seed);
  const hydrated = useKore((s) => s.hydrated);
  const tab = useKore((s) => s.tab);

  useEffect(() => {
    const handleOnline = () => {
      useKore.getState().syncOfflineData();
    };

    window.addEventListener("online", handleOnline);
    // Tenta sincronizar logo na montagem caso tenha pendências e internet
    if (navigator.onLine) {
      handleOnline();
    }

    return () => window.removeEventListener("online", handleOnline);
  }, []);

  if (!hydrated) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-slate-900 text-white">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex flex-col items-center"
        >
          <div className="w-20 h-20 bg-emerald-500 rounded-[24px] rotate-45 flex items-center justify-center shadow-[0_0_40px_rgba(52,211,153,0.4)] mb-10">
            <span className="-rotate-45 font-black text-4xl tracking-tighter text-slate-900">K</span>
          </div>
          <Loader2 className="animate-spin text-emerald-500" size={28} strokeWidth={3} />
          <p className="mt-6 text-[10px] font-extrabold tracking-[0.3em] text-emerald-500/80 uppercase">
            Sincronizando
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-white transition-colors selection:bg-emerald-500/30">
      <InstallPrompt />
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
