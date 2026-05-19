import type { Route } from "next";
import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-kore-border bg-kore-card">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div
                className="grid h-9 w-9 place-items-center rounded-xl text-base font-black text-white"
                style={{
                  background:
                    "linear-gradient(135deg, rgb(var(--kore-emerald)) 0%, rgb(var(--kore-emerald-deep)) 100%)",
                }}
              >
                K
              </div>
              <div>
                <div className="text-sm font-black text-kore-ink">KORE</div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-kore-muted">
                  Super App
                </div>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-kore-subink">
              Saúde · Fitness · Nutrição em um só app. Para clientes, personais,
              nutris e lojistas.
            </p>
          </div>

          <FooterColumn
            title="Plataforma"
            links={[
              { label: "Para profissionais", href: "#profissionais" },
              { label: "Para clientes", href: "#clientes" },
              { label: "Ecossistema", href: "#ecossistema" },
            ]}
          />

          <FooterColumn
            title="Conta"
            links={[
              { label: "Entrar", href: "/login" },
              { label: "Criar conta", href: "/sign-up" },
            ]}
          />

          <FooterColumn
            title="Suporte"
            links={[
              { label: "Centro de ajuda", href: "#" },
              { label: "Contato", href: "#" },
              { label: "Status da plataforma", href: "#" },
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-kore-border pt-6 text-xs text-kore-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} KORE Super App. Todos os direitos reservados.</span>
          <div className="flex gap-5">
            <a href="#" className="transition hover:text-kore-ink">
              Termos
            </a>
            <a href="#" className="transition hover:text-kore-ink">
              Privacidade
            </a>
            <a href="#" className="transition hover:text-kore-ink">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-kore-muted">
        {title}
      </div>
      <ul className="mt-3 space-y-2 text-sm text-kore-subink">
        {links.map((l) => (
          <li key={l.label}>
            {l.href.startsWith("/") ? (
              <Link
                href={l.href as Route}
                className="transition hover:text-kore-ink"
              >
                {l.label}
              </Link>
            ) : (
              <a href={l.href} className="transition hover:text-kore-ink">
                {l.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
