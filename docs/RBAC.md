# RBAC — KORE

Visão rápida do modelo de autorização. Para detalhes do schema e SQL, veja
[`docs/BACKEND.md`](BACKEND.md).

## Roles

Definidas como enum `public.user_role`:

| Role       | Descrição                                                           |
| ---------- | ------------------------------------------------------------------- |
| `client`   | Usuário final (B2C). Acessa `/app/**` (Home, Dieta, Treino, Shop). |
| `nutri`    | Nutricionista. Acessa `/nutri/**`.                                  |
| `personal` | Personal Trainer. Acessa `/personal/**`.                            |
| `shop`     | Lojista. Acessa `/shop-admin/**`.                                   |
| `admin`    | KORE. Acessa todos os dashboards.                                   |

## Onde a regra vive

1. **Middleware** ([`lib/supabase/middleware.ts`](../lib/supabase/middleware.ts))
   - Redireciona não-autenticados pra `/login?next=...`.
   - Lê `role` do `user_profiles` e bloqueia rotas cruzadas.

2. **RLS no PostgreSQL**
   - Policy padrão: dono lê/escreve apenas seu profile/targets.
   - Tabelas B2B (a vir: `coach_clients`, `meal_plans`, etc.) terão
     policies do tipo `coach_id = auth.uid()`.

3. **Server Components**
   - Cada `app/(dashboard)/<role>/layout.tsx` revalida a sessão e o
     `role` antes de renderizar. Defesa em profundidade.

## Fluxo de mudança de role

`role` **não pode** ser alterada via `update` do próprio usuário (a policy
`profile: update own` cobre o caso comum, mas qualquer mudança de `role`
precisa passar por uma função `set_user_role(user_id, role)` com
`security definer` chamada apenas por:

- Admin via UI interna `/admin`.
- Webhook do Stripe Connect quando a conta é aprovada (vira `shop` ou
  `personal/nutri`).

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
update public.user_profiles
  set role = 'personal'
  where id = '<uuid-do-usuario>';

# 5. Logue na app e navegue até /personal — deve abrir.
#    Tente /nutri — middleware redireciona para /app.
```
