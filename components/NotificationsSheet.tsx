"use client";

import { useEffect, useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { CheckCircle2, AlertCircle, Info, Loader2, Bell } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type NotificationRow = {
  id: string;
  title: string;
  message: string;
  type: "success" | "warning" | "info" | "error";
  is_read: boolean;
  created_at: string;
};

export function NotificationsSheet({ isOpen, onClose }: Props) {
  const supabase = createSupabaseBrowserClient();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  async function fetchNotifications() {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      setNotifications(data as NotificationRow[]);
    }
    setLoading(false);
  }

  const renderIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="text-emerald-500 flex-shrink-0 mt-0.5" size={18} />;
      case "warning":
      case "error":
        return <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />;
      default:
        return <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />;
    }
  };

  const renderBgColor = (type: string, isRead: boolean) => {
    if (isRead) return "bg-kore-card border-kore-border";
    switch (type) {
      case "success":
        return "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20";
      case "warning":
      case "error":
        return "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20";
      default:
        return "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20";
    }
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Notificações">
      <div className="p-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-kore-muted">
            <Loader2 className="animate-spin mb-4" size={24} />
            <p className="text-sm">Buscando notificações...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 bg-kore-bg rounded-full flex items-center justify-center mb-4">
              <Bell className="text-kore-muted" size={20} />
            </div>
            <p className="text-sm font-bold text-kore-ink">Nenhuma notificação</p>
            <p className="text-xs text-kore-subink mt-1 max-w-[200px]">
              Você está em dia com todas as suas atualizações.
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border flex gap-3 ${renderBgColor(notif.type, notif.is_read)}`}
            >
              {renderIcon(notif.type)}
              <div>
                <p className="text-sm font-bold text-kore-ink">{notif.title}</p>
                <p className="text-xs text-kore-muted mt-1">{notif.message}</p>
                <p className="text-[10px] font-bold text-kore-subink mt-2 uppercase">
                  {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Sheet>
  );
}
