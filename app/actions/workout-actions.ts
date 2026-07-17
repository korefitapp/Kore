"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type WorkoutDayExercise = {
  exercise_id: string;
  sets?: number;
  reps?: string;
  weight?: string;
  rest_time?: string;
  technique?: string;
  observation?: string;
};

export type WorkoutDayPayload = {
  name: string;
  exercises: WorkoutDayExercise[];
};

export type WorkoutPayload = {
  name: string;
  objective: string;
  level: string;
  description: string;
  days: WorkoutDayPayload[];
};

export async function createWorkoutAction(data: WorkoutPayload) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  // 1. Insert Workout
  const { data: workoutData, error: workoutError } = await supabase
    .from("workouts")
    .insert({
      name: data.name,
      objective: data.objective,
      level: data.level,
      description: data.description,
      professional_id: user.id,
    })
    .select("id")
    .single();

  if (workoutError || !workoutData) {
    console.error("Erro ao criar treino:", workoutError);
    throw new Error("Erro ao criar treino.");
  }

  const workoutId = workoutData.id;

  // 2. Iterate over days and insert them
  if (data.days && data.days.length > 0) {
    for (let i = 0; i < data.days.length; i++) {
      const day = data.days[i];
      if (!day) continue;
      const { data: dayData, error: dayError } = await supabase
        .from("workout_days")
        .insert({
          workout_id: workoutId,
          name: day.name,
          order: i,
        })
        .select("id")
        .single();

      if (dayError || !dayData) {
        console.error("Erro ao criar dia:", dayError);
        continue;
      }

      const dayId = dayData.id;

      // 3. Iterate over exercises for this day and insert
      if (day.exercises && day.exercises.length > 0) {
        const exercisesToInsert = day.exercises.map((ex, exIndex) => ({
          workout_day_id: dayId,
          exercise_id: ex.exercise_id,
          order: exIndex,
          sets: ex.sets || null,
          reps: ex.reps || null,
          weight: ex.weight || null,
          rest_time: ex.rest_time || null,
          technique: ex.technique || null,
          observation: ex.observation || null,
        }));

        const { error: exError } = await supabase
          .from("workout_day_exercises")
          .insert(exercisesToInsert);

        if (exError) {
          console.error("Erro ao inserir exercícios do dia:", exError);
        }
      }
    }
  }

  revalidatePath("/dashboard/personal/workouts");
  return workoutId;
}

export async function createPersonalizedWorkoutAction(data: WorkoutPayload, studentId: string) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado.");

  // Fetch student info
  const { data: student } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", studentId)
    .single();

  const studentName = student?.full_name ? student.full_name.split(" ")[0] : "Aluno";
  const customName = data.name.includes("Personalizado") ? data.name : `${data.name} (Personalizado ${studentName})`;

  // Use the existing logic to create the base workout
  const workoutId = await createWorkoutAction({
    ...data,
    name: customName,
  });

  // Now, assign this new workout to the student
  const { createWorkoutPlan } = await import("@/app/actions/personal-actions_fixed");
  const res = await createWorkoutPlan(studentId, customName, "Treino personalizado atualizado.", workoutId);
  
  if (!res.ok) {
    throw new Error("Treino criado, mas houve erro ao atribuir ao aluno: " + res.error);
  }

  revalidatePath(`/dashboard/personal/students`);
  return workoutId;
}

export async function getWorkoutDetailsAction(workoutId: string) {
  const supabase = createSupabaseServerClient();
  
  const { data: workout, error: wError } = await supabase
    .from("workouts")
    .select("*")
    .eq("id", workoutId)
    .single();

  if (wError || !workout) throw new Error("Treino não encontrado.");

  const { data: days, error: dError } = await supabase
    .from("workout_days")
    .select(`
      id,
      name,
      order,
      workout_day_exercises (
        id,
        sets,
        reps,
        weight,
        rest_time,
        technique,
        observation,
        order,
        exercises (
          id,
          name,
          target_muscle_group,
          category
        )
      )
    `)
    .eq("workout_id", workoutId)
    .order("order", { ascending: true });

  if (dError) throw new Error("Erro ao buscar dias do treino.");

  return { workout, days: days || [] };
}
