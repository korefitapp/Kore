import { LogOut } from "lucide-react";

interface SidebarUserCardProps {
  name: string;
  subtitle: string;
  avatar: string;
}

export function SidebarUserCard({
  name,
  subtitle,
  avatar,
}: SidebarUserCardProps) {
  return (
    <form action="/auth/sign-out" method="post" className="w-full">
      <button
        type="submit"
        title="Sair da conta"
        aria-label={`Sair da conta de ${name}`}
        className="group w-full rounded-2xl border border-kore-border bg-kore-bg/60 p-3 flex items-center gap-3 text-left hover:border-kore-emerald/40 hover:bg-kore-bg active:scale-[0.98] transition"
      >
        <div className="w-10 h-10 rounded-xl bg-kore-emerald-soft text-2xl grid place-items-center flex-shrink-0">
          {avatar}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-kore-ink truncate">{name}</p>
          <p className="text-[11px] text-kore-muted truncate">{subtitle}</p>
        </div>
        <LogOut
          size={16}
          className="text-kore-muted group-hover:text-kore-emerald-deep transition flex-shrink-0"
          aria-hidden="true"
        />
      </button>
    </form>
  );
}
