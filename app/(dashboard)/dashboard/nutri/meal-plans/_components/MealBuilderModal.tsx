"use client";

import { useState, useEffect, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import { Loader2, Plus, Search, Trash2, Save, X } from "lucide-react";
import { searchFoodBank, saveMealPlanBuilder, getMealPlanBuilderData } from "@/app/actions/nutri-actions";
import { useRouter } from "next/navigation";

interface MealBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: any;
}

export function MealBuilderModal({ isOpen, onClose, plan }: MealBuilderModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [meals, setMeals] = useState<any[]>([]);

  // Search States
  const [activeMealIdForSearch, setActiveMealIdForSearch] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [isLoadingMeals, setIsLoadingMeals] = useState(false);

  // Initialize empty or fetch
  useEffect(() => {
    if (isOpen && plan?.id) {
      setIsLoadingMeals(true);
      getMealPlanBuilderData(plan.id).then((data) => {
        if (data && data.length > 0) {
          // Preencher refeições formatadas e calculadas
          setMeals(data.map((m: any) => ({
            id: m.id,
            name: m.name,
            time: m.time,
            items: m.items.map((it: any) => ({
              id: it.id,
              food_id: it.food_id,
              food_name: it.food_name,
              base_kcal: it.kcal, // simplificando assumindo q salvamos o base
              base_protein: it.protein_g,
              base_carbs: it.carbs_g,
              base_fat: it.fat_g,
              quantity_g: it.quantity_g,
              kcal: it.kcal,
              protein_g: it.protein_g,
              carbs_g: it.carbs_g,
              fat_g: it.fat_g
            }))
          })));
        } else {
          // Fallback vazio
          setMeals([{ id: crypto.randomUUID(), name: "Café da Manhã", time: "08:00", items: [] }]);
        }
      }).finally(() => setIsLoadingMeals(false));
    }
  }, [isOpen, plan?.id]);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchFoodBank(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Macro Calculations
  const totalMacros = meals.reduce((acc, meal) => {
    meal.items.forEach((item: any) => {
      acc.kcal += Number(item.kcal) || 0;
      acc.protein += Number(item.protein_g) || 0;
      acc.carbs += Number(item.carbs_g) || 0;
      acc.fat += Number(item.fat_g) || 0;
    });
    return acc;
  }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });

  const addMeal = () => {
    setMeals([...meals, { id: crypto.randomUUID(), name: "Nova Refeição", time: "12:00", items: [] }]);
  };

  const removeMeal = (id: string) => {
    setMeals(meals.filter(m => m.id !== id));
  };

  const updateMeal = (id: string, field: string, value: string) => {
    setMeals(meals.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleAddFood = (food: any) => {
    if (!activeMealIdForSearch) return;
    const defaultQuantity = 100;
    const newItem = {
      id: crypto.randomUUID(),
      food_id: food.id,
      food_name: food.name,
      base_kcal: food.kcal,
      base_protein: food.protein_g,
      base_carbs: food.carbs_g,
      base_fat: food.fat_g,
      quantity_g: defaultQuantity,
      kcal: food.kcal,
      protein_g: food.protein_g,
      carbs_g: food.carbs_g,
      fat_g: food.fat_g
    };

    setMeals(meals.map(m => 
      m.id === activeMealIdForSearch 
        ? { ...m, items: [...m.items, newItem] } 
        : m
    ));
    setActiveMealIdForSearch(null);
    setSearchQuery("");
  };

  const updateItemQuantity = (mealId: string, itemId: string, newQtd: number) => {
    setMeals(meals.map(m => {
      if (m.id !== mealId) return m;
      return {
        ...m,
        items: m.items.map((it: any) => {
          if (it.id !== itemId) return it;
          const ratio = newQtd / 100;
          return {
            ...it,
            quantity_g: newQtd,
            kcal: Math.round(it.base_kcal * ratio),
            protein_g: Math.round(it.base_protein * ratio),
            carbs_g: Math.round(it.base_carbs * ratio),
            fat_g: Math.round(it.base_fat * ratio),
          };
        })
      };
    }));
  };

  const removeItem = (mealId: string, itemId: string) => {
    setMeals(meals.map(m => m.id === mealId ? { ...m, items: m.items.filter((it: any) => it.id !== itemId) } : m));
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        await saveMealPlanBuilder(plan.id, meals, {
          kcal: totalMacros.kcal,
          protein_g: totalMacros.protein,
          carbs_g: totalMacros.carbs,
          fat_g: totalMacros.fat
        });
        const { toast } = require("@/store/useToastStore");
        toast.success("Cardápio salvo com sucesso!");
        onClose();
        router.refresh();
      } catch (err: any) {
        console.error(err);
        const { toast } = require("@/store/useToastStore");
        toast.error("Erro ao salvar cardápio. Certifique-se de que as tabelas de meals existem no Supabase.");
      }
    });
  };

  const isReadOnly = plan?.is_global_template === true;

  const formatMacro = (val: any) => {
    if (val == null || isNaN(Number(val))) return "0";
    return Number(val).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isReadOnly ? `Modo Visualização: ${plan?.title}` : `Construtor: ${plan?.title}`} maxWidth="4xl">
      <div className="flex flex-col h-[75vh]">
        {/* Painel de Macros Topo */}
        <div className="flex flex-wrap items-center justify-around bg-kore-card border border-kore-border p-4 rounded-xl mb-4 shrink-0 mt-4 mx-4">
          <div className="text-center">
            <p className="text-xs font-bold text-kore-muted uppercase">Kcal Total</p>
            <p className="text-2xl font-black text-kore-ink">{formatMacro(totalMacros.kcal)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-kore-muted uppercase">Carboidratos</p>
            <p className="text-xl font-bold text-sky-500">{formatMacro(totalMacros.carbs)}g</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-kore-muted uppercase">Proteínas</p>
            <p className="text-xl font-bold text-emerald-500">{formatMacro(totalMacros.protein)}g</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-kore-muted uppercase">Gorduras</p>
            <p className="text-xl font-bold text-amber-500">{formatMacro(totalMacros.fat)}g</p>
          </div>
        </div>

        {/* Corpo: Lista de Refeições */}
        <div className="flex-1 overflow-y-auto px-4 space-y-6 pb-20">
          {isLoadingMeals ? (
            <div className="flex flex-col items-center justify-center h-40 text-kore-muted">
              <Loader2 size={32} className="animate-spin mb-4" />
              <p className="font-bold text-sm">Carregando refeições...</p>
            </div>
          ) : meals.length === 0 ? (
            <div className="text-center py-10 text-kore-muted">Nenhuma refeição cadastrada.</div>
          ) : (
            meals.map((meal) => (
            <div key={meal.id} className="bg-kore-bg border border-kore-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 w-full max-w-sm">
                  <input 
                    type="text" 
                    value={meal.name} 
                    onChange={(e) => updateMeal(meal.id, "name", e.target.value)}
                    readOnly={isReadOnly}
                    className={`font-bold text-lg text-kore-ink bg-transparent border-b border-transparent transition w-full ${isReadOnly ? 'focus:outline-none cursor-default' : 'hover:border-kore-border focus:border-kore-emerald focus:outline-none'}`}
                  />
                  <input 
                    type="time" 
                    value={meal.time} 
                    onChange={(e) => updateMeal(meal.id, "time", e.target.value)}
                    readOnly={isReadOnly}
                    className={`font-bold text-sm text-kore-subink bg-kore-card border border-kore-border rounded-lg px-2 py-1 ${isReadOnly ? 'focus:outline-none cursor-default opacity-80' : 'focus:outline-none focus:border-kore-emerald'}`}
                  />
                </div>
                {!isReadOnly && (
                  <button onClick={() => removeMeal(meal.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {/* Items da Refeição */}
              <div className="space-y-2 mb-4">
                {meal.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 bg-kore-card border border-kore-border rounded-xl p-3">
                    <div className="flex-1">
                      <p className="font-bold text-sm text-kore-ink">{item.food_name}</p>
                      <p className="text-xs text-kore-muted font-medium">
                        {formatMacro(item.protein_g)}g P • {formatMacro(item.carbs_g)}g C • {formatMacro(item.fat_g)}g G
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={item.quantity_g} 
                        onChange={(e) => updateItemQuantity(meal.id, item.id, Number(e.target.value))}
                        readOnly={isReadOnly}
                        className={`w-20 text-center font-bold text-sm bg-kore-bg border border-kore-border rounded-lg px-2 py-1 ${isReadOnly ? 'focus:outline-none cursor-default opacity-80' : 'focus:outline-none focus:border-kore-emerald'}`}
                      />
                      <span className="text-xs font-bold text-kore-muted">g</span>
                    </div>
                    <div className="w-16 text-right">
                      <p className="font-black text-sm text-kore-ink">{formatMacro(item.kcal)}</p>
                      <p className="text-[10px] text-kore-muted uppercase font-bold">kcal</p>
                    </div>
                    {!isReadOnly && (
                      <button onClick={() => removeItem(meal.id, item.id)} className="text-kore-muted hover:text-rose-500 p-1 transition ml-2">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Food Area */}
              {!isReadOnly && (
                activeMealIdForSearch === meal.id ? (
                <div className="relative">
                  <div className="flex items-center gap-2 bg-kore-card border border-kore-emerald rounded-xl px-3 py-2">
                    <Search size={16} className="text-kore-emerald" />
                    <input 
                      type="text" 
                      placeholder="Buscar alimento (ex: Frango, Arroz)..." 
                      autoFocus
                      className="bg-transparent border-none focus:outline-none text-sm font-medium text-kore-ink w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button onClick={() => { setActiveMealIdForSearch(null); setSearchQuery(""); }} className="text-kore-muted hover:text-kore-ink">
                      <X size={16} />
                    </button>
                  </div>
                  
                  {/* Dropdown Results */}
                  {searchQuery.length >= 2 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-kore-card border border-kore-border rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto p-1">
                      {isSearching ? (
                        <div className="flex items-center justify-center p-4 text-kore-muted"><Loader2 size={20} className="animate-spin" /></div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map(result => (
                          <button 
                            key={result.id} 
                            onClick={() => handleAddFood(result)}
                            className="w-full text-left flex items-center justify-between p-3 hover:bg-kore-bg rounded-lg transition"
                          >
                            <div>
                              <p className="font-bold text-sm text-kore-ink">{result.name}</p>
                              <p className="text-xs text-kore-subink">Porção: {result.serving_size} • {formatMacro(result.kcal)} kcal</p>
                            </div>
                            <Plus size={16} className="text-kore-emerald" />
                          </button>
                        ))
                      ) : (
                        <p className="p-3 text-sm text-kore-muted text-center">Nenhum alimento encontrado.</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                  <button 
                    onClick={() => setActiveMealIdForSearch(meal.id)}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-kore-border rounded-xl text-sm font-bold text-kore-subink hover:text-kore-ink hover:border-kore-subink hover:bg-kore-card transition"
                  >
                    <Plus size={16} /> Adicionar Alimento
                  </button>
                )
              )}
            </div>
          )))}

          {!isReadOnly && (
            <button 
              onClick={addMeal}
              className="w-full py-4 rounded-2xl bg-kore-emerald-soft text-kore-emerald-deep hover:bg-kore-emerald hover:text-white transition font-bold text-sm flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Nova Refeição
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-kore-bg border-t border-kore-border flex justify-end gap-3 rounded-b-2xl">
          <button 
            onClick={onClose}
            disabled={isPending}
            className="px-5 py-2.5 rounded-xl font-bold text-sm text-kore-ink bg-kore-card hover:bg-kore-border transition border border-kore-border"
          >
            {isReadOnly ? 'Fechar' : 'Cancelar'}
          </button>
          {!isReadOnly && (
            <button 
              onClick={handleSave}
              disabled={isPending}
              className="btn-emerald px-6 py-2.5 flex items-center gap-2 text-sm"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isPending ? "Salvando..." : "Salvar Cardápio"}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
