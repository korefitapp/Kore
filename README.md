# KORE — Super App (Saúde · Fitness · Nutrição)

Monorepo do ecossistema KORE.

- **Web app B2C/B2B2C** — Next.js 14 (App Router) + Supabase + Stripe Connect + n8n
- **Mobile app** — Expo / React Native (a vir, compartilhando `lib/domain`)
- **Dashboards B2B** — Nutricionista, Personal Trainer e Lojista (route groups)

> Identidade visual: Light Mode clínico (Ice/Off-white) com acentos em Verde Esmeralda. Dark mode disponível como toggle.

## Stack

| Camada       | Tecnologia                                |
| ------------ | ----------------------------------------- |
| Frontend Web | Next.js 14 (App Router) + React 18 + TS   |
| Estilo       | Tailwind CSS + Framer Motion + Lucide     |
| Estado       | Zustand (cliente) · React Query (server)  |
| Backend      | Supabase (PostgreSQL + Auth + Storage)    |
| Pagamentos   | Stripe Connect (split de pagamentos)      |
| Automação    | n8n via webhooks (jornadas WhatsApp)      |
| Analytics    | Sentry Performance + PostHog (a definir)  |

## Como rodar

```bash
pnpm install
cp .env.example .env.local      # preencha SUPABASE_URL / ANON / SERVICE_ROLE / STRIPE_*
pnpm supabase:start             # roda Supabase local em Docker
pnpm supabase:migrate           # aplica migrações em supabase/migrations
pnpm dev                        # abre http://localhost:3000
```

## Estrutura

Veja a documentação completa em [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) e [`docs/BACKEND.md`](docs/BACKEND.md). Visão rápida:

```
app/
  (marketing)/        landing pública
  (auth)/             login / signup / recover
  app/                área autenticada (cliente final)
  (dashboard)/        painéis B2B: /dashboard/admin, /dashboard/nutri,
                      /dashboard/personal, /dashboard/shop (RBAC via middleware)
  api/                webhooks: /stripe, /n8n + endpoints internos
  auth/callback/      OAuth PKCE exchange
lib/
  supabase/           clients (browser, server, admin)
  domain/             regras de negócio puras (testáveis e reaproveitáveis pelo Expo)
  stripe/             helpers de Stripe Connect
  auth/               server actions de autenticação
supabase/
  migrations/         SQL versionado
  seed.sql            dados de exemplo para dev
```

## Scripts

| Comando                | O que faz                                |
| ---------------------- | ---------------------------------------- |
| `pnpm dev`             | Next.js dev server                       |
| `pnpm build`           | Build de produção                        |
| `pnpm start`           | Servidor de produção                     |
| `pnpm lint`            | ESLint                                   |
| `pnpm typecheck`       | TypeScript no modo `--noEmit`            |
| `pnpm supabase:start`  | Sobe Supabase local                      |
| `pnpm supabase:migrate`| Aplica migrações                          |
| `pnpm supabase:types`  | Gera tipos TypeScript a partir do schema |

## Padrões

- **Server-first**: tudo que pode ser Server Component, é. Client Components só onde há interação ou `framer-motion`.
- **RLS sempre**: nenhuma tabela pública sem `enable row level security`. Service role só em rotas internas.
- **Tipos gerados**: `supabase gen types typescript` alimenta `lib/supabase/database.types.ts`. Não editar à mão.
- **Convenção de commits**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`. PRs squash com mensagem padronizada.

## Licença

Proprietária — uso interno KORE. Veja [`LICENSE`](LICENSE).
