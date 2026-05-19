"use client";

import { Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import { useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  signInWithPasswordAction,
  type AuthResult,
} from "@/lib/auth/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm({
  next,
  initialError,
}: {
  next?: string;
  initialError?: string;
}) {
  const [state, action] = useFormState<AuthResult | null, FormData>(
    signInWithPasswordAction,
    initialError ? { ok: false, error: initialError } : null,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [oauthPending, startOAuth] = useTransition();

  async function handleGoogle() {
    startOAuth(async () => {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback${
        next ? `?next=${encodeURIComponent(next)}` : ""
      }`;
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
    });
  }

  return (
    <div className="space-y-5">
      <form action={action} className="space-y-4">
        <Field
          id="identifier"
          name="identifier"
          type="text"
          label="E-mail ou celular"
          autoComplete="username"
          icon={<User size={16} />}
          placeholder="voce@email.com ou (11) 99999-8888"
        />
        <Field
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          label="Senha"
          autoComplete="current-password"
          icon={<Lock size={16} />}
          placeholder="••••••••"
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="text-kore-muted hover:text-kore-ink"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />

        {state && !state.ok && (
          <p className="rounded-lg border border-rose-300/50 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300">
            {state.error}
          </p>
        )}

        <Submit />
      </form>

      <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-kore-muted">
        <span className="h-px flex-1 bg-kore-border" />
        ou continue com
        <span className="h-px flex-1 bg-kore-border" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={oauthPending}
        className="btn-ghost w-full disabled:opacity-60"
      >
        {oauthPending ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <span aria-hidden className="font-black">
            G
          </span>
        )}
        Google
      </button>
    </div>
  );
}

function Field({
  id,
  name,
  type,
  label,
  autoComplete,
  icon,
  placeholder,
  trailing,
}: {
  id: string;
  name: string;
  type: string;
  label: string;
  autoComplete?: string;
  icon?: React.ReactNode;
  placeholder?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-kore-muted">
        {label}
      </span>
      <span className="relative block">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted">
            {icon}
          </span>
        )}
        <input
          id={id}
          name={name}
          type={type}
          required
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="w-full rounded-xl border border-kore-border bg-kore-card py-2.5 pl-9 pr-10 text-sm font-medium text-kore-ink placeholder-kore-muted focus:border-kore-emerald focus:outline-none focus:ring-2 focus:ring-kore-emerald/30"
        />
        {trailing && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {trailing}
          </span>
        )}
      </span>
    </label>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-emerald w-full">
      {pending ? <Loader2 size={16} className="animate-spin" /> : null}
      {pending ? "Entrando…" : "Entrar"}
    </button>
  );
}
