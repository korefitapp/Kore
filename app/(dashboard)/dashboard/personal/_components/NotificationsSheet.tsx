"use client";

import { Sheet } from "@/components/ui/sheet";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsSheet({ isOpen, onClose }: Props) {
  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Notificações">
      <div className="p-6 space-y-4">
        {/* Fake Notifications */}
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex gap-3">
          <CheckCircle2 className="text-emerald-500 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-sm font-bold text-kore-ink">Pagamento recebido</p>
            <p className="text-xs text-kore-muted mt-1">O aluno João Silva pagou o plano Mensal Premium.</p>
            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-2">AGORA</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-kore-card border border-kore-border flex gap-3">
          <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-sm font-bold text-kore-ink">Treino pendente</p>
            <p className="text-xs text-kore-muted mt-1">Você tem 2 treinos atrasados para montar.</p>
            <p className="text-[10px] font-bold text-kore-subink mt-2">HÁ 2 HORAS</p>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
