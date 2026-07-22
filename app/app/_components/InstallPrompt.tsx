"use client";

import { useState, useEffect } from "react";
import { Download, X, Share } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true); // default true to avoid flash
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandAloneMatch = window.matchMedia("(display-mode: standalone)").matches;
    const isPWA = isStandAloneMatch || (window.navigator as any).standalone === true;
    setIsStandalone(isPWA);

    // If installed, we do nothing
    if (isPWA) return;

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isApple = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isApple);

    // If it's iOS and not standalone, we can show our prompt (after a small delay)
    if (isApple) {
      setTimeout(() => setShowPrompt(true), 2000);
    }

    // Handle Android (Chrome) beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Prevent Chrome 67+ from automatically showing the prompt
      setDeferredPrompt(e); // Stash the event so it can be triggered later.
      setShowPrompt(true); // Show our custom UI
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  if (isStandalone) return null;

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }
    
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSInstructions(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && !showIOSInstructions && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 left-4 right-4 z-50 p-4 bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4"
        >
          <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
            <Download className="w-6 h-6" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
              Instale o App KORE
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Acesso rápido e offline.
            </p>
          </div>

          <button
            onClick={handleInstallClick}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-full transition-colors"
          >
            Instalar
          </button>
          
          <button
            onClick={handleDismiss}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {showIOSInstructions && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-50 p-5 bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800"
        >
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>

          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
            Como instalar no iPhone
          </h3>
          <ol className="text-sm text-slate-600 dark:text-slate-300 space-y-4">
            <li className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-medium text-xs">1</span>
              <div>Toque no botão Compartilhar <Share className="w-4 h-4 inline-block mx-1" /> na barra inferior do Safari.</div>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-medium text-xs">2</span>
              <div>Role o menu para baixo e selecione <br/><strong className="text-emerald-600 dark:text-emerald-400">Adicionar à Tela de Início</strong>.</div>
            </li>
          </ol>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
