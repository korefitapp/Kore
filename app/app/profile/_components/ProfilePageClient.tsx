"use client";

import { PerfilTab } from "@/app/app/_components/perfil/PerfilTab";
import { useKoreHydrate } from "@/app/app/_components/store";
import type { AppSeed } from "@/app/app/_components/types";

export function ProfilePageClient({ seed }: { seed: AppSeed }) {
  useKoreHydrate(seed);

  return (
    <div className="min-h-screen flex flex-col bg-kore-bg text-kore">
      <main className="flex-1 mx-auto w-full max-w-md px-4 pt-5 pb-28">
        <PerfilTab />
      </main>
    </div>
  );
}