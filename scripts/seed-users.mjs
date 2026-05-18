#!/usr/bin/env node
/**
 * KORE — Seed de usuários de teste no Supabase.
 *
 * Cria (idempotente) 5 contas cobrindo todas as roles do RBAC:
 *   - admin@kore.test       (role: admin)        → /dashboard/admin
 *   - nutri@kore.test       (role: nutritionist) → /dashboard/nutri
 *   - personal@kore.test    (role: trainer)      → /dashboard/personal
 *   - shop@kore.test        (role: merchant)     → /dashboard/shop
 *   - cliente@kore.test     (role: client)       → /app
 *
 * Senha padrão para todos: ver SEED_PASSWORD abaixo (override via env).
 *
 * Como funciona:
 *   1. `auth.admin.createUser` cria a conta com email_confirmed = true
 *      e `user_metadata.role` definido.
 *   2. O trigger `handle_new_user` em auth.users (migration 0001_init.sql)
 *      lê esse metadata e cria a linha em `public.profiles` com a role.
 *      Exceção: 'admin' é ignorado pelo trigger — promovemos aqui via
 *      UPDATE direto (bypassa RLS pq usamos service_role).
 *   3. Se o usuário já existe, atualizamos a senha (resetar p/ a senha
 *      conhecida) e garantimos a role correta no profile.
 *
 * Uso:
 *   node scripts/seed-users.mjs
 *
 * Requisitos no .env.local (ou env):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

// --- Carrega .env.local se existir (sem dep externa) ------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");
try {
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    const key = m[1];
    let val = m[2];
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    if (!(key in process.env)) process.env[key] = val;
  }
} catch {
  // .env.local opcional — env vars podem vir do shell.
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SEED_PASSWORD = process.env.SEED_PASSWORD ?? "Kore@2025!";

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error(
    "[seed] Faltam variáveis: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias.",
  );
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

// --- Definição dos usuários de teste ----------------------------------
/**
 * @typedef {Object} SeedUser
 * @property {string} email
 * @property {string} fullName
 * @property {"admin"|"nutritionist"|"trainer"|"merchant"|"client"} role
 */

/** @type {SeedUser[]} */
const USERS = [
  {
    email: "admin@kore.test",
    fullName: "Admin KORE",
    role: "admin",
  },
  {
    email: "nutri@kore.test",
    fullName: "Nutri Teste",
    role: "nutritionist",
  },
  {
    email: "personal@kore.test",
    fullName: "Personal Teste",
    role: "trainer",
  },
  {
    email: "shop@kore.test",
    fullName: "Loja Teste",
    role: "merchant",
  },
  {
    email: "cliente@kore.test",
    fullName: "Cliente Teste",
    role: "client",
  },
];

// --- Helpers ---------------------------------------------------------

/**
 * Lista todos os usuários e procura por email (a Admin API ainda não tem
 * `getUserByEmail`, então paginamos até encontrar). 1000/página é o teto.
 */
async function findUserByEmail(email) {
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const match = data.users.find(
      (u) => (u.email ?? "").toLowerCase() === email.toLowerCase(),
    );
    if (match) return match;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

/** Cria ou atualiza um usuário; garante o profile com a role correta. */
async function upsertSeedUser(user) {
  const existing = await findUserByEmail(user.email);

  // O trigger handle_new_user só aceita roles != 'admin'. Para outros papéis,
  // mandamos a role direto no metadata e o trigger cria o profile.
  const triggerRole = user.role === "admin" ? "client" : user.role;

  let userId;
  if (existing) {
    const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
      password: SEED_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: user.fullName,
        role: triggerRole,
      },
    });
    if (error) throw error;
    userId = data.user.id;
    console.log(`[seed] [update] ${user.email} (${user.role}) → ${userId}`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: user.email,
      password: SEED_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: user.fullName,
        role: triggerRole,
      },
    });
    if (error) throw error;
    userId = data.user.id;
    console.log(`[seed] [create] ${user.email} (${user.role}) → ${userId}`);
  }

  // Garante linha em profiles (trigger pode falhar silenciosamente se a
  // role já existir com valor diferente; service_role bypassa RLS).
  const { error: upsertErr } = await admin
    .from("profiles")
    .upsert(
      {
        id: userId,
        full_name: user.fullName,
        role: user.role,
        status: "active",
      },
      { onConflict: "id" },
    );
  if (upsertErr) throw upsertErr;

  // user_daily_targets também é criado pelo trigger; garantimos por idempotência.
  const { error: targetsErr } = await admin
    .from("user_daily_targets")
    .upsert({ user_id: userId }, { onConflict: "user_id" });
  if (targetsErr && targetsErr.code !== "23505") {
    // 23505 = unique_violation; pode acontecer em corridas. Ignoramos.
    console.warn(`[seed] aviso user_daily_targets ${user.email}:`, targetsErr.message);
  }

  return userId;
}

// --- Main ------------------------------------------------------------
async function main() {
  console.log(`[seed] Supabase URL: ${SUPABASE_URL}`);
  console.log(`[seed] Senha padrão: ${SEED_PASSWORD}`);
  console.log(`[seed] Total de usuários: ${USERS.length}`);
  console.log();

  for (const u of USERS) {
    try {
      await upsertSeedUser(u);
    } catch (err) {
      console.error(`[seed] FALHA ${u.email}:`, err?.message ?? err);
      process.exitCode = 1;
    }
  }

  console.log();
  console.log("[seed] Contas de teste:");
  console.log("┌──────────────────────┬──────────────┬──────────────────────────┐");
  console.log("│ email                │ role         │ destino pós-login        │");
  console.log("├──────────────────────┼──────────────┼──────────────────────────┤");
  const homes = {
    admin: "/dashboard/admin",
    nutritionist: "/dashboard/nutri",
    trainer: "/dashboard/personal",
    merchant: "/dashboard/shop",
    client: "/app",
  };
  for (const u of USERS) {
    console.log(
      `│ ${u.email.padEnd(20)} │ ${u.role.padEnd(12)} │ ${homes[u.role].padEnd(24)} │`,
    );
  }
  console.log("└──────────────────────┴──────────────┴──────────────────────────┘");
  console.log(`Senha (todos): ${SEED_PASSWORD}`);
}

main().catch((err) => {
  console.error("[seed] erro fatal:", err);
  process.exit(1);
});
