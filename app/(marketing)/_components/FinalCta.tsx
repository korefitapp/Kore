import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 md:pb-24">
      <div
        className="relative overflow-hidden rounded-3xl border border-kore-emerald/30 px-6 py-12 text-center shadow-kore-soft sm:px-12 sm:py-16"
        style={{
          background:
            "linear-gradient(135deg, rgb(var(--kore-emerald) / 0.12) 0%, rgb(var(--kore-water) / 0.08) 100%)",
        }}
      >
        <div
          aria-hidden
          className="absolute -right-24 -top-24 h-72 w-72 rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, rgb(var(--kore-emerald) / 0.35), transparent)",
          }}
        />
        <h2 className="relative text-3xl font-black tracking-tight text-kore-ink sm:text-4xl">
          Pronto para entrar no ecossistema KORE?
        </h2>
        <p className="relative mx-auto mt-3 max-w-xl text-base text-kore-subink">
          Crie sua conta grátis em segundos. Escolha seu perfil — cliente,
          personal, nutricionista ou lojista — e comece agora.
        </p>
        <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
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
            Entrar
          </Link>
        </div>
      </div>
    </section>
  );
}
