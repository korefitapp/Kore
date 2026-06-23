"use client";

import { Modal } from "@/components/ui/modal";
import { LifeBuoy, Mail, MessageCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpCenterModal({ isOpen, onClose }: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Centro de Ajuda"
      description="Como podemos te ajudar hoje?"
    >
      <div className="space-y-3">
        <a href="mailto:suporte@kore.com" className="w-full flex items-center gap-4 p-4 rounded-2xl bg-kore-card border border-kore-border hover:border-kore-emerald/50 hover:shadow-kore-emerald transition group">
          <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 grid place-items-center text-violet-600">
            <Mail size={18} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-kore-ink group-hover:text-kore-emerald transition">Falar com o Suporte</p>
            <p className="text-xs text-kore-muted mt-0.5">Envie um e-mail para nossa equipe.</p>
          </div>
        </a>
        
        <button type="button" onClick={onClose} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-kore-card border border-kore-border hover:border-kore-emerald/50 hover:shadow-kore-emerald transition group">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 grid place-items-center text-emerald-600">
            <MessageCircle size={18} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-kore-ink group-hover:text-kore-emerald transition">WhatsApp</p>
            <p className="text-xs text-kore-muted mt-0.5">Resposta em até 2 horas úteis.</p>
          </div>
        </button>

        <button type="button" onClick={onClose} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-kore-card border border-kore-border hover:border-kore-emerald/50 hover:shadow-kore-emerald transition group">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 grid place-items-center text-blue-600">
            <LifeBuoy size={18} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-kore-ink group-hover:text-kore-emerald transition">Central de Artigos</p>
            <p className="text-xs text-kore-muted mt-0.5">Tutoriais e dúvidas frequentes.</p>
          </div>
        </button>
      </div>
    </Modal>
  );
}
