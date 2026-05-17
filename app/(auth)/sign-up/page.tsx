import Link from "next/link";
import { SignUpForm } from "./_components/SignUpForm";

export const metadata = {
  title: "Criar conta",
};

export default function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
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
          Criar conta KORE
        </h1>
        <p className="mt-1 text-sm text-kore-muted">
          Comece grátis · cancele quando quiser
        </p>
      </header>

      <SignUpForm />

      <p className="mt-6 text-center text-sm text-kore-muted">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="font-bold text-kore-emerald-deep hover:underline"
        >
          Entrar
        </Link>
      </p>
    </main>
  );
}
