"use client";

import {
  Activity,
  Apple,
  CheckCircle2,
  Loader2,
  Store,
  User as UserIcon,
} from "lucide-react";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  signUpWithPasswordAction,
  type AuthResult,
} from "@/lib/auth/actions";

type Role = "client" | "trainer" | "nutritionist" | "merchant";

const ROLES: {
  key: Role;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "client",
    label: "Cliente",
    description: "Acompanhe treinos, refeições e compras.",
    icon: <UserIcon size={18} />,
  },
  {
    key: "trainer",
    label: "Personal Trainer",
    description: "Gerencie alunos, treinos e financeiro.",
    icon: <Activity size={18} />,
  },
  {
    key: "nutritionist",
    label: "Nutricionista",
    description: "Atenda pacientes e crie cardápios.",
    icon: <Apple size={18} />,
  },
  {
    key: "merchant",
    label: "Lojista",
    description: "Venda produtos no marketplace KORE.",
    icon: <Store size={18} />,
  },
];

export function SignUpForm() {
  const [state, action] = useFormState<AuthResult | null, FormData>(
    signUpWithPasswordAction,
    null,
  );
  const [role, setRole] = useState<Role>("client");

  if (state?.ok) {
    return (
      <div className="rounded-2xl border border-emerald-300/50 bg-emerald-50 p-5 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
        <CheckCircle2
          className="mx-auto text-kore-emerald-deep"
          size={24}
          strokeWidth={2.5}
        />
        <p className="mt-2 text-sm font-bold text-kore-ink">
          {role === "client"
            ? "Confirme o seu e-mail"
            : "Cadastro recebido!"}
        </p>
        <p className="mt-1 text-xs text-kore-muted">
          {role === "client"
            ? "Enviamos um link para validar a conta. Clique para finalizar o cadastro e entrar."
            : "Enviamos um link para validar o e-mail. Após confirmar, a equipe KORE vai analisar a sua documentação em até 48 horas úteis."}
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <div>
        <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-kore-muted">
          Eu sou
        </span>
        <input type="hidden" name="role" value={role} />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ROLES.map((r) => {
            const active = role === r.key;
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => setRole(r.key)}
                className={`group flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                  active
                    ? "border-kore-emerald bg-kore-emerald/5 ring-2 ring-kore-emerald/30"
                    : "border-kore-border bg-kore-card hover:border-kore-emerald/40"
                }`}
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition ${
                    active
                      ? "bg-kore-emerald text-white"
                      : "bg-kore-bg text-kore-muted group-hover:text-kore-ink"
                  }`}
                >
                  {r.icon}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-bold text-kore-ink">
                    {r.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-kore-muted">
                    {r.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Field id="fullName" name="fullName" type="text" label="Nome completo" />
      <Field
        id="email"
        name="email"
        type="email"
        label="E-mail"
        autoComplete="email"
      />
      <Field
        id="phone"
        name="phone"
        type="tel"
        label="Celular (com DDD)"
        autoComplete="tel"
        placeholder="(11) 99999-8888"
      />

      {role === "trainer" && (
        <Field
          id="cref"
          name="cref"
          type="text"
          label="CREF (registro profissional)"
          placeholder="010234-G/SP"
        />
      )}
      {role === "nutritionist" && (
        <Field
          id="crn"
          name="crn"
          type="text"
          label="CRN (registro profissional)"
          placeholder="CRN-3 12.345"
        />
      )}
      {role === "merchant" && (
        <Field
          id="cnpj"
          name="cnpj"
          type="text"
          label="CNPJ da loja"
          placeholder="00.000.000/0000-00"
        />
      )}

      <Field
        id="password"
        name="password"
        type="password"
        label="Senha (mínimo 8 caracteres)"
        autoComplete="new-password"
      />

      {role !== "client" && (
        <p className="rounded-lg border border-amber-300/50 bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          Conta profissional fica em análise por até 48h úteis antes de
          acessar o painel.
        </p>
      )}

      {state && !state.ok && (
        <p className="rounded-lg border border-rose-300/50 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300">
          {state.error}
        </p>
      )}

      <Submit />
    </form>
  );
}

function Field({
  id,
  name,
  type,
  label,
  autoComplete,
  placeholder,
}: {
  id: string;
  name: string;
  type: string;
  label: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-kore-muted">
        {label}
      </span>
      <input
        id={id}
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full rounded-xl border border-kore-border bg-kore-card px-3 py-2.5 text-sm font-medium text-kore-ink placeholder-kore-muted focus:border-kore-emerald focus:outline-none focus:ring-2 focus:ring-kore-emerald/30"
      />
    </label>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-emerald w-full">
      {pending ? <Loader2 size={16} className="animate-spin" /> : null}
      {pending ? "Criando…" : "Criar conta"}
    </button>
  );
}
