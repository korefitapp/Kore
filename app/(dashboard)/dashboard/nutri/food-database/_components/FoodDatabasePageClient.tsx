"use client";

import { useState } from "react";
import {
  Apple,
  Edit3,
  Plus,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { MobileSidebar, Sidebar } from "../../_components/Sidebar";
import { Topbar } from "../../_components/Topbar";

/* ── Types ──────────────────────────────────────────────────── */
type Category =
  | "proteinas"
  | "carboidratos"
  | "gorduras"
  | "frutas-verduras"
  | "suplementos";

interface RealFoodItem {
  id: string;
  name: string;
  base_amount: number;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  created_by: string | null;
}

const CATEGORY_FILTERS: { key: Category | "all"; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "proteinas", label: "Proteínas" },
  { key: "carboidratos", label: "Carboidratos" },
  { key: "gorduras", label: "Gorduras" },
  { key: "suplementos", label: "Suplementos" },
];

const CATEGORY_LABELS: Record<Category, string> = {
  proteinas: "Proteínas",
  carboidratos: "Carboidratos",
  gorduras: "Gorduras",
  "frutas-verduras": "Frutas e Verduras",
  suplementos: "Suplementos",
};

const CATEGORY_COLORS: Record<Category, string> = {
  proteinas:
    "bg-blue-50 text-blue-700 dark:bg-blue-500/12 dark:text-blue-300 ring-1 ring-inset ring-blue-200/70 dark:ring-blue-500/30",
  carboidratos:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/12 dark:text-amber-300 ring-1 ring-inset ring-amber-200/70 dark:ring-amber-500/30",
  gorduras:
    "bg-orange-50 text-orange-700 dark:bg-orange-500/12 dark:text-orange-300 ring-1 ring-inset ring-orange-200/70 dark:ring-orange-500/30",
  "frutas-verduras":
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300 ring-1 ring-inset ring-emerald-200/70 dark:ring-emerald-500/30",
  suplementos:
    "bg-violet-50 text-violet-700 dark:bg-violet-500/12 dark:text-violet-300 ring-1 ring-inset ring-violet-200/70 dark:ring-violet-500/30",
};

/* ── Inferência de Categoria ────────────────────────────────── */
function inferFoodCategory(name: string, protein: number, carbs: number, fat: number): Category {
  // Exceção: Suplementos (identificados por palavras-chave)
  const n = name.toLowerCase();
  if (
    n.includes("whey") ||
    n.includes("creatina") ||
    n.includes("pré-treino") ||
    n.includes("pre-treino") ||
    n.includes("blend") ||
    n.includes("hipercalórico") ||
    n.includes("hipercalorico") ||
    n.includes("maltodextrina") ||
    n.includes("albumina") ||
    n.includes("waxy maize") ||
    n.includes("barra de proteína")
  ) {
    return "suplementos";
  }

  // Calculamos as calorias provenientes de cada macro para ver qual domina
  const pKcal = protein * 4;
  const cKcal = carbs * 4;
  const fKcal = fat * 9;

  if (pKcal >= cKcal && pKcal >= fKcal) return "proteinas";
  if (cKcal >= pKcal && cKcal >= fKcal) return "carboidratos";
  return "gorduras";
}

