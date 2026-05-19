import {
  Dumbbell,
  Apple,
  ShoppingBag,
  HeartPulse,
  type LucideIcon,
} from "lucide-react";

const FEATURES: Array<{
  icon: LucideIcon;
  title: string;
  description: string;
}> = [
  {
    icon: Dumbbell,
    title: "Treinos que se adaptam a você",
    description:
      "Receba a planilha do seu personal direto no app. Marque séries, descansos e veja a evolução de carga.",
  },
  {
    icon: Apple,
    title: "Macros e refeições no detalhe",
    description:
      "Cardápio do seu nutri com macros calculados. Bata suas metas de proteína, carbo, gordura e hidratação.",
  },
  {
    icon: ShoppingBag,
    title: "Loja local sem sair do app",
    description:
      "Compre suplementos e acessórios das lojas parceiras. Pix, crédito ou boleto, com entrega na sua cidade.",
  },
  {
    icon: HeartPulse,
    title: "Tudo no mesmo lugar",
    description:
      "Métricas, conversas com seu time de saúde e check-ins de bem-estar reunidos em uma única timeline.",
  },
];

export function ClientFeatures() {
  return (
    <section
      id="clientes"
      className="relative border-y border-kore-border bg-kore-card"
    >
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
        <header className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-kore-emerald/30 bg-kore-emerald/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-kore-emerald-deep">
            Para clientes
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-kore-ink sm:text-4xl">
            Treino, nutrição e compras conectados ao seu dia a dia.
          </h2>
          <p className="mt-3 text-base text-kore-subink">
            Um único app para acompanhar tudo o que importa pra sua evolução —
            sem precisar abrir três aplicativos diferentes.
          </p>
        </header>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <article
                key={f.title}
                className="rounded-2xl border border-kore-border bg-kore-bg p-5"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-kore-emerald/10 text-kore-emerald-deep">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-black leading-tight text-kore-ink">
                  {f.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-kore-subink">
                  {f.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
