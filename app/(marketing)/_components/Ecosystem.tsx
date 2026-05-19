import { Activity, MessagesSquare, ShieldCheck, Zap } from "lucide-react";

const PILLARS = [
  {
    icon: Activity,
    title: "Dados em tempo real",
    description:
      "Aderência, macros e pedidos sincronizados entre cliente, profissional e loja.",
  },
  {
    icon: MessagesSquare,
    title: "Comunicação integrada",
    description:
      "Mensagens entre cliente, personal, nutri e loja sem app de terceiros.",
  },
  {
    icon: ShieldCheck,
    title: "Segurança Supabase",
    description:
      "Autenticação por role, RBAC e RLS — cada um vê só o que deveria ver.",
  },
  {
    icon: Zap,
    title: "Performance Next 14",
    description:
      "Server Components, edge middleware e streaming para uma experiência instantânea.",
  },
];

export function Ecosystem() {
  return (
    <section
      id="ecossistema"
      className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24"
    >
      <div className="grid gap-12 lg:grid-cols-[1fr,1.1fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-kore-border bg-kore-card px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-kore-emerald-deep">
            Ecossistema
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-kore-ink sm:text-4xl">
            Um ecossistema que conecta todas as pontas da sua jornada.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-kore-subink">
            KORE não é um app a mais. É a plataforma que une quem treina, quem
            orienta, quem prescreve e quem vende — no mesmo fluxo, em tempo
            real.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="rounded-2xl border border-kore-border bg-kore-card p-5 shadow-kore-soft"
              >
                <Icon className="h-5 w-5 text-kore-emerald" />
                <h3 className="mt-3 text-base font-black text-kore-ink">
                  {p.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-kore-subink">
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
