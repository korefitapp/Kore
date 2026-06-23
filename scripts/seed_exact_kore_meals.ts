import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const FOOD_NAMES = [
  'Arroz, tipo 1, cozido',
  'Arroz, integral, cozido',
  'Frango, peito, sem pele, grelhado',
  'Carne, bovina, patinho, sem gordura, grelhado',
  'Ovo, de galinha, inteiro, cozido/10minutos',
  'Aveia, flocos, crua',
  'Whey Protein Isolado (90%)',
  'Whey Protein Concentrado (80%)',
  'Azeite, de oliva, extra virgem',
  'Batata, doce, cozida',
  'Batata, inglesa, cozida',
  'Pão, trigo, francês',
  'Banana, prata, crua',
  'Queijo, minas, frescal'
] as const;

type FoodName = typeof FOOD_NAMES[number];

// Cramers rule solver for 3x3 system
// A * x = b
// Returns [x1, x2, x3]
function solve3x3(A: number[][], b: number[]): number[] {
  const det = (M: number[][]) => 
    M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) -
    M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) +
    M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);

  const D = det(A);
  if (Math.abs(D) < 1e-9) throw new Error("Matrix is singular or ill-conditioned");

  const replaceCol = (M: number[][], col: number, vec: number[]) => {
    const res = M.map(row => [...row]);
    for (let i = 0; i < 3; i++) res[i][col] = vec[i];
    return res;
  };

  const Dx = det(replaceCol(A, 0, b));
  const Dy = det(replaceCol(A, 1, b));
  const Dz = det(replaceCol(A, 2, b));

  return [Dx / D, Dy / D, Dz / D];
}

