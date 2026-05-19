"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { homePathForRole, type UserRole } from "@/lib/auth/rbac";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const credentialsSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Mínimo de 8 caracteres"),
});

const signUpSchema = credentialsSchema.extend({
  fullName: z.string().min(2, "Nome obrigatório"),
  role: z
    .enum(["nutritionist", "trainer", "merchant", "client"])
    .optional(),
});

export type AuthResult =
  | { ok: true }
  | { ok: false; error: string; field?: "email" | "password" | "fullName" };

export async function signInWithPasswordAction(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      error: issue?.message ?? "Credenciais inválidas",
      field: issue?.path[0] as "email" | "password" | undefined,
    };
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return { ok: false, error: "E-mail ou senha incorretos." };
  }

  // Lê role do profile recém-autenticado pra redirecionar pra Home certa.
  type RoleRow = { role: UserRole };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle<RoleRow>();

  const role: UserRole = profile?.role ?? "client";

  revalidatePath("/", "layout");
  redirect(homePathForRole(role));
}

export async function signUpWithPasswordAction(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") ?? undefined,
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      error: issue?.message ?? "Dados inválidos",
      field: issue?.path[0] as "email" | "password" | "fullName" | undefined,
    };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // role é lido pela trigger handle_new_user (fallback 'client').
      data: {
        full_name: parsed.data.fullName,
        ...(parsed.data.role ? { role: parsed.data.role } : {}),
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function signOutAction() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
