import Link from "next/link";
import { LoginForm } from "./_components/LoginForm";

export const metadata = {
  title: "Entrar",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
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
          KORE
        </h1>
        <p className="mt-1 text-sm text-kore-muted">
          Saúde · Fitness · Nutrição em um só app
        </p>
      </header>

      <LoginForm next={searchParams.next} initialError={searchParams.error} />

      <p className="mt-6 text-center text-sm text-kore-muted">
        Ainda não tem conta?{" "}
        <Link
          href="/sign-up"
          className="font-bold text-kore-emerald-deep hover:underline"
        >
          Cadastre-se
        </Link>
      </p>
    </main>
  );
}
