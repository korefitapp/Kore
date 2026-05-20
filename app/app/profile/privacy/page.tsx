"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShieldCheck,
  Download,
  Eye,
  EyeOff,
  Share2,
  Trash2,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface PermissionItem {
  id: string;
  label: string;
  description: string;
}

const PERMISSIONS: PermissionItem[] = [
  {
    id: "profile_visible",
    label: "Perfil visível para outros usuários",
    description: "Seu nome e avatar podem ser vistos na comunidade",
  },
  {
    id: "share_workouts",
    label: "Compartilhar treinos com coach",
    description: "Permite que seu coach visualize seus treinos registrados",
  },
  {
    id: "share_meals",
    label: "Compartilhar refeições com nutricionista",
    description: "Permite que seu nutricionista acesse seu diário alimentar",
  },
  {
    id: "analytics",
    label: "Dados de uso anônimos",
    description: "Ajude a melhorar o KORE com dados anônimos de uso",
  },
];

export default function PrivacyPage() {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    profile_visible: true,
    share_workouts: true,
    share_meals: true,
    analytics: false,
  });

  function togglePermission(id: string) {
    setPermissions((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen bg-kore-bg px-4 pt-4 pb-28 max-w-lg mx-auto"
    >
      {/* Header */}
      <header className="flex items-center gap-3 mb-6">
        <Link
          href="/app/profile"
          className="w-10 h-10 rounded-2xl border border-kore bg-kore-card flex items-center justify-center active:scale-95 transition"
        >
          <ArrowLeft size={18} className="text-kore" />
        </Link>
        <div>
          <p className="text-xs text-muted">Perfil</p>
          <h1 className="text-xl font-extrabold text-kore tracking-tight">
            Privacidade & LGPD
          </h1>
        </div>
      </header>

      {/* Icon header card */}
      <section className="rounded-3xl border border-kore bg-kore-card p-5 shadow-sm mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-kore">
              Seus dados, suas regras
            </h2>
            <p className="text-sm text-muted">
              Conforme a LGPD, você tem total controle sobre seus dados pessoais
            </p>
          </div>
        </div>
      </section>

      {/* Export section */}
      <section className="rounded-3xl border border-kore bg-kore-card overflow-hidden mb-5">
        <p className="px-4 pt-4 pb-2 text-xs font-bold uppercase tracking-wider text-muted">
          Exportação de dados
        </p>

        <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-kore-bg transition border-b border-kore">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-500/10 text-sky-500 flex items-center justify-center flex-shrink-0">
            <Download size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-kore text-sm">
              Exportar meus dados (JSON)
            </p>
            <p className="text-[11px] text-muted">
              Baixe uma cópia completa de todos os seus dados
            </p>
          </div>
          <ChevronRight size={18} className="text-muted flex-shrink-0" />
        </button>

        <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-kore-bg transition">
          <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-500/10 text-violet-500 flex items-center justify-center flex-shrink-0">
            <Share2 size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-kore text-sm">
              Compartilhar dados com profissional
            </p>
            <p className="text-[11px] text-muted">
              Envie seus dados para um coach ou nutricionista
            </p>
          </div>
          <ChevronRight size={18} className="text-muted flex-shrink-0" />
        </button>
      </section>

      {/* Permissions section */}
      <section className="rounded-3xl border border-kore bg-kore-card overflow-hidden mb-5">
        <p className="px-4 pt-4 pb-2 text-xs font-bold uppercase tracking-wider text-muted">
          Permissões de privacidade
        </p>

        {PERMISSIONS.map((perm, i) => (
          <div
            key={perm.id}
            className={`flex items-center gap-3 px-4 py-4 ${
              i !== PERMISSIONS.length - 1 ? "border-b border-kore" : ""
            }`}
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                permissions[perm.id]
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500"
                  : "bg-slate-100 dark:bg-slate-700/30 text-slate-400"
              }`}
            >
              {permissions[perm.id] ? (
                <Eye size={18} />
              ) : (
                <EyeOff size={18} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-kore text-sm">{perm.label}</p>
              <p className="text-[11px] text-muted leading-snug">
                {perm.description}
              </p>
            </div>
            <button
              role="switch"
              aria-checked={permissions[perm.id]}
              onClick={() => togglePermission(perm.id)}
              className={`relative w-12 h-7 rounded-full transition-colors duration-200 flex-shrink-0 ${
                permissions[perm.id]
                  ? "bg-emerald-500"
                  : "bg-slate-300 dark:bg-slate-600"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
                  permissions[perm.id]
                    ? "translate-x-5"
                    : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </section>

      {/* Danger zone */}
      <section className="rounded-3xl border border-rose-200 dark:border-rose-700/50 bg-rose-50/50 dark:bg-rose-500/5 overflow-hidden">
        <p className="px-4 pt-4 pb-2 text-xs font-bold uppercase tracking-wider text-rose-500">
          Zona de perigo
        </p>

        <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-rose-100 dark:active:bg-rose-500/10 transition border-b border-rose-200 dark:border-rose-700/50">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0">
            <Trash2 size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-rose-600 dark:text-rose-400 text-sm">
              Excluir minha conta
            </p>
            <p className="text-[11px] text-rose-400 dark:text-rose-500/70 leading-snug">
              Remove permanentemente todos os seus dados
            </p>
          </div>
          <ChevronRight size={18} className="text-rose-400 flex-shrink-0" />
        </button>
      </section>

      {/* LGPD note */}
      <p className="text-center text-[11px] text-muted mt-5">
        Seus dados são tratados conforme a Lei Geral de Proteção de Dados
        (LGPD). Para mais informações, acesse nossa Política de Privacidade.
      </p>
    </motion.div>
  );
}