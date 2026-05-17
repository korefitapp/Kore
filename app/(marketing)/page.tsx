import Link from "next/link";

export default function MarketingHome() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div
        className="grid h-16 w-16 place-items-center rounded-2xl text-2xl font-black text-white shadow-kore-emerald"
        style={{
          background:
            "linear-gradient(135deg, rgb(var(--kore-emerald)) 0%, rgb(var(--kore-emerald-deep)) 100%)",
        }}
      >
        K
      </div>
      <div className="space-y-3">
        <h1 className="text-5xl font-black tracking-tight text-kore-ink">
          KORE
        </h1>
        <p className="text-base text-kore-muted">
          Saúde · Fitness · Nutrição em um só app. Plataforma B2B2C para
          clientes finais, personais, nutricionistas e lojistas locais.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/login" className="btn-emerald">
          Entrar
        </Link>
        <Link href="/sign-up" className="btn-ghost">
          Criar conta
        </Link>
      </div>

      <p className="text-xs text-kore-muted">
        🚧 Em construção · próximo passo: migração da Home autenticada vinda do
        protótipo Vite.
      </p>
    </main>
  );
}
