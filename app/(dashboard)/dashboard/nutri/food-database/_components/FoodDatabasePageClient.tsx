"use client";

import { useState } from "react";
import {
  Apple,
  Edit3,
  Plus,
  Search,
  Trash2,
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

interface FoodItem {
  id: string;
  name: string;
  category: Category;
  portion: string;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

const CATEGORY_FILTERS: { key: Category | "all"; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "proteinas", label: "Proteínas" },
  { key: "carboidratos", label: "Carboidratos" },
  { key: "gorduras", label: "Gorduras" },
  { key: "frutas-verduras", label: "Frutas e Verduras" },
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

/* ── Mock Data ──────────────────────────────────────────────── */
const MOCK_FOODS: FoodItem[] = [
  // Proteínas
  { id: "f-001", name: "Peito de Frango Grelhado", category: "proteinas", portion: "100g", kcal: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6 },
  { id: "f-002", name: "Patinha de Frango Cozida", category: "proteinas", portion: "100g", kcal: 147, protein_g: 27, carbs_g: 0, fat_g: 3.2 },
  { id: "f-003", name: "Filé de Tilápia Grelhado", category: "proteinas", portion: "100g", kcal: 128, protein_g: 26, carbs_g: 0, fat_g: 2.7 },
  { id: "f-004", name: "Almoceira Bovina Magra", category: "proteinas", portion: "100g", kcal: 250, protein_g: 26, carbs_g: 0, fat_g: 15 },
  { id: "f-005", name: "Ovo de Galinha Cozido", category: "proteinas", portion: "1 un (50g)", kcal: 78, protein_g: 6.3, carbs_g: 0.6, fat_g: 5.3 },
  { id: "f-006", name: "Clara de Ovo Pasteurizada", category: "proteinas", portion: "100g", kcal: 52, protein_g: 10.9, carbs_g: 0.7, fat_g: 0.2 },
  { id: "f-007", name: "Atum Enlatado em Água", category: "proteinas", portion: "100g", kcal: 116, protein_g: 25.5, carbs_g: 0, fat_g: 0.8 },
  { id: "f-008", name: "Salmão Grelhado", category: "proteinas", portion: "100g", kcal: 208, protein_g: 20, carbs_g: 0, fat_g: 13.4 },
  { id: "f-009", name: "Carne Moída Patinho", category: "proteinas", portion: "100g", kcal: 176, protein_g: 21.5, carbs_g: 0, fat_g: 9.5 },
  { id: "f-010", name: "Queijo Cottage", category: "proteinas", portion: "100g", kcal: 98, protein_g: 11, carbs_g: 3.4, fat_g: 4.3 },

  // Carboidratos
  { id: "f-011", name: "Arroz Integral Cozido", category: "carboidratos", portion: "100g", kcal: 123, protein_g: 2.7, carbs_g: 25.8, fat_g: 1 },
  { id: "f-012", name: "Arroz Branco Cozido", category: "carboidratos", portion: "100g", kcal: 130, protein_g: 2.7, carbs_g: 28.2, fat_g: 0.3 },
  { id: "f-013", name: "Batata Doce Cozida", category: "carboidratos", portion: "100g", kcal: 86, protein_g: 1.6, carbs_g: 20.1, fat_g: 0.1 },
  { id: "f-014", name: "Batata Inglesa Cozida", category: "carboidratos", portion: "100g", kcal: 77, protein_g: 2, carbs_g: 17.5, fat_g: 0.1 },
  { id: "f-015", name: "Aveia em Flocos", category: "carboidratos", portion: "100g", kcal: 389, protein_g: 16.9, carbs_g: 66.3, fat_g: 6.9 },
  { id: "f-016", name: "Macarrão Integral Cozido", category: "carboidratos", portion: "100g", kcal: 124, protein_g: 5.3, carbs_g: 24.5, fat_g: 0.5 },
  { id: "f-017", name: "Pão Integral Fatiado", category: "carboidratos", portion: "1 fatia (30g)", kcal: 69, protein_g: 3.6, carbs_g: 11.4, fat_g: 1.2 },
  { id: "f-018", name: "Mandioca Cozida", category: "carboidratos", portion: "100g", kcal: 160, protein_g: 1.2, carbs_g: 38.1, fat_g: 0.3 },
  { id: "f-019", name: "Quinoa Cozida", category: "carboidratos", portion: "100g", kcal: 120, protein_g: 4.4, carbs_g: 21.3, fat_g: 1.9 },
  { id: "f-020", name: "Banana Prata", category: "carboidratos", portion: "1 un (100g)", kcal: 99, protein_g: 1.1, carbs_g: 25.8, fat_g: 0.1 },

  // Gorduras
  { id: "f-021", name: "Azeite de Oliva Extra Virgem", category: "gorduras", portion: "1 col. sopa (13ml)", kcal: 112, protein_g: 0, carbs_g: 0, fat_g: 12.6 },
  { id: "f-022", name: "Abacate", category: "gorduras", portion: "100g", kcal: 160, protein_g: 2, carbs_g: 8.5, fat_g: 14.7 },
  { id: "f-023", name: "Amêndoas", category: "gorduras", portion: "30g", kcal: 173, protein_g: 6.3, carbs_g: 5.6, fat_g: 14.9 },
  { id: "f-024", name: "Castanha-do-Pará", category: "gorduras", portion: "30g", kcal: 204, protein_g: 4.4, carbs_g: 3.5, fat_g: 20.5 },
  { id: "f-025", name: "Pasta de Amendoim Natural", category: "gorduras", portion: "1 col. sopa (16g)", kcal: 98, protein_g: 4, carbs_g: 3.4, fat_g: 8.2 },
  { id: "f-026", name: "Óleo de Coco", category: "gorduras", portion: "1 col. sopa (13ml)", kcal: 116, protein_g: 0, carbs_g: 0, fat_g: 12.8 },
  { id: "f-027", name: "Chia", category: "gorduras", portion: "20g", kcal: 97, protein_g: 3.3, carbs_g: 8.4, fat_g: 6.1 },

  // Frutas e Verduras
  { id: "f-028", name: "Brócolis Cozido", category: "frutas-verduras", portion: "100g", kcal: 35, protein_g: 2.4, carbs_g: 7.2, fat_g: 0.4 },
  { id: "f-029", name: "Espinafre Refogado", category: "frutas-verduras", portion: "100g", kcal: 23, protein_g: 2.9, carbs_g: 3.6, fat_g: 0.4 },
  { id: "f-030", name: "Couve-flor Cozida", category: "frutas-verduras", portion: "100g", kcal: 23, protein_g: 1.8, carbs_g: 4.5, fat_g: 0.1 },
  { id: "f-031", name: "Tomate Cru", category: "frutas-verduras", portion: "100g", kcal: 18, protein_g: 0.9, carbs_g: 3.9, fat_g: 0.2 },
  { id: "f-032", name: "Alface Americana", category: "frutas-verduras", portion: "100g", kcal: 14, protein_g: 1.3, carbs_g: 2.3, fat_g: 0.2 },
  { id: "f-033", name: "Maçã com Casca", category: "frutas-verduras", portion: "1 un (150g)", kcal: 78, protein_g: 0.4, carbs_g: 20.6, fat_g: 0.3 },
  { id: "f-034", name: "Laranja Pera", category: "frutas-verduras", portion: "1 un (150g)", kcal: 63, protein_g: 1.2, carbs_g: 15.5, fat_g: 0.2 },
  { id: "f-035", name: "Mamão Papaia", category: "frutas-verduras", portion: "100g", kcal: 43, protein_g: 0.5, carbs_g: 10.8, fat_g: 0.1 },
  { id: "f-036", name: "Cenoura Crua", category: "frutas-verduras", portion: "100g", kcal: 41, protein_g: 0.9, carbs_g: 9.6, fat_g: 0.2 },
  { id: "f-037", name: "Beterraba Cozida", category: "frutas-verduras", portion: "100g", kcal: 49, protein_g: 1.6, carbs_g: 10.8, fat_g: 0.1 },

  // Suplementos
  { id: "f-038", name: "Whey Protein Isolado", category: "suplementos", portion: "1 scoop (30g)", kcal: 120, protein_g: 27, carbs_g: 1.5, fat_g: 0.5 },
  { id: "f-039", name: "Whey Protein Concentrado", category: "suplementos", portion: "1 scoop (30g)", kcal: 124, protein_g: 24, carbs_g: 3, fat_g: 1.5 },
  { id: "f-040", name: "Creatina Monohidratada", category: "suplementos", portion: "5g", kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
  { id: "f-041", name: "Albumina em Pó", category: "suplementos", portion: "2 scoop (30g)", kcal: 114, protein_g: 24, carbs_g: 1.8, fat_g: 0.6 },
  { id: "f-042", name: "Hipercalórico", category: "suplementos", portion: "3 scoop (100g)", kcal: 378, protein_g: 16, carbs_g: 70, fat_g: 4.5 },
  { id: "f-043", name: "BCAA em Pó", category: "suplementos", portion: "5g", kcal: 20, protein_g: 5, carbs_g: 0, fat_g: 0 },
  { id: "f-044", name: "Maltodextrina", category: "suplementos", portion: "30g", kcal: 117, protein_g: 0, carbs_g: 29.2, fat_g: 0 },
];

/* ── Component ──────────────────────────────────────────────── */
export function FoodDatabasePageClient() {
  const [filter, setFilter] = useState<Category | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = MOCK_FOODS.filter((f) => {
    if (filter !== "all" && f.category !== filter) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      if (!f.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

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
                  {MOCK_FOODS.length} alimentos cadastrados · {filtered.length}{" "}
                  exibidos
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-emerald text-sm px-4 py-2.5 inline-flex items-center gap-2 self-start sm:self-auto"
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
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-kore-card border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:border-kore-emerald transition"
              />
            </div>

            <div className="flex items-center bg-kore-bg rounded-xl p-0.5 border border-kore-border overflow-x-auto">
              {CATEGORY_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
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
          <section className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-kore-muted font-bold bg-kore-bg/60 border-y border-kore-border">
                    <th className="text-left font-bold py-3 px-5">
                      Alimento
                    </th>
                    <th className="text-left font-bold py-3 px-3">
                      Categoria
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
                  {filtered.map((food) => (
                    <FoodRow key={food.id} food={food} />
                  ))}
                  {filtered.length === 0 && (
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
          </section>
        </main>
      </div>
    </div>
  );
}

/* ── Row ────────────────────────────────────────────────────── */
function FoodRow({ food }: { food: FoodItem }) {
  return (
    <tr className="border-b border-kore-border last:border-b-0 hover:bg-kore-bg/60 transition group">
      <td className="py-3 px-5">
        <p className="font-bold text-kore-ink text-sm">{food.name}</p>
      </td>
      <td className="py-3 px-3">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${CATEGORY_COLORS[food.category]}`}
        >
          {CATEGORY_LABELS[food.category]}
        </span>
      </td>
      <td className="py-3 px-3 text-xs text-kore-subink font-semibold whitespace-nowrap">
        {food.portion}
      </td>
      <td className="py-3 px-3 text-right tabular-nums">
        <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
          {food.kcal}
        </span>
      </td>
      <td className="py-3 px-3 text-right tabular-nums">
        <span className="text-sm font-bold text-kore-ink">{food.protein_g}g</span>
      </td>
      <td className="py-3 px-3 text-right tabular-nums">
        <span className="text-sm font-bold text-kore-ink">{food.carbs_g}g</span>
      </td>
      <td className="py-3 px-3 text-right tabular-nums">
        <span className="text-sm font-bold text-kore-ink">{food.fat_g}g</span>
      </td>
      <td className="py-3 px-5 text-right">
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
      </td>
    </tr>
  );
}