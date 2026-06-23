const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('1. Atualizando meal_items com base na TACO...');
  const { data: foods, error: foodsError } = await supabase.from('foods').select('id, kcal, protein_g, carbs_g, fat_g, base_amount');
  if (foodsError) throw foodsError;
  
  const foodsMap = new Map();
  for (const f of foods) {
    foodsMap.set(f.id, f);
  }

  const { data: allItems, error: itemsError } = await supabase.from('meal_items').select('*');
  if (itemsError) throw itemsError;
  
  const items = allItems.filter(i => i.food_id !== null);
  
  if (!items || items.length === 0) return console.log('Sem itens.');
  
  for (const item of items) {
    const food = foodsMap.get(item.food_id);
    if (food) {
      const multiplier = item.quantity_g / food.base_amount;
      const newKcal = food.kcal * multiplier;
      const newProt = food.protein_g * multiplier;
      const newCarb = food.carbs_g * multiplier;
      const newFat = food.fat_g * multiplier;
      
      await supabase.from('meal_items').update({
        kcal: newKcal,
        protein_g: newProt,
        carbs_g: newCarb,
        fat_g: newFat
      }).eq('id', item.id);
    }
  }
  
  console.log('2. Recalculando meal_plans (Modelos Globais)...');
  const { data: plans } = await supabase.from('meal_plans').select('id, title').eq('is_global_template', true);
  if (!plans) return;
  for (const plan of plans) {
    const { data: meals } = await supabase.from('meals').select('id, meal_items(kcal, protein_g, carbs_g, fat_g)').eq('meal_plan_id', plan.id);
    let totalKcal = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
    for (const meal of meals) {
      if (meal.meal_items) {
        for (const item of meal.meal_items) {
          totalKcal += Number(item.kcal || 0);
          totalProtein += Number(item.protein_g || 0);
          totalCarbs += Number(item.carbs_g || 0);
          totalFat += Number(item.fat_g || 0);
        }
      }
    }
    await supabase.from('meal_plans').update({
      daily_kcal_goal: Math.round(totalKcal),
      protein_g: Math.round(totalProtein),
      carbs_g: Math.round(totalCarbs),
      fat_g: Math.round(totalFat)
    }).eq('id', plan.id);
    console.log('Atualizado:', plan.title, '->', Math.round(totalKcal), 'kcal');
  }
}
run().catch(e => console.error(JSON.stringify(e, null, 2)));
