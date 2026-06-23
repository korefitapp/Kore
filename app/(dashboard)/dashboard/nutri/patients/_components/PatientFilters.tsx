"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";

const FILTERS = [
  { id: "todos", label: "Todos" },
  { id: "em-dia", label: "Em dia" },
  { id: "reavaliar", label: "Reavaliar" },
  { id: "atencao", label: "Atenção" },
];

export function PatientFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const currentFilter = searchParams.get("filter") || "todos";

  const handleFilter = (id: string) => {
    const params = new URLSearchParams(searchParams);
    if (id === "todos") {
      params.delete("filter");
    } else {
      params.set("filter", id);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTERS.map((f) => {
        const isActive = currentFilter === f.id;
        return (
          <button
            key={f.id}
            onClick={() => handleFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              isActive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-kore-card border border-kore-border text-kore-muted hover:text-kore-ink hover:border-kore-border/80"
            }`}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
