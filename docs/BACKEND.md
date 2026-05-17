# KORE — Fundação do Backend Real (Supabase + Next.js)

Este documento aterrissa a primeira camada do backend: schema inicial no Supabase, cliente tipado, troca do login simulado pelo real (email/senha + Google OAuth) e estrutura de pastas do repo **Kodex.fit** preparada para escalar até o Marketplace.

Stack alvo:

- **Banco/Auth:** Supabase (PostgreSQL 15 + `auth.users` + RLS + Storage).
- **API Server:** Next.js 14 (App Router) — Route Handlers em `app/api/*` para webhooks do Stripe Connect e n8n.
- **Frontend Web:** Next.js 14 (Server Components + Client Components onde necessário).
- **Mobile (futuro):** Expo SDK 51 consumindo o mesmo `lib/supabase`.

---

## A. Script SQL Inicial (Supabase SQL Editor)

Cole o bloco abaixo inteiro no **SQL Editor → New query** e rode. Ele é idempotente (`if not exists`, `create or replace`) — pode ser rodado várias vezes sem quebrar.

```sql
-- =========================================================================
-- KORE :: 0001_init.sql
-- Extensions, profiles, daily targets, trigger de auto-criação de profile
-- =========================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- -------------------------------------------------------------------------
-- Enum de papéis no ecossistema
-- -------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('client', 'coach', 'nutritionist', 'merchant', 'admin');
  end if;
end$$;

-- -------------------------------------------------------------------------
-- 1) PROFILES — extensão pública do auth.users
--    1:1 com auth.users via PK = id (mesmo uuid)
-- -------------------------------------------------------------------------
create table if not exists public.user_profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  email             citext not null,
  full_name         text   not null default '',
  display_name      text,
  avatar_url        text,
  role              user_role not null default 'client',
  phone_e164        text,
  birth_date        date,
  height_cm         numeric(5,2),
  weight_kg         numeric(5,2),
  timezone          text not null default 'America/Sao_Paulo',
  locale            text not null default 'pt-BR',
  theme_preference  text not null default 'light' check (theme_preference in ('light','dark','system')),
  onboarding_done   boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create unique index if not exists user_profiles_email_idx
  on public.user_profiles (email);

-- -------------------------------------------------------------------------
-- 2) DAILY TARGETS — metas dinâmicas (água, kcal, macros)
--    Separado do profile pois muda em função do treino do dia
-- -------------------------------------------------------------------------
create table if not exists public.user_daily_targets (
  user_id          uuid primary key references public.user_profiles(id) on delete cascade,
  water_ml_goal    integer not null default 3000 check (water_ml_goal between 500 and 8000),
  kcal_goal        integer not null default 2400 check (kcal_goal between 800 and 6000),
  protein_g_goal   integer not null default 180,
  carbs_g_goal     integer not null default 280,
  fat_g_goal       integer not null default 70,
  updated_at       timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- 3) AUDIT — updated_at automático
-- -------------------------------------------------------------------------
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end$$;

drop trigger if exists set_updated_at on public.user_profiles;
create trigger set_updated_at
  before update on public.user_profiles
  for each row execute function public.tg_set_updated_at();

drop trigger if exists set_updated_at on public.user_daily_targets;
create trigger set_updated_at
  before update on public.user_daily_targets
  for each row execute function public.tg_set_updated_at();

-- -------------------------------------------------------------------------
-- 4) HANDLE_NEW_USER — cria profile + targets ao criar auth.users
--    Roda como SECURITY DEFINER pra atravessar RLS no momento do signup
-- -------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_full_name text;
  v_avatar    text;
begin
  v_full_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    split_part(new.email, '@', 1)
  );
  v_avatar := new.raw_user_meta_data ->> 'avatar_url';

  insert into public.user_profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, v_full_name, v_avatar)
  on conflict (id) do nothing;

  insert into public.user_daily_targets (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================================
-- RLS — Row Level Security
-- =========================================================================
alter table public.user_profiles      enable row level security;
alter table public.user_daily_targets enable row level security;

-- Cada usuário lê/atualiza apenas seu próprio profile
drop policy if exists "profiles_select_own" on public.user_profiles;
create policy "profiles_select_own"
  on public.user_profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.user_profiles;
create policy "profiles_update_own"
  on public.user_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- INSERT vem só via trigger handle_new_user (SECURITY DEFINER) — nada de policy aqui

-- Daily targets: mesmo padrão
drop policy if exists "targets_select_own" on public.user_daily_targets;
create policy "targets_select_own"
  on public.user_daily_targets for select
  using (auth.uid() = user_id);

drop policy if exists "targets_update_own" on public.user_daily_targets;
create policy "targets_update_own"
  on public.user_daily_targets for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =========================================================================
-- VIEW conveniente: GET /user/dashboard hidrata daqui
-- =========================================================================
create or replace view public.v_user_dashboard as
select
  p.id,
  p.email,
  p.full_name,
  p.display_name,
  p.avatar_url,
  p.role,
  p.theme_preference,
  p.timezone,
  t.water_ml_goal,
  t.kcal_goal,
  t.protein_g_goal,
  t.carbs_g_goal,
  t.fat_g_goal
from public.user_profiles p
left join public.user_daily_targets t on t.user_id = p.id;

-- Permite o cliente autenticado consultar a view (RLS das tabelas-base já filtra)
grant select on public.v_user_dashboard to authenticated;
```