/* ── Component ──────────────────────────────────────────────── */
export function FoodDatabasePageClient({ initialFoods }: { initialFoods: RealFoodItem[] }) {
  const [filter, setFilter] = useState<Category | "all">("all");
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Enriquecer os itens reais com a categoria inferida
  const enrichedFoods = initialFoods.map(food => ({
    ...food,
    inferredCategory: inferFoodCategory(food.name, food.protein_g, food.carbs_g, food.fat_g)
  }));

  const filtered = enrichedFoods.filter((f) => {
    if (filter !== "all" && f.inferredCategory !== filter) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      if (!f.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Paginação Client-Side (super rápida porque a lista tá na memória)
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFoods = filtered.slice(startIndex, startIndex + itemsPerPage);

  // Reseta a paginação se o filtro ou busca mudar
  const handleQueryChange = (q: string) => {
    setQuery(q);
    setCurrentPage(1);
  };
  const handleFilterChange = (f: Category | "all") => {
    setFilter(f);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex bg-kore-bg text-kore-ink">
      <Sidebar />
      <MobileSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />

        <main className="flex-1 px-3 sm:px-6 py-6 space-y-6">
          {/* ── Header ───────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 grid place-items-center">
                <Apple size={20} className="text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">
                  Banco de Alimentos
                </h1>
                <p className="text-sm text-kore-muted mt-0.5">
                  {initialFoods.length} alimentos cadastrados · {filtered.length} filtrados
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-emerald text-sm px-4 py-2.5 inline-flex items-center gap-2 self-start sm:self-auto"
              onClick={() => {
                const { toast } = require("@/store/useToastStore");
                toast.info("Função de Cadastrar Alimento conectada à Server Action 'createFood(foodData)' pendente de UI. O created_by será definido como ID da Nutri.");
              }}
            >
              <Plus size={16} strokeWidth={2.8} />
              Cadastrar Alimento
            </button>
          </div>

          {/* ── Filters & Search ─────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted"
              />
              <input
                placeholder="Buscar alimento…"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:border-kore-emerald transition"
              />
            </div>

            <div className="flex items-center bg-kore-bg rounded-xl p-0.5 border border-kore-border overflow-x-auto">
              {CATEGORY_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => handleFilterChange(f.key)}
                  className={`relative px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition ${
                    filter === f.key
                      ? "text-kore-ink"
                      : "text-kore-muted hover:text-kore-ink"
                  }`}
                >
                  {filter === f.key && (
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-kore-card rounded-lg shadow-kore-soft"
                    />
                  )}
                  <span className="relative">{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Table ────────────────────────────────────────── */}
          <section className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-kore-muted font-bold bg-kore-bg/60 border-y border-kore-border">
                    <th className="text-left font-bold py-3 px-5">
                      Alimento
                    </th>
                    <th className="text-left font-bold py-3 px-3">
                      Categoria (Inferida)
                    </th>
                    <th className="text-left font-bold py-3 px-3">
                      Porção
                    </th>
                    <th className="text-right font-bold py-3 px-3 tabular-nums">
                      kcal
                    </th>
                    <th className="text-right font-bold py-3 px-3 tabular-nums">
                      Proteína
                    </th>
                    <th className="text-right font-bold py-3 px-3 tabular-nums">
                      Carboidratos
                    </th>
                    <th className="text-right font-bold py-3 px-3 tabular-nums">
                      Gorduras
                    </th>
                    <th className="text-right font-bold py-3 px-5 w-28">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedFoods.map((food) => (
                    <FoodRow key={food.id} food={food} />
                  ))}
                  {paginatedFoods.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-12 px-5 text-center text-sm text-kore-muted"
                      >
                        Nenhum alimento corresponde ao filtro atual.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Paginação ────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-kore-border bg-kore-bg/30">
                <p className="text-xs text-kore-muted">
                  Página <span className="font-bold text-kore-ink">{currentPage}</span> de <span className="font-bold text-kore-ink">{totalPages}</span>
                </p>
                <div className="flex gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg text-kore-subink hover:bg-kore-card disabled:opacity-50 disabled:pointer-events-none transition"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg text-kore-subink hover:bg-kore-card disabled:opacity-50 disabled:pointer-events-none transition"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

/* ── Row ────────────────────────────────────────────────────── */
function formatMacro(val: any) {
  if (val == null) return "0";
  return Number(val).toLocaleString("pt-BR", { maximumFractionDigits: 3 });
}

function FoodRow({ food }: { food: any }) {
  return (
    <tr className="border-b border-kore-border last:border-b-0 hover:bg-kore-bg/60 transition group">
      <td className="py-3 px-5">
        <div className="flex flex-col">
          <p className="font-bold text-kore-ink text-sm leading-tight">{food.name}</p>
          {!food.created_by && (
            <span className="text-[10px] text-kore-muted uppercase tracking-wider mt-0.5">Global (TACO)</span>
          )}
          {food.created_by && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium uppercase tracking-wider mt-0.5">Personalizado</span>
          )}
        </div>
      </td>
      <td className="py-3 px-3">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${CATEGORY_COLORS[food.inferredCategory as Category]}`}
        >
          {CATEGORY_LABELS[food.inferredCategory as Category]}
        </span>
      </td>
      <td className="py-3 px-3 text-xs text-kore-subink font-semibold whitespace-nowrap">
        {food.base_amount}g
      </td>
      <td className="py-3 px-3 text-right tabular-nums">
        <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
          {formatMacro(food.kcal)}
        </span>
      </td>
      <td className="py-3 px-3 text-right tabular-nums">
        <span className="text-sm font-bold text-kore-ink">{formatMacro(food.protein_g)}g</span>
      </td>
      <td className="py-3 px-3 text-right tabular-nums">
        <span className="text-sm font-bold text-kore-ink">{formatMacro(food.carbs_g)}g</span>
      </td>
      <td className="py-3 px-3 text-right tabular-nums">
        <span className="text-sm font-bold text-kore-ink">{formatMacro(food.fat_g)}g</span>
      </td>
      <td className="py-3 px-5 text-right">
        {food.created_by ? (
           <div className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
             <button
               type="button"
               aria-label="Editar alimento"
               className="w-7 h-7 rounded-lg grid place-items-center text-kore-subink hover:text-kore-emerald-deep hover:bg-kore-emerald-soft transition"
             >
               <Edit3 size={13} />
             </button>
             <button
               type="button"
               aria-label="Excluir alimento"
               className="w-7 h-7 rounded-lg grid place-items-center text-kore-subink hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
             >
               <Trash2 size={13} />
             </button>
           </div>
        ) : (
          <span className="text-[10px] text-kore-muted uppercase font-semibold">Somente Leitura</span>
        )}
      </td>
    </tr>
  );
}