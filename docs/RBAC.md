# RBAC — KORE

Visão rápida do modelo de autorização. Para detalhes do schema e SQL, veja
[`docs/BACKEND.md`](BACKEND.md).

## Roles

Definidas como enum `public.user_role`:

| Role           | Rota canônica         | Descrição                                              |
| -------------- | --------------------- | ------------------------------------------------------ |
| `admin`        | `/dashboard/admin`    | KORE. Acesso irrestrito a todos os painéis.            |
| `nutritionist` | `/dashboard/nutri`    | Nutricionista. CRM, cardápios, compliance de macros.   |
| `trainer`      | `/dashboard/personal` | Personal Trainer. Periodização, biblioteca, progresso. |
| `merchant`     | `/dashboard/shop`     | Lojista local. Catálogo, estoque, Kanban de pedidos.   |
| `client`       | `/app`                | Usuário final (B2C). Home, Dieta, Treino, Shop.        |

`client` é o **default** — toda conta criada via signup nasce como cliente.
`admin` **nunca** vem do signup; é promoção manual (ver "Mudança de role").

## Onde a regra vive

1. **`lib/auth/rbac.ts`** — fonte única de verdade do mapeamento
   `role → rota` e da função `isAllowedRoute(role, pathname)`. Reusada
   por todos os pontos abaixo.

2. **Middleware** ([`lib/supabase/middleware.ts`](../lib/supabase/middleware.ts))
   - Não-autenticado em `/app/**` ou `/dashboard/**` → redireciona pra
     `/login?next=<path>`.
   - Autenticado em `/login` ou `/sign-up` → redireciona pra
     `homePathForRole(role)` (pós-login automático).
   - Autenticado em rota de outra role → redireciona pra sua Home.
   - Lê `role` de `public.profiles.role` (RLS filtra por dono).

3. **Server Action `signInWithPasswordAction`**
   ([`lib/auth/actions.ts`](../lib/auth/actions.ts)) — após login com
   sucesso, lê role e chama `redirect(homePathForRole(role))`. O
   middleware já cobre acesso direto, isso só evita 1 round-trip.

4. **RLS no PostgreSQL** — defesa em profundidade
   - Policy padrão: dono lê/escreve apenas seu profile/targets.
   - Tabelas B2B (a vir: `coach_clients`, `meal_plans`, etc.) terão
     policies do tipo `coach_id = auth.uid()`.

## Trigger `handle_new_user`

Toda inserção em `auth.users` (signup email **e** OAuth) dispara
`public.handle_new_user()`, que:

1. Lê `full_name` / `avatar_url` de `raw_user_meta_data`.
2. Lê `role` de `raw_user_meta_data->>'role'` (`nutritionist`, `trainer`,
   `merchant` ou `client`). Se ausente ou inválido, cai em `client`.
3. Insere linha em `public.profiles` (com a role escolhida) e em
   `public.user_daily_targets` (metas default). `SECURITY DEFINER` p/
   atravessar RLS no momento do signup.

Pra o cliente passar role no signup via Supabase JS:

```ts
await supabase.auth.signUp({
  email,
  password,
  options: { data: { full_name, role: "trainer" } },
});
```

A Server Action `signUpWithPasswordAction` já faz isso a partir de
`formData.get("role")`.

## Mudança de role

`role` **não é** alterável via UPDATE do próprio usuário (a policy
`profile: update own` permite UPDATE da linha, mas a coluna `role` deve
ser tratada via função dedicada para evitar escalada). Qualquer mudança
de `role` passa por uma função `set_user_role(user_id, role)` com
`security definer` chamada apenas por:

- Admin via UI interna `/dashboard/admin` (Super Admin Dashboard).
- Webhook do Stripe Connect quando a conta do profissional é aprovada
  (vira `nutritionist`, `trainer` ou `merchant`).

Implementação dessa função fica em uma migration futura.

## Testar localmente

```bash
# 1. Suba Supabase local
pnpm supabase:start

# 2. Aplique a migration
pnpm supabase:migrate

# 3. Crie um usuário em http://localhost:54323/project/default/auth/users
#    (deixe email + senha simples). O trigger handle_new_user cria o profile.

# 4. Mude o role manualmente via SQL Editor:
update public.profiles
  set role = 'trainer'
  where id = '<uuid-do-usuario>';

# 5. Logue na app — middleware redireciona pra /dashboard/personal.
#    Tente /dashboard/nutri — middleware redireciona pra /dashboard/personal.
#    Tente /app — middleware redireciona pra /dashboard/personal.
```
