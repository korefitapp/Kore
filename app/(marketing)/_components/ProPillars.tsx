import {
  Dumbbell,
  Salad,
  Store,
  type LucideIcon,
  ArrowUpRight,
} from "lucide-react";

const PILLARS: Array<{
  icon: LucideIcon;
  badge: string;
  title: string;
  description: string;
  bullets: string[];
  accent: string;
  accentSoft: string;
}> = [
  {
    icon: Dumbbell,
    badge: "Para Personal Trainers",
    title: "Sua academia gerencial em um só painel.",
    description:
      "Monte treinos, acompanhe aderência dos alunos com sparklines, agende sessões e cobre online sem planilha.",
    bullets: [
      "Biblioteca de treinos + templates",
      "Aderência por aluno em tempo real",
      "Agenda semanal e financeiro",
    ],
    accent: "rgb(var(--kore-emerald))",
    accentSoft: "rgb(var(--kore-emerald) / 0.10)",
  },
  {
    icon: Salad,
    badge: "Para Nutricionistas",
    title: "Cardápios, evolução e consultas no mesmo lugar.",
    description:
      "Banco de alimentos pronto, montagem rápida de cardápios e gráficos semanais de macros por paciente.",
    bullets: [
      "Banco de alimentos com macros",
      "Aderência ao plano alimentar",
      "Consultas e mensagens integradas",
    ],
    accent: "rgb(var(--kore-water-deep))",
    accentSoft: "rgb(var(--kore-water) / 0.12)",
  },
  {
    icon: Store,
    badge: "Para Lojistas",
    title: "Marketplace local com pedidos, estoque e financeiro.",
    description:
      "Receba pedidos do app, controle ruptura de estoque, dispare promoções e acompanhe faturamento em tempo real.",
    bullets: [
      "Pedidos com Pix, Crédito e Boleto",
      "Alertas de estoque crítico",
      "Top vendidos e faturamento 7 dias",
    ],
    accent: "rgb(245 158 11)",
    accentSoft: "rgb(245 158 11 / 0.12)",
  },
];

export function ProPillars() {
  return (
    <section
      id="profissionais"
      className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24"
    >
      <header className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-kore-border bg-kore-card px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-kore-emerald-deep">
          Para profissionais
        </span>
        <h2 className="mt-4 text-3xl font-black tracking-tight text-kore-ink sm:text-4xl">
          Vire um parceiro KORE e cresça com a gente.
        </h2>
        <p className="mt-3 text-base text-kore-subink">
          Três painéis especializados para Personal, Nutri e Loja. Mesmo design
          system, dados em tempo real, gestão de ponta a ponta.
        </p>
      </header>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {PILLARS.map((p) => {
          const Icon = p.icon;
          return (
            <article
              key={p.title}
              className="group relative flex flex-col rounded-2xl border border-kore-border bg-kore-card p-6 shadow-kore-soft transition hover:-translate-y-0.5 hover:border-kore-emerald/40"
            >
              <div
                className="grid h-11 w-11 place-items-center rounded-xl"
                style={{ backgroundColor: p.accentSoft, color: p.accent }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-kore-muted">
                {p.badge}
              </div>
              <h3 className="mt-1 text-lg font-black leading-tight text-kore-ink">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-kore-subink">
                {p.description}
              </p>
              <ul className="mt-5 space-y-2">
                {p.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 text-sm text-kore-subink"
                  >
                    <span
                      className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: p.accent }}
                    />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-center gap-1.5 text-sm font-bold text-kore-emerald-deep opacity-0 transition group-hover:opacity-100">
                Saiba mais <ArrowUpRight className="h-4 w-4" />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
