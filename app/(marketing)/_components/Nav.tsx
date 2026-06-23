import Link from "next/link";
import { User } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function Nav() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profileData = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .single();
    profileData = data;
  }

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.substring(0, 1).toUpperCase();
  };
  return (
    <header className="sticky top-0 z-30 border-b border-kore-border/60 bg-kore-bg/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="grid h-9 w-9 place-items-center rounded-xl text-base font-black text-white shadow-kore-emerald"
            style={{
              background:
                "linear-gradient(135deg, rgb(var(--kore-emerald)) 0%, rgb(var(--kore-emerald-deep)) 100%)",
            }}
          >
            K
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-black tracking-tight text-kore-ink">
              KORE
            </span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-kore-muted sm:block">
              Super App
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-kore-subink md:flex">
          <a href="#profissionais" className="transition hover:text-kore-ink">
            Para profissionais
          </a>
          <a href="#clientes" className="transition hover:text-kore-ink">
            Para clientes
          </a>
          <a href="#ecossistema" className="transition hover:text-kore-ink">
            Ecossistema
          </a>
        </nav>

        <div className="flex items-center gap-2 flex-shrink-0">
          {user ? (
            <Link
              href="/app"
              className="relative w-10 h-10 rounded-2xl bg-kore-bg border border-kore-border/60 flex items-center justify-center text-kore-ink active:scale-95 transition overflow-hidden shadow-sm hover:border-kore-emerald/50"
              aria-label="Acessar App"
            >
              {profileData?.avatar_url ? (
                <img
                  src={profileData.avatar_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-bold text-sm">
                  {getInitials(profileData?.full_name || user.email || "")}
                </span>
              )}
            </Link>
          ) : (
            <Link
              href="/login"
              className="relative w-10 h-10 rounded-2xl bg-kore-bg border border-kore-border/60 flex items-center justify-center text-kore-ink active:scale-95 transition shadow-sm hover:border-kore-emerald/50 hover:text-kore-emerald"
              aria-label="Entrar"
            >
              <User size={18} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
