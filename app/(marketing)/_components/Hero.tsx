import Link from "next/link";
import {
  ArrowRight,
  Dumbbell,
  Apple,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px]"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, rgb(var(--kore-emerald) / 0.18) 0%, rgb(var(--kore-emerald) / 0.04) 50%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-14 sm:px-8 md:pb-24 md:pt-20 lg:grid-cols-2 lg:gap-16">
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-kore-emerald/30 bg-kore-emerald/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-kore-emerald-deep">
            <Sparkles className="h-3 w-3" />
            Saúde · Fitness · Nutrição
          </span>

          <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-kore-ink sm:text-5xl md:text-6xl">
            O super app definitivo para a sua{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, rgb(var(--kore-emerald)) 0%, rgb(var(--kore-emerald-deep)) 100%)",
              }}
            >
              saúde e evolução
            </span>
            .
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-kore-subink sm:text-lg lg:mx-0">
            Treino, nutrição e marketplace local em um só lugar — conectando
            clientes finais, personal trainers, nutricionistas e lojas de
            suplementos no mesmo ecossistema.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link
              href="/sign-up"
              className="group inline-flex items-center gap-2 rounded-xl bg-kore-emerald px-5 py-3 text-sm font-bold text-white shadow-kore-emerald transition hover:brightness-105"
            >
              Criar conta grátis
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-kore-border bg-kore-card px-5 py-3 text-sm font-semibold text-kore-subink transition hover:border-kore-emerald/60 hover:text-kore-ink"
            >
              Já tenho conta
            </Link>
          </div>

          <dl className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-4 text-center lg:mx-0 lg:max-w-none">
            <div>
              <dt className="text-2xl font-black text-kore-ink sm:text-3xl">
                4
              </dt>
              <dd className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-kore-muted">
                perfis B2B2C
              </dd>
            </div>
            <div>
              <dt className="text-2xl font-black text-kore-ink sm:text-3xl">
                ⭐ 4.88
              </dt>
              <dd className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-kore-muted">
                avaliação média
              </dd>
            </div>
            <div>
              <dt className="text-2xl font-black text-kore-ink sm:text-3xl">
                100%
              </dt>
              <dd className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-kore-muted">
                integrado
              </dd>
            </div>
          </dl>
        </div>

        <HeroMock />
      </div>
    </section>
  );
}

function HeroMock() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[40px] opacity-60 blur-2xl"
        style={{
          background:
            "linear-gradient(135deg, rgb(var(--kore-emerald) / 0.45) 0%, rgb(var(--kore-water) / 0.25) 100%)",
        }}
      />
      <div className="relative rounded-[28px] border border-kore-border bg-kore-card p-3 shadow-kore-soft">
        <div className="overflow-hidden rounded-[22px] bg-kore-bg">
          <div className="flex items-center justify-between border-b border-kore-border/70 bg-kore-card px-5 py-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-kore-muted">
                Bom dia
              </div>
              <div className="text-lg font-black text-kore-ink">
                Olá, Helena 👋
              </div>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-kore-emerald/10 text-base">
              🥗
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 px-4 py-4">
            {[
              { icon: Dumbbell, label: "Treino", value: "Push" },
              { icon: Apple, label: "Macros", value: "2.140 kcal" },
              { icon: ShoppingBag, label: "Loja", value: "3 ofertas" },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.label}
                  className="rounded-xl border border-kore-border bg-kore-card p-3"
                >
                  <Icon className="h-4 w-4 text-kore-emerald" />
                  <div className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-kore-muted">
                    {t.label}
                  </div>
                  <div className="text-sm font-bold text-kore-ink">
                    {t.value}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mx-4 mb-4 rounded-2xl border border-kore-border bg-kore-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-kore-muted">
                  Hidratação hoje
                </div>
                <div className="text-2xl font-black text-kore-ink">
                  1,6L{" "}
                  <span className="text-sm font-bold text-kore-muted">
                    / 2,5L
                  </span>
                </div>
              </div>
              <div className="relative h-14 w-14 overflow-hidden rounded-full border border-kore-border">
                <div className="liquid-wave-water absolute inset-x-0 bottom-0 h-[64%]" />
                <div className="relative z-10 grid h-full place-items-center text-xs font-black text-white">
                  64%
                </div>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-kore-border/60">
              <div className="liquid-wave h-full w-2/3" />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] font-semibold text-kore-muted">
              <span>Treino A · concluído</span>
              <span>+18% vs. semana passada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
