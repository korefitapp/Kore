import { Clock, FileCheck, LogOut, Mail } from "lucide-react";
import { redirect } from "next/navigation";
import { signOutAction } from "@/lib/auth/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Aguardando aprovação",
};

const ROLE_LABEL: Record<string, string> = {
  trainer: "Personal Trainer",
  nutritionist: "Nutricionista",
  merchant: "Lojista",
};

const ROLE_DOC_LABEL: Record<string, string> = {
  trainer: "CREF",
  nutritionist: "CRN",
  merchant: "CNPJ",
};

type PendingProfile = {
  full_name: string;
  role: string;
  status: string;
  cref: string | null;
  crn: string | null;
  cnpj: string | null;
};

export default async function PendingApprovalPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, status, cref, crn, cnpj")
    .eq("id", user.id)
    .maybeSingle<PendingProfile>();

  // Defesa: middleware já barra usuários não-pending, mas se cair aqui,
  // delegamos pro middleware re-redirecionar no próximo request.
  const role = profile?.role ?? "";
  const roleLabel = ROLE_LABEL[role] ?? "Profissional";
  const docLabel = ROLE_DOC_LABEL[role] ?? "Documento";
  const docValue = profile?.cref ?? profile?.crn ?? profile?.cnpj ?? "—";

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
      <header className="mb-8 text-center">
        <div
          className="mx-auto grid h-14 w-14 place-items-center rounded-2xl text-xl font-black text-white shadow-kore-emerald"
          style={{
            background:
              "linear-gradient(135deg, rgb(var(--kore-emerald)) 0%, rgb(var(--kore-emerald-deep)) 100%)",
          }}
        >
          K
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-kore-ink">
          Cadastro em análise
        </h1>
        <p className="mt-2 text-sm text-kore-muted">
          Olá, <span className="font-semibold text-kore-ink">{profile?.full_name || user.email}</span>.
          Estamos avaliando a sua candidatura como {roleLabel}.
        </p>
      </header>

      <section className="card space-y-5 p-6">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-kore-ink">
              Aprovação pendente
            </p>
            <p className="mt-1 text-xs text-kore-muted">
              A equipe KORE valida documentação em até 48 horas úteis. Você
              receberá um e-mail assim que o acesso ao painel for liberado.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-kore-border bg-kore-bg p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-kore-muted">
            Resumo do cadastro
          </p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-kore-muted">Tipo de conta</dt>
              <dd className="font-semibold text-kore-ink">{roleLabel}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-kore-muted">{docLabel}</dt>
              <dd className="font-mono text-xs font-semibold text-kore-ink">
                {docValue}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-kore-muted">E-mail</dt>
              <dd className="text-kore-ink">{user.email}</dd>
            </div>
          </dl>
        </div>

        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <FileCheck size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-kore-ink">Próximos passos</p>
            <p className="mt-1 text-xs text-kore-muted">
              Se precisarmos de documentação complementar, vamos te avisar pelo
              e-mail acima. Não é necessário fazer nada por enquanto.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400">
            <Mail size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-kore-ink">Dúvidas?</p>
            <p className="mt-1 text-xs text-kore-muted">
              Fale com a gente em{" "}
              <a
                href="mailto:onboarding@kore.fit"
                className="font-bold text-kore-emerald-deep hover:underline"
              >
                onboarding@kore.fit
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <form action={signOutAction} className="mt-6">
        <button
          type="submit"
          className="btn-ghost w-full"
        >
          <LogOut size={15} />
          Sair da conta
        </button>
      </form>
    </main>
  );
}
