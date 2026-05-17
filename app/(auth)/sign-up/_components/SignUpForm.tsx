"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import {
  signUpWithPasswordAction,
  type AuthResult,
} from "@/lib/auth/actions";

export function SignUpForm() {
  const [state, action] = useFormState<AuthResult | null, FormData>(
    signUpWithPasswordAction,
    null,
  );

  if (state?.ok) {
    return (
      <div className="rounded-2xl border border-emerald-300/50 bg-emerald-50 p-5 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
        <CheckCircle2
          className="mx-auto text-kore-emerald-deep"
          size={24}
          strokeWidth={2.5}
        />
        <p className="mt-2 text-sm font-bold text-kore-ink">
          Confirme o seu e-mail
        </p>
        <p className="mt-1 text-xs text-kore-muted">
          Enviamos um link para validar a conta. Clique para finalizar o
          cadastro.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <Field id="fullName" name="fullName" type="text" label="Nome completo" />
      <Field id="email" name="email" type="email" label="E-mail" />
      <Field
        id="password"
        name="password"
        type="password"
        label="Senha (mínimo 8 caracteres)"
      />

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
}: {
  id: string;
  name: string;
  type: string;
  label: string;
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
