export interface PatientBiometrics {
  birth_date?: string | null;
  weight?: string | number | null;
  height?: string | number | null;
  gender?: string | null;
  training_freq?: string | null;
  goal?: string | null;
}

export interface MetabolismResult {
  tmb: number;
  tdee: number;
  adjustment: number;
  finalTargetKcal: number;
  formulaUsed: string;
}

/**
 * Motor de Cálculo Metabólico do KORE
 * Estima a TMB e o Gasto Energético Total baseado na biometria do paciente.
 */
export function calculateTargetCalories(
  patient: PatientBiometrics, 
  formulaPreference: "mifflin" | "harris-benedict" = "mifflin"
): MetabolismResult | null {
  if (!patient || !patient.birth_date || !patient.weight || !patient.height) return null;

  // A. Cálculo da Idade
  const birthDate = new Date(patient.birth_date);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // Parse Biometria com fallback rigoroso para numéricos
  const w = typeof patient.weight === 'string' ? parseFloat(patient.weight) : Number(patient.weight);
  const h = typeof patient.height === 'string' ? parseFloat(patient.height) : Number(patient.height);
  
  if (isNaN(w) || isNaN(h)) return null;

  const gender = (patient.gender || "male").toLowerCase();
  const isMale = gender === "male" || gender === "masculino";

  // B. Cálculo da TMB (Taxa Metabólica Basal)
  let tmb = 0;
  const formulaUsed = formulaPreference === "harris-benedict" ? "Harris-Benedict" : "Mifflin-St Jeor";

  if (formulaPreference === "harris-benedict") {
    if (isMale) {
      tmb = (13.397 * w) + (4.799 * h) - (5.677 * age) + 88.362;
    } else {
      tmb = (9.247 * w) + (3.098 * h) - (4.330 * age) + 447.593;
    }
  } else {
    // Mifflin-St Jeor
    tmb = (10 * w) + (6.25 * h) - (5 * age);
    if (isMale) {
      tmb += 5;
    } else {
      tmb -= 161;
    }
  }

  // C. Multiplicador de Atividade (TDEE)
  const freq = patient.training_freq || "";
  let multiplier = 1.2; // Sedentário
  if (freq.includes("1-2x")) multiplier = 1.375;
  else if (freq.includes("3-4x")) multiplier = 1.55;
  else if (freq.includes("5+x") || freq.includes("Todos")) multiplier = 1.725;
  
  const tdee = Math.round(tmb * multiplier);

  // D. Ajuste de Objetivo
  let adjustment = 0;
  const goal = patient.goal || "Saúde Geral";
  if (goal === "Hipertrofia") adjustment = 500;
  else if (goal === "Emagrecimento") adjustment = -500;

  const finalTargetKcal = Math.round(tdee + adjustment);

  return {
    tmb: Math.round(tmb),
    tdee,
    adjustment,
    finalTargetKcal,
    formulaUsed
  };
}