### O que o script entrega

| Recurso | Para que serve |
| --- | --- |
| `user_profiles` (1:1 com `auth.users`) | Nome, avatar, role, fuso, locale, tema |
| `user_daily_targets` | Metas diárias (água, kcal, macros) — mutáveis pela sinergia treino↔nutrição |
| Trigger `handle_new_user` | Cria profile + targets automaticamente no signup (email/senha **e** OAuth) |
| Trigger `set_updated_at` | Mantém `updated_at` consistente sem código no client |
| RLS | Usuário só enxerga/edita o que é dele — sem código defensivo no client |
| View `v_user_dashboard` | Query única já filtrada por RLS pro endpoint do dashboard |

### Variáveis de Auth no Supabase Dashboard

1. **Authentication → Providers**
   - Habilite **Email** (deixe "Confirm email" ON em produção, OFF no dev pra agilizar).
   - Habilite **Google** e cole `Client ID` + `Client Secret` (criar em [console.cloud.google.com](https://console.cloud.google.com) → OAuth Client ID → Web Application).
   - Em **Authorized redirect URIs** do Google adicione: `https://<project>.supabase.co/auth/v1/callback`.
2. **Authentication → URL Configuration**
   - `Site URL` = `https://kodex.fit` (produção) e `http://localhost:3000` (dev).
   - `Additional Redirect URLs` = `https://kodex.fit/auth/callback`, `http://localhost:3000/auth/callback`.

---

## B. Cliente Supabase + Troca do Login Simulado

### B.1 Instalação

```bash
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add -D supabase             # CLI local (migrations, types)
```

### B.2 Variáveis de ambiente

`.env.local` (commit do `.env.example`, **nunca** do `.env.local`):

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...     # só server-side (webhooks Stripe/n8n)
```

> A `service_role` **nunca** pode vazar pro client. Use só em Route Handlers/Server Actions/Edge Functions.

### B.3 Tipos gerados (opcional mas recomendado)

```bash
npx supabase gen types typescript --project-id xxxxx --schema public \
  > lib/supabase/database.types.ts
```

### B.4 Três clientes — browser, server, admin

**`lib/supabase/client.ts`** — usado em Client Components

```typescript
"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

**`lib/supabase/server.ts`** — usado em Server Components, Route Handlers, Server Actions

```typescript
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

export function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options: CookieOptions) =>
          cookieStore.set({ name, value, ...options }),
        remove: (name, options: CookieOptions) =>
          cookieStore.set({ name, value: "", ...options }),
      },
    },
  );
}
```

**`lib/supabase/admin.ts`** — só p/ webhooks (Stripe, n8n)

```typescript
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);
```

### B.5 Substituindo o `login()` simulado do Zustand

**Antes (protótipo):**

```typescript
// src/store.ts (protótipo Vite)
login: (email) => set((s) => ({
  isAuthenticated: true,
  tab: "home",
  user: email ? { ...s.user, email } : s.user,
})),
```

**Depois (com Supabase, em Next.js):**

`lib/auth/actions.ts` — Server Actions

```typescript
"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signInWithPasswordAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false as const, message: error.message };
  }

  redirect("/app");
}

export async function signOutAction() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
```

`app/(auth)/login/_components/login-form.tsx` — Client Component substituindo o `LoginScreen.tsx`

```tsx
"use client";

import { useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { signInWithPasswordAction } from "@/lib/auth/actions";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const supabase = createSupabaseBrowserClient();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await signInWithPasswordAction(formData);
      if (res && !res.ok) setError(res.message);
    });
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) setError(error.message);
  }

  return (
    <form action={onSubmit} className="space-y-3">
      <input name="email" type="email" required className="…" />
      <input name="password" type="password" required className="…" />
      <button disabled={pending} className="btn-emerald">
        {pending ? "Entrando…" : "Entrar"}
      </button>
      <button type="button" onClick={signInWithGoogle} className="btn-ghost">
        Continuar com Google
      </button>
      {error && <p className="text-rose-500 text-sm">{error}</p>}
    </form>
  );
}
```

`app/auth/callback/route.ts` — troca o `code` do OAuth pela sessão e seta cookies

```typescript
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app";

  if (code) {
    const supabase = createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(`${origin}${next}`);
}
```

`middleware.ts` — proteção da rota `/app/**`

```typescript
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options: CookieOptions) =>
          res.cookies.set({ name, value, ...options }),
        remove: (name, options: CookieOptions) =>
          res.cookies.set({ name, value: "", ...options }),
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && req.nextUrl.pathname.startsWith("/app")) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return res;
}

export const config = { matcher: ["/app/:path*", "/api/protected/:path*"] };
```

### B.6 Hidratando o Zustand a partir do Supabase

O `useKore` continua sendo a **fonte de verdade do client** (porque é onde estão Água/Macros/Carrinho), mas o `user` + `isAuthenticated` agora vêm do Supabase:

`lib/auth/use-auth-bootstrap.ts`

```typescript
"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useKore } from "@/stores/kore";

export function useAuthBootstrap() {
  const setUser = useKore((s) => s.setUser);
  const setAuthenticated = useKore((s) => s.setAuthenticated);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        setAuthenticated(false);
        return;
      }
      const { data: profile } = await supabase
        .from("v_user_dashboard")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setUser({
          name: profile.full_name,
          email: profile.email,
          avatar: profile.avatar_url ?? "🧘‍♀️",
          plan: "Premium",
          memberSince: "",
        });
        setAuthenticated(true);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, [setUser, setAuthenticated]);
}
```

Monte esse hook uma vez no `app/layout.tsx` (em um `<AuthBootstrap />` client component) — daí em diante todas as telas leem `useKore`.

---

## C. Estrutura de Pastas — repo `kodex.fit`

Convenção pensada pra escalar até Marketplace + Stripe Connect + jobs do n8n sem reorganizar tudo depois.

```
kodex.fit/
├── app/                              # Next.js App Router
│   ├── (marketing)/                  # landing, /pricing, /sobre  (público)
│   │   ├── page.tsx
│   │   └── pricing/page.tsx
│   ├── (auth)/                       # /login, /signup, /forgot-password
│   │   ├── layout.tsx                # sem chrome do app (centered card)
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── _components/login-form.tsx
│   │   └── signup/page.tsx
│   ├── app/                          # AREA AUTENTICADA — protegida por middleware
│   │   ├── layout.tsx                # BottomNav + Topbar
│   │   ├── (home)/page.tsx           # Tab Home
│   │   ├── dieta/page.tsx
│   │   ├── treino/page.tsx
│   │   ├── shop/page.tsx
│   │   ├── perfil/page.tsx
│   │   └── _components/              # componentes específicos da área logada
│   ├── auth/
│   │   └── callback/route.ts         # OAuth code-exchange
│   ├── api/                          # ROTAS SERVER-ONLY
│   │   ├── stripe/
│   │   │   ├── webhook/route.ts      # POST /api/stripe/webhook
│   │   │   ├── checkout/route.ts     # POST /api/stripe/checkout  (Connect split)
│   │   │   └── connect/route.ts      # onboarding de merchant/profissional
│   │   ├── n8n/
│   │   │   └── webhook/route.ts      # eventos -> n8n (recuperar streak, etc)
│   │   ├── shop/
│   │   │   ├── stores/route.ts       # GET por geohash
│   │   │   └── products/route.ts
│   │   └── dashboard/route.ts        # GET v_user_dashboard
│   ├── layout.tsx                    # ThemeProvider + AuthBootstrap
│   └── globals.css
│
├── components/                       # UI compartilhada (shadcn + custom)
│   ├── ui/                           # button, dialog, sheet, input… (shadcn)
│   ├── motion/                       # WaterBar, KcalHero, CircularTimer
│   └── nav/                          # BottomNav, Topbar
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # browser
│   │   ├── server.ts                 # server components / actions
│   │   ├── admin.ts                  # service_role  (só em /api/*)
│   │   └── database.types.ts         # gerado pela CLI
│   ├── auth/
│   │   ├── actions.ts                # signIn/signOut Server Actions
│   │   └── use-auth-bootstrap.ts
│   ├── stripe/
│   │   ├── client.ts
│   │   ├── connect.ts                # application_fee, transfer_data.destination
│   │   └── webhook-events.ts
│   ├── n8n/
│   │   └── dispatch.ts               # POST p/ workflows
│   ├── domain/                       # REGRAS DE NEGÓCIO (puras, testáveis)
│   │   ├── nutrition/
│   │   │   ├── macros.ts             # cálculo de meta dinâmica pós-treino
│   │   │   └── water.ts
│   │   ├── training/
│   │   │   └── periodization.ts
│   │   └── shop/
│   │       ├── pricing.ts            # desconto, frete, split
│   │       └── distance.ts           # haversine, raio de entrega
│   ├── utils/
│   │   ├── cn.ts                     # tailwind-merge
│   │   ├── date.ts
│   │   └── format.ts                 # BRL, kcal, distância
│   └── env.ts                        # validação zod das envs
│
├── stores/                           # Zustand
│   └── kore.ts                       # ex-src/store.ts do protótipo
│
├── supabase/                         # migrations + edge functions
│   ├── migrations/
│   │   ├── 20260117000000_init.sql            # o script da seção A
│   │   ├── 20260118000000_foods.sql
│   │   ├── 20260119000000_workouts.sql
│   │   └── 20260120000000_marketplace.sql     # stores, products, orders, stripe_transactions
│   ├── functions/                    # Edge Functions (Deno)
│   │   └── stripe-split-payout/
│   │       └── index.ts
│   └── seed.sql                      # foods globais, lojas demo
│
├── tests/
│   ├── e2e/                          # Playwright
│   └── unit/                         # vitest p/ lib/domain
│
├── public/
├── middleware.ts                     # auth guard
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.example
├── .env.local                        # gitignored
└── package.json
```

### Princípios que essa estrutura respeita

| Princípio | Como aparece |
| --- | --- |
| **Server-only ≠ client-only** | Tudo que toca `service_role` ou segredos vive em `app/api/*` ou `lib/*` importado só de Server Components. `lib/supabase/admin.ts` nunca é importado de Client Components. |
| **Domínio isolado** | `lib/domain/**` é puro TypeScript, sem React, sem Supabase — testável com vitest e reutilizável no Expo. |
| **Route groups Next.js** | `(marketing)`, `(auth)` e `app/` separam chrome/layouts sem afetar URLs. |
| **Migrations versionadas** | `supabase/migrations/` é a fonte de verdade do schema — nada de "rodei direto no SQL Editor e esqueci". |
| **Webhooks isolados** | Stripe Connect, n8n e callbacks de provider têm pastas próprias em `app/api/*` — facilita rate-limit e observabilidade. |
| **Mobile-ready** | O dia que o Expo entrar, ele consome `lib/supabase/client.ts` + `lib/domain/**` + `stores/kore.ts` sem refazer nada. |

### Roteiro de migração do protótipo Vite → repo Kodex.fit

1. **Scaffold:** `pnpm create next-app@latest kodex.fit --ts --tailwind --eslint --app --src-dir=false`
2. **Supabase CLI:** `npx supabase init && npx supabase login && npx supabase link --project-ref <ref>`
3. Mover `supabase/migrations/20260117000000_init.sql` (script da seção A) → `npx supabase db push`.
4. Copiar do protótipo:
   - `src/store.ts` → `stores/kore.ts` (renomeia o `user` simulado pra default vazio + adiciona `setUser`/`setAuthenticated`).
   - `src/components/home/WaterBar.tsx`, `dieta/KcalHero.tsx`, `treino/CircularTimer.tsx` → `components/motion/`.
   - `src/components/BottomNav.tsx` → `components/nav/BottomNav.tsx` (troca o estado de tab por `usePathname()`/`<Link>`).
   - `src/components/LoginScreen.tsx` → `app/(auth)/login/page.tsx` + `_components/login-form.tsx` da seção B.
5. Plugar `<AuthBootstrap />` no `app/layout.tsx`.
6. Adicionar `middleware.ts` da seção B.5.
7. Próxima migration: `20260118000000_foods.sql` — espelha o `initialMeals` do Zustand.

---

## Próximos passos sugeridos

1. **Rodar a migration acima** num projeto Supabase de dev e testar signup por email + Google.
2. Subir o repo `kodex.fit` no GitHub com a estrutura da seção C — **posso scaffoldar tudo num PR pronto se você me liberar acesso ao repo**.
3. Migrar Home + Login pro Next.js usando os snippets reais (mantendo o visual do protótipo 1:1).
4. Próxima migration: marketplace (`stores`, `products`, `orders`, `stripe_transactions`) — a partir daí ligamos Stripe Connect de verdade.

> 💡 Quando você criar o projeto Supabase, me passe a URL + anon key (a service_role **não** mande por chat — coloque em variável de ambiente do repo). Posso aplicar a migration por você e validar o fluxo de signup ponta a ponta.
