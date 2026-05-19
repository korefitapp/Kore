"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { homePathForRole, type UserRole } from "@/lib/auth/rbac";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// =====================================================================
// Helpers
// =====================================================================
function isEmail(value: string): boolean {
  return /@/.test(value);
}

/** Mantém apenas dígitos. "(11) 99999-8888" → "11999998888". */
function normalizePhone(value: string): string {
  return value.replace(/\D+/g, "");
}

const PROFESSIONAL_ROLES = ["nutritionist", "trainer", "merchant"] as const;
const ROLES = [...PROFESSIONAL_ROLES, "client"] as const;
type SignUpRole = (typeof ROLES)[number];

// =====================================================================
// Schemas
// =====================================================================

/** Login aceita e-mail OU telefone (campo único `identifier`). */
const signInSchema = z.object({
  identifier: z
    .string()
    .min(3, "Informe e-mail ou celular")
    .transform((s) => s.trim()),
  password: z.string().min(8, "Mínimo de 8 caracteres"),
});

/**
 * Sign-up exige nome, telefone, role e (condicionalmente) documento.
 * O refinamento condicional cobre CREF/CRN/CNPJ por role.
 */
const signUpSchema = z
  .object({
    fullName: z.string().min(2, "Nome obrigatório"),
    email: z.string().email("E-mail inválido"),
    phone: z
      .string()
      .min(10, "Celular obrigatório")
      .transform((s) => normalizePhone(s))
      .refine((s) => s.length >= 10 && s.length <= 14, {
        message: "Celular inválido (DDD + número)",
      }),
    password: z.string().min(8, "Mínimo de 8 caracteres"),
    role: z.enum(ROLES, { errorMap: () => ({ message: "Tipo de conta inválido" }) }),
    cref: z.string().optional().transform((s) => s?.trim() || undefined),
    crn: z.string().optional().transform((s) => s?.trim() || undefined),
    cnpj: z.string().optional().transform((s) => s?.trim() || undefined),
  })
  .superRefine((data, ctx) => {
    if (data.role === "trainer" && !data.cref) {
      ctx.addIssue({
        code: "custom",
        path: ["cref"],
        message: "CREF obrigatório para Personal Trainer",
      });
    }
    if (data.role === "nutritionist" && !data.crn) {
      ctx.addIssue({
        code: "custom",
        path: ["crn"],
        message: "CRN obrigatório para Nutricionista",
      });
    }
    if (data.role === "merchant" && !data.cnpj) {
      ctx.addIssue({
        code: "custom",
        path: ["cnpj"],
        message: "CNPJ obrigatório para Lojista",
      });
    }
  });

export type AuthField =
  | "identifier"
  | "email"
  | "phone"
  | "password"
  | "fullName"
  | "role"
  | "cref"
  | "crn"
  | "cnpj";

export type AuthResult =
  | { ok: true }
  | { ok: false; error: string; field?: AuthField };

// =====================================================================
// signIn — e-mail OU celular + senha
// =====================================================================
export async function signInWithPasswordAction(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const parsed = signInSchema.safeParse({
    identifier: formData.get("identifier") ?? formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      error: issue?.message ?? "Credenciais inválidas",
      field: issue?.path[0] as AuthField | undefined,
    };
  }

  // Resolve e-mail: se o identifier não é e-mail, busca via Service Role.
  let email = parsed.data.identifier;
  if (!isEmail(email)) {
    const phone = normalizePhone(email);
    if (phone.length < 10) {
      return {
        ok: false,
        error: "Celular inválido (DDD + número)",
        field: "identifier",
      };
    }
    const admin = createSupabaseAdminClient();
    const { data: resolved, error: rpcErr } = await admin.rpc(
      "email_for_phone",
      { p_phone: phone },
    );
    if (rpcErr || !resolved) {
      return {
        ok: false,
        error: "Nenhuma conta encontrada para esse celular.",
        field: "identifier",
      };
    }
    email = resolved;
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return { ok: false, error: "E-mail/celular ou senha incorretos." };
  }

  // Lê role + status do profile pra decidir destino.
  type RoleStatusRow = {
    role: UserRole;
    status: "active" | "paused" | "churned" | "pending";
  };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", data.user.id)
    .maybeSingle<RoleStatusRow>();

  const role: UserRole = profile?.role ?? "client";
  const status = profile?.status ?? "active";

  revalidatePath("/", "layout");

  // Profissional pendente → tela de espera (admin precisa aprovar).
  if (status === "pending" && role !== "admin" && role !== "client") {
    redirect("/aguardando-aprovacao");
  }

  redirect(homePathForRole(role));
}

// =====================================================================
// signUp — role + telefone + documento condicional
// =====================================================================
export async function signUpWithPasswordAction(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const roleRaw = formData.get("role");
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    role: roleRaw,
    cref: formData.get("cref") ?? undefined,
    crn: formData.get("crn") ?? undefined,
    cnpj: formData.get("cnpj") ?? undefined,
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      error: issue?.message ?? "Dados inválidos",
      field: issue?.path[0] as AuthField | undefined,
    };
  }

  const { fullName, email, phone, password, role, cref, crn, cnpj } =
    parsed.data;

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // O trigger handle_new_user lê tudo daqui e popula `profiles`.
      data: {
        full_name: fullName,
        role,
        phone,
        ...(role === "trainer" && cref ? { cref } : {}),
        ...(role === "nutritionist" && crn ? { crn } : {}),
        ...(role === "merchant" && cnpj ? { cnpj } : {}),
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/auth/callback`,
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

// =====================================================================
// signOut
// =====================================================================
export async function signOutAction() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

// =====================================================================
// approveProfessionalAction — admin aprova candidato pending
// =====================================================================
export async function approveProfessionalAction(
  profileId: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!profileId) return { ok: false, error: "ID inválido" };

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Não autenticado" };

  // Confirma que quem chama é admin.
  const { data: caller } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: UserRole }>();
  if (caller?.role !== "admin") return { ok: false, error: "Sem permissão" };

  // Service Role bypassa RLS (que bloqueia mudança de status do próprio user).
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ status: "active" })
    .eq("id", profileId)
    .in("role", ["nutritionist", "trainer", "merchant"]);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/admin");
  return { ok: true };
}

// =====================================================================
// rejectProfessionalAction — admin marca candidato como pausado
// =====================================================================
export async function rejectProfessionalAction(
  profileId: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!profileId) return { ok: false, error: "ID inválido" };

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Não autenticado" };

  const { data: caller } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: UserRole }>();
  if (caller?.role !== "admin") return { ok: false, error: "Sem permissão" };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ status: "paused" })
    .eq("id", profileId)
    .in("role", ["nutritionist", "trainer", "merchant"]);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/admin");
  return { ok: true };
}
