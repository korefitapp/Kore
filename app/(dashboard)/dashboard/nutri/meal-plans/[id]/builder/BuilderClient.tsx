"use client";

import { useState, useTransition, useMemo } from "react";
import { ArrowLeft, Clock, Plus, Search, Utensils, Save, Trash2, Check, X } from "lucide-react";
import Link from "next/link";
import { Topbar } from "../../../_components/Topbar";
import { MobileSidebar, Sidebar } from "../../../_components/Sidebar";
import { saveMealBuilderGraph, searchFoods } from "@/app/actions/nutri-actions";
import { motion, AnimatePresence } from "framer-motion";

export function BuilderClient({ plan, initialMeals }: { plan: any; initialMeals: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [isTemplate, setIsTemplate] = useState(plan.is_template || false);

  // Inicializar o estado com os macros base para evitar desvios no recálculo proporcional
  const [meals, setMeals] = useState<any[]>(() => {
    return (initialMeals || []).map(m => ({
      ...m,
      items: m.items?.map((item: any) => ({
        ...item,
        base_qty: item.quantity_g || 100,
        base_kcal: item.kcal || 0,
        base_protein: item.protein_g || 0,
        base_carbs: item.carbs_g || 0,
        base_fat: item.fat_g || 0
      })) || []
    }));
  });

  // Estados de busca (Para o modal inline)
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeSearchMealId, setActiveSearchMealId] = useState<string | null>(null);

  // Cálculo de totais
  const totals = useMemo(() => {
    let kcal = 0, protein = 0, carbs = 0, fat = 0;
    meals.forEach(m => {
      (m.items || []).forEach((item: any) => {
        const itemKcal = isNaN(item.kcal) ? 0 : item.kcal;
        const itemP = isNaN(item.protein_g) ? 0 : item.protein_g;
        const itemC = isNaN(item.carbs_g) ? 0 : item.carbs_g;
        const itemF = isNaN(item.fat_g) ? 0 : item.fat_g;
        
        kcal += itemKcal;
        protein += itemP;
        carbs += itemC;
        fat += itemF;
      });
    });
    return { 
      kcal: Math.round(kcal), 
      protein: Math.round(protein), 
      carbs: Math.round(carbs), 
      fat: Math.round(fat) 
    };
  }, [meals]);

  const handleAddMeal = () => {
    setMeals([...meals, { id: Date.now().toString(), name: "Nova Refeição", time: "12:00", items: [] }]);
  };

  const handleRemoveMeal = (mealId: string) => {
    const { confirmAction } = require("@/store/useConfirmStore");
    confirmAction({
      title: "Remover Refeição",
      message: "Remover esta refeição inteira?",
      danger: true,
      onConfirm: () => {
        setMeals(meals.filter(m => m.id !== mealId));
      }
    });
  };

  const handleSearchFoods = async (q: string) => {
    setSearchQuery(q);
    if (q.length > 2) {
      const results = await searchFoods(q);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleAddFood = (food: any) => {
    if (!activeSearchMealId) return;
    const defaultQty = food.base_amount || 100;
    const newItem = {
      id: Date.now().toString(),
      food_id: food.id,
      food_name: food.name,
      quantity_g: defaultQty,
      kcal: food.kcal,
      protein_g: food.protein_g,
      carbs_g: food.carbs_g,
      fat_g: food.fat_g,
      // Salva os valores base para recálculo
      base_qty: food.base_amount || 100,
      base_kcal: food.kcal,
      base_protein: food.protein_g,
      base_carbs: food.carbs_g,
      base_fat: food.fat_g
    };

    setMeals(meals.map(m => m.id === activeSearchMealId ? { ...m, items: [...(m.items || []), newItem] } : m));
    setActiveSearchMealId(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveItem = (mealId: string, itemId: string) => {
    setMeals(meals.map(m => m.id === mealId ? { ...m, items: m.items.filter((i: any) => i.id !== itemId) } : m));
  };

  // Função utilitária de cálculo proporcional: (macroBase / baseAmount) * inputAmount
  const handleQuantityChange = (mealId: string, itemId: string, newQtyRaw: string) => {
    // Permite que o campo fique vazio (temporariamente durante a digitação)
    const qty = newQtyRaw === "" ? NaN : parseFloat(newQtyRaw);

    setMeals(meals.map(m => {
      if (m.id !== mealId) return m;
      const newItems = m.items.map((item: any) => {
        if (item.id !== itemId) return item;
        
        if (isNaN(qty)) {
          return { ...item, quantity_g: newQtyRaw, kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
        }

        const baseQty = item.base_qty || 100;
        const calc = (baseMacro: number) => (baseMacro / baseQty) * qty;

        return {
          ...item,
          quantity_g: qty,
          kcal: calc(item.base_kcal),
          protein_g: calc(item.base_protein),
          carbs_g: calc(item.base_carbs),
          fat_g: calc(item.base_fat)
        };
      });
      return { ...m, items: newItems };
    }));
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        await saveMealBuilderGraph(plan.id, meals, totals, isTemplate);
        const { toast } = require("@/store/useToastStore");
        toast.success("Cardápio salvo com sucesso!");
      } catch (e: any) {
        const { toast } = require("@/store/useToastStore");
        toast.error(e.message || "Erro ao salvar o cardápio.");
      }
    });
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] dark:bg-[#0B1120] text-kore-ink">
      <Sidebar />
      <MobileSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />

        {/* ── HEADER FIXO (Painel de Macros) ────────────────────────────── */}
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-xl border-b border-kore-border p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
            <Link 
              href={`/dashboard/nutri/patients/${plan.patient_id}`}
              className="p-2.5 rounded-xl border border-kore-border bg-kore-bg hover:bg-kore-border transition self-start sm:self-auto"
            >
              <ArrowLeft size={16} className="text-kore-ink" />
            </Link>
            
            <div className="flex items-center gap-6 w-full overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              <div className="flex flex-col items-start min-w-[80px]">
                <span className="text-[10px] font-black uppercase tracking-widest text-kore-muted">Kcal Total</span>
                <span className="text-xl font-extrabold text-kore-ink tracking-tight">{totals.kcal}</span>
              </div>
              <div className="w-px h-10 bg-kore-border" />
              <div className="flex flex-col items-start min-w-[80px]">
                <span className="text-[10px] font-black uppercase tracking-widest text-kore-muted">Proteínas</span>
                <span className="text-xl font-extrabold text-[#3B82F6] tracking-tight">{totals.protein}g</span>
              </div>
              <div className="w-px h-10 bg-kore-border" />
              <div className="flex flex-col items-start min-w-[80px]">
                <span className="text-[10px] font-black uppercase tracking-widest text-kore-muted">Carboidratos</span>
                <span className="text-xl font-extrabold text-[#F59E0B] tracking-tight">{totals.carbs}g</span>
              </div>
              <div className="w-px h-10 bg-kore-border" />
              <div className="flex flex-col items-start min-w-[80px]">
                <span className="text-[10px] font-black uppercase tracking-widest text-kore-muted">Gorduras</span>
                <span className="text-xl font-extrabold text-[#EF4444] tracking-tight">{totals.fat}g</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between w-full sm:w-auto gap-4 mt-2 sm:mt-0">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-kore-muted">
              <input 
                type="checkbox" 
                checked={isTemplate}
                onChange={(e) => setIsTemplate(e.target.checked)}
                className="w-4 h-4 rounded text-[#10B981] focus:ring-[#10B981] border-kore-border"
              />
              Salvar como Modelo
            </label>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="bg-[#10B981] hover:bg-[#059669] text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-[#10B981]/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isPending ? "Salvando..." : (
                <><Save size={16} /> Salvar Alterações</>
              )}
            </button>
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-kore-ink">
                {plan.title}
              </h1>
              <p className="text-kore-muted font-medium text-sm mt-1">
                Construtor em tempo real. Adicione refeições e alimentos com cálculos precisos.
              </p>
            </div>
          </div>

          {/* ── ÁREA DOS CARDS DE REFEIÇÃO ────────────────────────────── */}
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              {meals.map((meal) => (
                <motion.div 
                  key={meal.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white dark:bg-[#111827] border border-kore-border rounded-2xl shadow-sm p-5 sm:p-6"
                >
                  {/* Cabeçalho do Cartão */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 grid place-items-center flex-shrink-0">
                        <Utensils size={20} className="text-[#10B981]" />
                      </div>
                      <input 
                        type="text" 
                        value={meal.name}
                        onChange={(e) => setMeals(meals.map(m => m.id === meal.id ? { ...m, name: e.target.value } : m))}
                        className="font-black text-xl text-kore-ink bg-transparent focus:outline-none placeholder-kore-muted w-full max-w-[300px]"
                        placeholder="Ex: Café da Manhã"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <div className="flex items-center gap-2 bg-[#F1F5F9] dark:bg-[#1F2937] px-3 py-2 rounded-xl border border-kore-border">
                        <Clock size={16} className="text-kore-muted" />
                        <input 
                          type="time" 
                          value={meal.time}
                          onChange={(e) => setMeals(meals.map(m => m.id === meal.id ? { ...m, time: e.target.value } : m))}
                          className="bg-transparent focus:outline-none text-sm font-bold text-kore-ink w-[4.5rem]"
                        />
                      </div>
                      <button 
                        onClick={() => handleRemoveMeal(meal.id)} 
                        className="text-kore-muted hover:text-rose-500 p-2 transition rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20"
                        title="Remover refeição"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Linhas de Alimentos */}
                  <ul className="space-y-2 mb-2">
                    {meal.items?.map((item: any) => (
                      <li key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 px-4 rounded-xl hover:bg-[#F8FAFC] dark:hover:bg-[#1F2937] transition group relative">
                        {/* Esquerda: Nome e Macros Proporcionais */}
                        <div className="flex flex-col max-w-[65%]">
                          <span className="font-bold text-sm text-kore-ink truncate" title={item.food_name}>{item.food_name}</span>
                          <div className="flex items-center gap-2 text-[11px] font-bold text-kore-muted mt-1">
                            <span className="text-[#3B82F6]">{Number(item.protein_g || 0).toFixed(2).replace('.', ',')}g P</span>
                            <span className="text-kore-border">•</span>
                            <span className="text-[#F59E0B]">{Number(item.carbs_g || 0).toFixed(2).replace('.', ',')}g C</span>
                            <span className="text-kore-border">•</span>
                            <span className="text-[#EF4444]">{Number(item.fat_g || 0).toFixed(2).replace('.', ',')}g G</span>
                          </div>
                        </div>
                        
                        {/* Centro e Direita: Input e Calorias */}
                        <div className="flex items-center gap-6 mt-3 sm:mt-0 self-end sm:self-auto">
                          <div className="flex items-center gap-1.5">
                            <input 
                              type="number"
                              value={item.quantity_g}
                              onChange={(e) => handleQuantityChange(meal.id, item.id, e.target.value)}
                              className="w-16 px-2 py-1 text-sm font-bold bg-[#F1F5F9] dark:bg-[#1F2937] border border-kore-border rounded-lg text-center focus:outline-none focus:border-[#10B981] transition shadow-inner"
                              min="0"
                              step="0.1"
                            />
                            <span className="text-xs font-bold text-kore-muted">g</span>
                          </div>
                          
                          <span className="text-sm font-black text-[#10B981] w-24 text-right">
                            {Number(item.kcal || 0).toFixed(1).replace('.', ',')} KCAL
                          </span>
                          
                          <button 
                            onClick={() => handleRemoveItem(meal.id, item.id)} 
                            className="text-kore-muted hover:text-rose-500 opacity-0 group-hover:opacity-100 transition absolute right-2 top-1/2 -translate-y-1/2 bg-white dark:bg-[#111827] border border-kore-border rounded-full p-1.5 shadow-sm"
                            title="Remover alimento"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Botão Adicionar Alimento / Search Inline */}
                  <div className="mt-4 pt-4 border-t border-kore-border border-dashed">
                    {activeSearchMealId === meal.id ? (
                      <div className="relative animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="relative">
                          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted" />
                          <input 
                            type="text" 
                            autoFocus
                            placeholder="Digite para buscar na TACO..."
                            value={searchQuery}
                            onChange={(e) => handleSearchFoods(e.target.value)}
                            className="w-full pl-9 pr-10 py-3 rounded-xl border-2 border-[#10B981]/30 bg-white dark:bg-[#111827] text-sm font-medium focus:outline-none focus:border-[#10B981] transition shadow-sm"
                          />
                          <button 
                            onClick={() => {
                              setActiveSearchMealId(null);
                              setSearchQuery("");
                              setSearchResults([]);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-kore-muted hover:text-rose-500"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        {searchResults.length > 0 && (
                          <div className="absolute z-50 top-full left-0 w-full mt-2 bg-white dark:bg-[#1F2937] border border-kore-border rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                            {searchResults.map(f => (
                              <button
                                key={f.id}
                                onClick={() => handleAddFood(f)}
                                className="w-full text-left px-4 py-3 hover:bg-[#F8FAFC] dark:hover:bg-[#374151] border-b border-kore-border last:border-0 transition"
                              >
                                <div className="font-bold text-sm text-kore-ink">{f.name}</div>
                                <div className="text-xs text-kore-muted mt-0.5">
                                  {f.kcal} kcal • {f.protein_g}g P • {f.carbs_g}g C • {f.fat_g}g G (em {f.base_amount}g)
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                        {searchQuery.length > 2 && searchResults.length === 0 && (
                          <div className="absolute z-50 top-full left-0 w-full mt-2 bg-white dark:bg-[#1F2937] border border-kore-border rounded-xl shadow-lg p-4 text-center text-sm text-kore-muted">
                            Nenhum alimento encontrado.
                          </div>
                        )}
                      </div>
                    ) : (
                      <button 
                        onClick={() => setActiveSearchMealId(meal.id)}
                        className="w-full py-3 text-sm font-bold text-kore-muted hover:text-[#10B981] hover:bg-[#10B981]/5 rounded-xl transition flex items-center justify-center gap-2 border border-transparent hover:border-[#10B981]/20"
                      >
                        <Plus size={16} /> Adicionar Alimento
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            <button
              onClick={handleAddMeal}
              className="w-full py-6 border-2 border-dashed border-kore-border rounded-2xl text-kore-muted hover:text-kore-ink hover:border-kore-emerald hover:bg-kore-emerald/5 transition-all flex flex-col items-center justify-center gap-2 font-bold group"
            >
              <div className="w-10 h-10 rounded-full bg-kore-bg group-hover:bg-white dark:group-hover:bg-[#111827] shadow-sm flex items-center justify-center transition-colors">
                <Plus size={20} className="text-kore-emerald" />
              </div>
              Adicionar Nova Refeição
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
