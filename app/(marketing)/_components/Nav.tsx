import Link from "next/link";

export function Nav() {
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

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden text-sm font-semibold text-kore-subink transition hover:text-kore-ink sm:inline"
          >
            Entrar
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center rounded-xl bg-kore-emerald px-3.5 py-2 text-sm font-bold text-white shadow-kore-emerald transition hover:brightness-105"
          >
            Criar conta grátis
          </Link>
        </div>
      </div>
    </header>
  );
}