async function run() {
  console.log('1. Fetching Foods...');
  const { data: foodsData, error: foodsError } = await supabase.from('foods').select('*').in('name', FOOD_NAMES);
  if (foodsError) throw foodsError;

  const foods = new Map<string, any>();
  for (const f of foodsData!) {
    foods.set(f.name, f);
  }

  // Ensure all requested foods exist
  for (const name of FOOD_NAMES) {
    if (!foods.has(name)) {
      console.error(`Missing food in database: ${name}`);
      process.exit(1);
    }
  }

  const models = [
    {
      title: 'Dieta Hipertrofia Avançada — 3000 kcal',
      targets: { c: 375, p: 225, f: 83 },
      bufferFoods: ['Arroz, tipo 1, cozido', 'Frango, peito, sem pele, grelhado', 'Azeite, de oliva, extra virgem'] as FoodName[],
      meals: [
        { name: 'Café da Manhã', time: '07:00', items: [
          { name: 'Ovo, de galinha, inteiro, cozido/10minutos', g: 150 },
          { name: 'Aveia, flocos, crua', g: 80 },
          { name: 'Banana, prata, crua', g: 100 }
        ] },
        { name: 'Lanche da Manhã', time: '10:00', items: [
          { name: 'Whey Protein Isolado (90%)', g: 40 }
        ] },
        { name: 'Almoço', time: '13:00', isBuffer: true }, // Buffer Meal 1
        { name: 'Lanche da Tarde', time: '16:00', items: [
          { name: 'Batata, doce, cozida', g: 200 },
          { name: 'Whey Protein Concentrado (80%)', g: 40 }
        ] },
        { name: 'Jantar', time: '19:00', isBuffer: true }, // Buffer Meal 2
        { name: 'Ceia', time: '22:00', items: [
          { name: 'Ovo, de galinha, inteiro, cozido/10minutos', g: 100 }
        ] }
      ]
    },
    {
      title: 'Emagrecimento Sustentável — 1800 kcal',
      targets: { c: 180, p: 150, f: 50 },
      bufferFoods: ['Arroz, integral, cozido', 'Frango, peito, sem pele, grelhado', 'Azeite, de oliva, extra virgem'] as FoodName[],
      meals: [
        { name: 'Café da Manhã', time: '08:00', items: [
          { name: 'Ovo, de galinha, inteiro, cozido/10minutos', g: 100 },
          { name: 'Banana, prata, crua', g: 80 }
        ] },
        { name: 'Almoço', time: '12:00', isBuffer: true },
        { name: 'Lanche da Tarde', time: '16:00', items: [
          { name: 'Whey Protein Isolado (90%)', g: 30 },
          { name: 'Aveia, flocos, crua', g: 30 }
        ] },
        { name: 'Jantar', time: '20:00', isBuffer: true }
      ]
    },
    {
      title: 'Definição Muscular — 2200 kcal',
      targets: { c: 200, p: 210, f: 60 },
      bufferFoods: ['Arroz, tipo 1, cozido', 'Frango, peito, sem pele, grelhado', 'Azeite, de oliva, extra virgem'] as FoodName[],
      meals: [
        { name: 'Café da Manhã', time: '07:30', items: [
          { name: 'Ovo, de galinha, inteiro, cozido/10minutos', g: 100 },
          { name: 'Pão, trigo, francês', g: 50 },
          { name: 'Queijo, minas, frescal', g: 30 }
        ] },
        { name: 'Lanche da Manhã', time: '10:30', items: [
          { name: 'Whey Protein Isolado (90%)', g: 30 }
        ] },
        { name: 'Almoço', time: '13:30', isBuffer: true },
        { name: 'Lanche da Tarde', time: '16:30', items: [
          { name: 'Batata, doce, cozida', g: 150 },
          { name: 'Frango, peito, sem pele, grelhado', g: 100 }
        ] },
        { name: 'Jantar', time: '19:30', isBuffer: true },
        { name: 'Ceia', time: '22:30', items: [
          { name: 'Whey Protein Concentrado (80%)', g: 30 }
        ] }
      ]
    },
    {
      title: 'Restrição: Sem Lactose + Low FODMAP',
      targets: { c: 230, p: 140, f: 62 },
      bufferFoods: ['Arroz, tipo 1, cozido', 'Carne, bovina, patinho, sem gordura, grelhado', 'Azeite, de oliva, extra virgem'] as FoodName[],
      meals: [
        { name: 'Café da Manhã', time: '08:00', items: [
          { name: 'Ovo, de galinha, inteiro, cozido/10minutos', g: 100 },
          { name: 'Banana, prata, crua', g: 100 },
          { name: 'Aveia, flocos, crua', g: 40 }
        ] },
        { name: 'Almoço', time: '12:00', isBuffer: true },
        { name: 'Lanche da Tarde', time: '16:00', items: [
          { name: 'Batata, doce, cozida', g: 150 },
          { name: 'Ovo, de galinha, inteiro, cozido/10minutos', g: 50 }
        ] },
        { name: 'Jantar', time: '20:00', isBuffer: true }
      ]
    },
    {
      title: 'Hipertrofia Iniciante — 2600 kcal',
      targets: { c: 310, p: 190, f: 72 },
      bufferFoods: ['Arroz, tipo 1, cozido', 'Frango, peito, sem pele, grelhado', 'Azeite, de oliva, extra virgem'] as FoodName[],
      meals: [
        { name: 'Café da Manhã', time: '07:30', items: [
          { name: 'Ovo, de galinha, inteiro, cozido/10minutos', g: 100 },
          { name: 'Pão, trigo, francês', g: 100 },
          { name: 'Queijo, minas, frescal', g: 30 }
        ] },
        { name: 'Lanche da Manhã', time: '10:30', items: [
          { name: 'Whey Protein Concentrado (80%)', g: 40 },
          { name: 'Banana, prata, crua', g: 100 }
        ] },
        { name: 'Almoço', time: '13:00', isBuffer: true },
        { name: 'Lanche da Tarde', time: '16:00', items: [
          { name: 'Batata, doce, cozida', g: 200 }
        ] },
        { name: 'Jantar', time: '20:00', isBuffer: true }
      ]
    },
    {
      title: 'Emagrecimento Express — 1500 kcal',
      targets: { c: 140, p: 130, f: 45 },
      bufferFoods: ['Batata, inglesa, cozida', 'Frango, peito, sem pele, grelhado', 'Azeite, de oliva, extra virgem'] as FoodName[],
      meals: [
        { name: 'Café da Manhã', time: '08:00', items: [
          { name: 'Ovo, de galinha, inteiro, cozido/10minutos', g: 100 },
          { name: 'Banana, prata, crua', g: 60 }
        ] },
        { name: 'Almoço', time: '12:30', isBuffer: true },
        { name: 'Lanche da Tarde', time: '16:30', items: [
          { name: 'Whey Protein Isolado (90%)', g: 30 }
        ] },
        { name: 'Jantar', time: '20:00', isBuffer: true }
      ]
    },
    {
      title: 'Restrição: Diabetes Tipo 2',
      targets: { c: 160, p: 155, f: 65 },
      bufferFoods: ['Arroz, integral, cozido', 'Frango, peito, sem pele, grelhado', 'Azeite, de oliva, extra virgem'] as FoodName[],
      meals: [
        { name: 'Café da Manhã', time: '08:00', items: [
          { name: 'Ovo, de galinha, inteiro, cozido/10minutos', g: 100 },
          { name: 'Aveia, flocos, crua', g: 30 }
        ] },
        { name: 'Lanche da Manhã', time: '10:30', items: [
          { name: 'Whey Protein Isolado (90%)', g: 30 }
        ] },
        { name: 'Almoço', time: '13:00', isBuffer: true },
        { name: 'Lanche da Tarde', time: '16:00', items: [
          { name: 'Queijo, minas, frescal', g: 50 },
          { name: 'Aveia, flocos, crua', g: 20 }
        ] },
        { name: 'Jantar', time: '19:00', isBuffer: true },
        { name: 'Ceia', time: '21:30', items: [
          { name: 'Whey Protein Isolado (90%)', g: 20 }
        ] }
      ]
    },
    {
      title: 'Definição Feminina — 1700 kcal',
      targets: { c: 155, p: 135, f: 52 },
      bufferFoods: ['Batata, inglesa, cozida', 'Frango, peito, sem pele, grelhado', 'Azeite, de oliva, extra virgem'] as FoodName[],
      meals: [
        { name: 'Café da Manhã', time: '08:00', items: [
          { name: 'Ovo, de galinha, inteiro, cozido/10minutos', g: 100 },
          { name: 'Aveia, flocos, crua', g: 30 }
        ] },
        { name: 'Almoço', time: '12:30', isBuffer: true },
        { name: 'Lanche da Tarde', time: '16:00', items: [
          { name: 'Whey Protein Isolado (90%)', g: 30 },
          { name: 'Banana, prata, crua', g: 50 }
        ] },
        { name: 'Jantar', time: '19:30', isBuffer: true }
      ]
    }
  ];

  for (const model of models) {
    console.log(`\\n======================================================`);
    console.log(`Processing Model: ${model.title}`);
    console.log(`Targets: C: ${model.targets.c}g | P: ${model.targets.p}g | F: ${model.targets.f}g`);
    
    let totalFixedC = 0, totalFixedP = 0, totalFixedF = 0;
    
    // Accumulate fixed meals macros
    for (const meal of model.meals) {
      if (meal.items) {
        for (const item of meal.items) {
          const food = foods.get(item.name);
          const mult = item.g / food.base_amount;
          totalFixedC += food.carbs_g * mult;
          totalFixedP += food.protein_g * mult;
          totalFixedF += food.fat_g * mult;
        }
      }
    }

    const remC = model.targets.c - totalFixedC;
    const remP = model.targets.p - totalFixedP;
    const remF = model.targets.f - totalFixedF;

    console.log(`Fixed Macros: C: ${totalFixedC.toFixed(2)} | P: ${totalFixedP.toFixed(2)} | F: ${totalFixedF.toFixed(2)}`);
    console.log(`Remaining: C: ${remC.toFixed(2)} | P: ${remP.toFixed(2)} | F: ${remF.toFixed(2)}`);

    const bf1 = foods.get(model.bufferFoods[0]); // Carbs buffer
    const bf2 = foods.get(model.bufferFoods[1]); // Protein buffer
    const bf3 = foods.get(model.bufferFoods[2]); // Fat buffer

    // Build matrix A (columns are foods 1,2,3, rows are C, P, F) per gram
    const A = [
      [bf1.carbs_g / bf1.base_amount, bf2.carbs_g / bf2.base_amount, bf3.carbs_g / bf3.base_amount],
      [bf1.protein_g / bf1.base_amount, bf2.protein_g / bf2.base_amount, bf3.protein_g / bf3.base_amount],
      [bf1.fat_g / bf1.base_amount, bf2.fat_g / bf2.base_amount, bf3.fat_g / bf3.base_amount]
    ];
    const b = [remC, remP, remF];

    let x: number[];
    try {
      x = solve3x3(A, b);
      console.log(`Solved Buffer Grams: ${bf1.name}=${x[0].toFixed(2)}g, ${bf2.name}=${x[1].toFixed(2)}g, ${bf3.name}=${x[2].toFixed(2)}g`);
    } catch (e: any) {
      console.error(`Error solving matrix for ${model.title}:`, e.message);
      continue;
    }

    if (x[0] < 0 || x[1] < 0 || x[2] < 0) {
      console.warn(`WARNING: Negative grams calculated for ${model.title}. Manual adjustment might be needed!`);
    }

    // Distribute buffer foods into buffer meals
    const bufferMealCount = model.meals.filter(m => m.isBuffer).length;
    
    // Now get the plan from DB
    const { data: planData } = await supabase.from('meal_plans').select('id').eq('title', model.title).single();
    if (!planData) {
      console.error(`Plan not found in DB: ${model.title}`);
      continue;
    }
    const planId = planData.id;

    // Delete existing meals and items for this plan
    console.log('Deleting old meals...');
    await supabase.from('meals').delete().eq('meal_plan_id', planId);

    // Insert new meals
    let totalPlanKcal = 0, totalPlanC = 0, totalPlanP = 0, totalPlanF = 0;

    for (let i = 0; i < model.meals.length; i++) {
      const meal = model.meals[i];
      const { data: insertedMeal, error: mealError } = await supabase.from('meals').insert({
        meal_plan_id: planId,
        name: meal.name,
        time: meal.time
      }).select('id').single();
      if (mealError) throw mealError;

      let itemsToInsert = [];

      if (meal.isBuffer) {
        // Divide solved grams by bufferMealCount
        itemsToInsert = [
          { name: bf1.name, g: x[0] / bufferMealCount },
          { name: bf2.name, g: x[1] / bufferMealCount },
          { name: bf3.name, g: x[2] / bufferMealCount }
        ];
      } else {
        itemsToInsert = meal.items!;
      }

      for (const item of itemsToInsert) {
        if (item.g <= 0) continue; // Skip zero or negative foods
        
        const food = foods.get(item.name);
        const mult = item.g / food.base_amount;
        const c = food.carbs_g * mult;
        const p = food.protein_g * mult;
        const f = food.fat_g * mult;
        const k = food.kcal * mult;

        totalPlanC += c;
        totalPlanP += p;
        totalPlanF += f;
        totalPlanKcal += k;

        await supabase.from('meal_items').insert({
          meal_id: insertedMeal!.id,
          food_id: food.id,
          food_name: food.name,
          quantity_g: Number(item.g.toFixed(3)),
          kcal: Number(k.toFixed(3)),
          protein_g: Number(p.toFixed(3)),
          carbs_g: Number(c.toFixed(3)),
          fat_g: Number(f.toFixed(3))
        });
      }
    }

    // Update plan totals
    console.log(`New Plan Totals: Kcal=${totalPlanKcal.toFixed(1)} | C=${totalPlanC.toFixed(1)} | P=${totalPlanP.toFixed(1)} | F=${totalPlanF.toFixed(1)}`);
    
    await supabase.from('meal_plans').update({
      daily_kcal_goal: Math.round(totalPlanKcal), // Use real TACO Kcal
      protein_g: Math.round(totalPlanP),
      carbs_g: Math.round(totalPlanC),
      fat_g: Math.round(totalPlanF)
    }).eq('id', planId);
  }

  console.log('\\nDone!');
}

run().catch(e => console.error(e));
