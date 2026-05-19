# KORE Super App — Planejamento Técnico & Arquitetura

> Documento de arquitetura para o MVP do **KORE** — Super App SaaS B2B2C de
> Saúde, Fitness & Nutrição (Cliente final · Personal Trainer · Nutricionista ·
> Lojista local).

Stack alvo:

- **Mobile**: React Native + Expo (EAS Build, Expo Router)
- **Web (Dashboard B2B)**: Next.js 14 (App Router) + React Server Components
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Edge Functions) +
  serviços auxiliares em Node/TS (Fastify/Nest)
- **Pagamentos**: Stripe Connect (Express accounts) com split + transfers
- **Automação**: n8n (self-hosted) → WhatsApp Business Cloud API
- **Observabilidade**: Sentry (RN/Web) + Logflare/OpenTelemetry

---

## 1. JSON Schema — `GET /user/dashboard`

Endpoint único que hidrata a Home (estratégia "BFF agregador"). Retorna apenas
o necessário para renderizar a primeira tela em < 800 ms (P95) e usa cache de
60 s em edge + ETag/stale-while-revalidate por usuário.

```jsonc
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://api.kore.app/schemas/user-dashboard.json",
  "type": "object",
  "required": ["user", "streak", "week", "training", "nutrition", "hydration"],
  "additionalProperties": false,
  "properties": {
    "user": {
      "type": "object",
      "required": ["id", "name", "avatarUrl", "tz"],
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "name": { "type": "string" },
        "avatarUrl": { "type": "string", "format": "uri" },
        "tz": { "type": "string", "example": "America/Sao_Paulo" },
        "plan": { "type": "string", "enum": ["free", "premium", "coach_managed"] }
      }
    },

    "streak": {
      "type": "object",
      "required": ["current", "longest", "lastCheckIn"],
      "properties": {
        "current": { "type": "integer", "minimum": 0 },
        "longest": { "type": "integer", "minimum": 0 },
        "lastCheckIn": { "type": "string", "format": "date-time" },
        "atRisk": { "type": "boolean", "description": "Sinaliza para o n8n disparar WhatsApp de retenção" }
      }
    },

    "week": {
      "type": "array",
      "minItems": 7,
      "maxItems": 7,
      "items": {
        "type": "object",
        "required": ["date", "done", "isToday"],
        "properties": {
          "date": { "type": "string", "format": "date" },
          "done": { "type": "boolean" },
          "isToday": { "type": "boolean" },
          "completion": {
            "type": "object",
            "properties": {
              "training": { "type": "boolean" },
              "nutrition": { "type": "boolean" },
              "hydration": { "type": "boolean" }
            }
          }
        }
      }
    },

    "training": {
      "type": "object",
      "required": ["sessionId", "name", "exercisesCount", "estimatedMin", "estimatedKcal", "status"],
      "properties": {
        "sessionId": { "type": "string", "format": "uuid" },
        "name": { "type": "string", "example": "Push A · Peito · Tríceps" },
        "exercisesCount": { "type": "integer" },
        "estimatedMin": { "type": "integer" },
        "estimatedKcal": { "type": "integer" },
        "status": { "type": "string", "enum": ["pending", "in_progress", "done", "skipped"] },
        "coach": {
          "type": "object",
          "properties": {
            "id": { "type": "string", "format": "uuid" },
            "name": { "type": "string" },
            "avatarUrl": { "type": "string", "format": "uri" }
          }
        }
      }
    },

    "nutrition": {
      "type": "object",
      "required": ["kcalGoal", "kcalConsumed", "macros", "macrosGoal", "nextMeal"],
      "properties": {
        "kcalGoal": { "type": "integer" },
        "kcalConsumed": { "type": "number" },
        "macros": { "$ref": "#/$defs/macros" },
        "macrosGoal": { "$ref": "#/$defs/macros" },
        "burnedKcal": {
          "type": "number",
          "description": "Sinergia de dados: usado para ajustar kcalGoal dinamicamente"
        },
        "nextMeal": {
          "type": "object",
          "properties": {
            "id": { "type": "string", "format": "uuid" },
            "name": { "type": "string" },
            "scheduledAt": { "type": "string", "format": "date-time" }
          }
        }
      }
    },

    "hydration": {
      "type": "object",
      "required": ["goalMl", "consumedMl", "lastIntakeAt"],
      "properties": {
        "goalMl": { "type": "integer", "minimum": 0 },
        "consumedMl": { "type": "integer", "minimum": 0 },
        "lastIntakeAt": { "type": "string", "format": "date-time" }
      }
    },

    "promos": {
      "type": "array",
      "description": "Push de marketplace (Shop) personalizado",
      "items": {
        "type": "object",
        "properties": {
          "storeId": { "type": "string", "format": "uuid" },
          "productId": { "type": "string", "format": "uuid" },
          "title": { "type": "string" },
          "badge": { "type": "string", "example": "-15%" }
        }
      }
    },

    "syncedAt": { "type": "string", "format": "date-time" }
  },

  "$defs": {
    "macros": {
      "type": "object",
      "required": ["proteinG", "carbsG", "fatG"],
      "properties": {
        "proteinG": { "type": "number" },
        "carbsG": { "type": "number" },
        "fatG": { "type": "number" }
      }
    }
  }
}
```

### Exemplo de resposta

```json
{
  "user": { "id": "u_01", "name": "Ana Souza", "avatarUrl": "...", "tz": "America/Sao_Paulo", "plan": "premium" },
  "streak": { "current": 12, "longest": 24, "lastCheckIn": "2026-05-16T22:10:00Z", "atRisk": false },
  "week": [ /* 7 entradas */ ],
  "training": { "sessionId": "...", "name": "Push A · Peito · Tríceps", "exercisesCount": 4, "estimatedMin": 52, "estimatedKcal": 480, "status": "pending" },
  "nutrition": {
    "kcalGoal": 2400, "kcalConsumed": 645,
    "macros": { "proteinG": 80, "carbsG": 110, "fatG": 35 },
    "macrosGoal": { "proteinG": 180, "carbsG": 280, "fatG": 70 },
    "burnedKcal": 0,
    "nextMeal": { "id": "m2", "name": "Lanche da Manhã", "scheduledAt": "2026-05-17T13:30:00Z" }
  },
  "hydration": { "goalMl": 3000, "consumedMl": 1200, "lastIntakeAt": "2026-05-17T03:50:00Z" },
  "promos": [],
  "syncedAt": "2026-05-17T04:30:00Z"
}
```

---

## 2. Modelo Relacional (MVP)

> Foco: **Users**, **Food Database** (global + per-user logs) e **Stripe
> Transactions** (split entre KORE, lojista e profissional).

```
┌──────────────────────────┐
│ profiles                 │  (Supabase Auth — auth.users 1:1)
│ id (uuid, PK)            │◄──────────────────────┐
│ role  ⟶ enum             │   client | trainer    │
│        nutritionist |    │   merchant | admin    │
│ display_name             │                       │
│ avatar_url               │                       │
│ tz, locale               │                       │
│ stripe_customer_id       │                       │
│ stripe_account_id        │  (Connect Express)    │
└──────────────────────────┘                       │
        │ 1                                        │
        │                                          │
        │ * coach_clients (M:N)                    │
        ▼                                          │
┌──────────────────────────┐    ┌──────────────────┴───────┐
│ coach_clients            │    │ user_dailies              │
│ coach_id  (FK profiles)  │    │ id (uuid PK)              │
│ client_id (FK profiles)  │    │ user_id (FK profiles)     │
│ status                   │    │ date (date)               │
│ started_at               │    │ water_ml                  │
└──────────────────────────┘    │ streak_count              │
                                │ kcal_consumed             │
                                │ kcal_burned               │  ◄── alimenta sinergia
                                │ protein_g, carbs_g, fat_g │
                                └───────────────────────────┘

┌──────────────────────────┐    ┌───────────────────────────┐
│ foods (catalog global)   │    │ meal_logs                  │
│ id (uuid PK)             │    │ id (uuid PK)               │
│ name (text)              │◄──┐│ user_id (FK profiles)      │
│ brand                    │   ││ date, meal_type (enum)     │
│ source ⟶ "TACO"|"USDA"   │   ││ consumed (bool)            │
│ kcal_100g                │   │└────────────────────────────┘
│ protein_100g             │   │           │ 1
│ carbs_100g               │   │           ▼ *
│ fat_100g                 │   │┌───────────────────────────┐
│ verified (bool)          │   ││ meal_items                │
│ created_by (FK profiles) │   ││ id, meal_log_id (FK)      │
│ embedding (vector)       │   ││ food_id (FK foods)        │──┘
└──────────────────────────┘   ││ grams (numeric)           │
                               ││ kcal_cached, p,c,f cached │
                               │└───────────────────────────┘
                               │
                               │ workout_logs (espelho de meal_logs p/ treino)
                               │
                               └─◄ workouts → workout_exercises → exercise_sets

┌──────────────────────────┐    ┌───────────────────────────┐
│ stores                   │ 1  │ products                  │
│ id (uuid PK)             │───*│ id (uuid PK)              │
│ owner_id (FK profiles)   │    │ store_id (FK)             │
│ stripe_account_id        │    │ name, image, brand        │
│ name, logo, rating       │    │ price_cents               │
│ category (enum)          │    │ old_price_cents           │
│ geo  (lat, lng)          │    │ promo_badge, stock        │
│ delivery_fee_cents       │    └───────────────────────────┘
└──────────────────────────┘            │ *
        │ *                              │
        │ orders                         ▼ 1
        ▼ 1                       ┌─────────────────────┐
┌──────────────────────────┐      │ order_items         │
│ orders                   │ 1  * │ order_id (FK)       │
│ id (uuid PK)             │─────│ product_id (FK)     │
│ user_id (FK profiles)    │      │ qty                 │
│ store_id (FK)            │      │ unit_price_cents    │
│ address_text             │      └─────────────────────┘
│ subtotal_cents           │
│ delivery_fee_cents       │
│ status (enum)            │
│ stripe_payment_intent_id │ ◄─── ligação fundamental com Stripe
└──────────────────────────┘
        │ 1
        ▼ *
┌──────────────────────────────────────────────────────────────┐
│ stripe_transactions  (espelho idempotente dos webhooks)       │
│ id (uuid PK)                                                  │
│ order_id (FK orders, nullable — pode ser pagamento de plano)  │
│ user_id  (FK profiles)                                        │
│ payment_intent_id (text, unique)                              │
│ stripe_charge_id (text)                                       │
│ amount_cents (int)                                            │
│ application_fee_cents (int)   ◄── comissão KORE               │
│ destination_account_id (text) ◄── ID Stripe do lojista/coach  │
│ destination_amount_cents (int) ◄── repasse                    │
│ currency (text)                                               │
│ status (enum: requires_action|succeeded|refunded|failed)      │
│ raw_event (jsonb)             ◄── auditoria                   │
│ created_at, updated_at                                        │
└──────────────────────────────────────────────────────────────┘
```

### Decisões-chave

| Tema | Decisão | Por quê |
|------|---------|---------|
| Banco de alimentos | Tabela global `foods` com `verified` + `created_by` | Permite curadoria + entries de usuário sem inflar a tabela; combina TACO (BR) e USDA |
| Macros em `meal_items` | Cached (`kcal_cached`, `p/c/f_cached`) | Evita recalcular ao mudar a base TACO; histórico do que foi logado fica imutável |
| Stripe | Tabela `stripe_transactions` como espelho dos webhooks | Idempotência via `payment_intent_id` UNIQUE; reconciliação fácil; relatórios B2B sem chamar Stripe API |
| Split | `application_fee_cents` armazenado | Auditável; comissão variável por tipo de venda (marketplace x assinatura) |
| Geolocalização | `geo` em `stores` + PostGIS index | Permite `ST_DWithin` para listar lojas próximas em < 50 ms |
| RLS | Supabase Row-Level Security ligado | Cliente só vê seu próprio `meal_logs`, coach vê de seus `coach_clients` |
| Embeddings | `foods.embedding vector(768)` | Search semântica ("frango grelhado" → match TACO) usando `pgvector` |

### Webhooks Stripe → n8n

`payment_intent.succeeded`, `charge.refunded`, `account.updated` chegam em uma
**Edge Function Supabase** que:

1. Persiste em `stripe_transactions` (UPSERT por `payment_intent_id`).
2. Atualiza `orders.status`.
3. Publica evento no n8n via webhook → orquestra WhatsApp ("Pedido confirmado",
   "Recupere sua streak", "Onboarding lojista").

---

## 3. Estratégia de Renderização — 60 fps em qualquer cenário

Três cargas pesadas convivem no app: **vídeo de exercício**, **listas longas
do marketplace** e **motion física nas barras**. Mantemos 60 fps com 6 pilares.

### 3.1 Animações na UI thread (não na JS thread)

- **React Native**: usar **Reanimated 3** (`useSharedValue`, `withSpring`) —
  todas as transições rodam no UI thread via worklets, isentas do JS bridge.
  Para os mesmos efeitos na web (Next.js + admin), usar **Framer Motion** com
  `useSpring`/`useMotionValue` (CSS transforms aceleradas por GPU).
- **Regra**: animar **apenas** `transform` e `opacity`. Nunca `width`/`height`
  diretamente — substituir por `scaleY` + `transform-origin: bottom` (mostrado
  no protótipo).
- Wave SVG da barra de água: animado com `transform: translateX` em loop
  curto (2.2 s), evitando reflow.

### 3.2 Listas virtualizadas

- **Marketplace**: `@shopify/flash-list` no RN (RecyclerView nativo),
  `react-window`/`@tanstack/virtual` no web.
- Carrosséis horizontais de produtos: `FlatList horizontal` + `getItemLayout`
  fixo (cards têm largura constante `150 px`) → permite `initialNumToRender:
  3`, `windowSize: 5`.

### 3.3 Imagens & vídeos otimizados

- **Imagens**: `expo-image` (cache memory+disk, fade-in opcional, decodifica
  off-thread); CDN serve AVIF/WebP responsivo via `?w=320&format=auto`.
- **Vídeos de exercício**:
  - HLS adaptativo (Mux/Cloudflare Stream) com **preload de poster** e bitrate
    automático.
  - Player `expo-video` (iOS/Android) + `<video>` HTML5 com `preload="metadata"`
    no web.
  - Carregar **apenas o vídeo do exercício ativo** — os demais ficam com
    thumbnail estática.

### 3.4 Estado isolado por feature

- Zustand com seletores por slice → cada componente assina **só** o que
  consome (ex.: `WaterBar` só re-renderiza quando `waterMl` muda; mudar de aba
  não derruba FPS porque ações no Shop não tocam o slice de hidratação).
- Memoização de cálculos pesados (totais, totais por refeição) com
  `selectConsumedKcal` no nível do store, não no componente.

### 3.5 Splitting & lazy load

- Dynamic `import()` por aba (`HomeTab`, `DietaTab`, `TreinoTab`, `ShopTab`).
- Active Mode do treino só carrega quando o usuário toca "Iniciar Treino".
- Animação Framer Motion importada via `LazyMotion` + `domAnimation` no web
  para reduzir ~25 KB do bundle inicial.

### 3.6 Telemetria de performance

- **Sentry Performance**: `INP`, `LCP`, `CLS` no web; **frame drops** + `JS FPS`
  no RN via `PerformanceObserver`.
- Budget: tela inicial **< 200 KB JS gzip**, TTI **< 2.5 s** em rede 4G.
- Lighthouse CI no PR do dashboard web (threshold ≥ 90 perf).

### 3.7 Sinergia de dados (treino ↔ nutrição)

- Quando termina um exercício, **Edge Function** recebe `workout_logs` +
  `MET × kg × min` → atualiza `user_dailies.kcal_burned`.
- Front-end consome via Supabase Realtime → barras de macros recalculam o
  alvo (`kcalGoal + kcal_burned`) com a mesma física de mola, sem refetch.

---

## 4. Mapa de eventos n8n (retenção)

| Trigger | Origem | Ação WhatsApp |
|---------|--------|---------------|
| `streak.at_risk` (job diário 21h) | Supabase cron → webhook | "Falta só 1 treino p/ manter sua ofensiva 🔥{n}" |
| `meal.skipped × 2` (dia) | Edge fn | "Bora bater a meta? Restam {kcal} kcal" |
| `coach.onboarded` | Stripe `account.updated` | Sequência de 5 mensagens em 7 dias |
| `order.delivered` | Webhook lojista | "Avalie sua compra (1 tap)" |

---

## 5. Estrutura do protótipo (este artefato)

```
kore_app/
  src/
    App.tsx               → AppShell
    store.ts              → Zustand store (todo o estado global)
    types.ts
    components/
      AppShell.tsx        → Top bar + tab content + BottomNav + CartDrawer
      BottomNav.tsx       → Tabs com layoutId animado (Framer Motion)
      home/
        HomeTab.tsx
        StreakCalendar.tsx   → Carrossel de dias + chama de streak pulsando
        TrainingCard.tsx
        MacrosCard.tsx       → Barras com spring
        WaterBar.tsx         → Vertical liquid bar + glow + micro-confetti
      dieta/
        DietaTab.tsx
        KcalHero.tsx         → Liquid wave horizontal
        MealAccordion.tsx    → Checkbox circular gigante (40 px + spring)
      treino/
        TreinoTab.tsx
        ActiveMode.tsx       → Player simulado + log carga/reps
        CircularTimer.tsx    → SVG stroke-dashoffset com RAF (60 fps)
      shop/
        ShopTab.tsx          → Address clicável, filtros, lojas, carrosséis
        AddressModal.tsx     → Bottom sheet com sugestões
        CartDrawer.tsx       → Drawer lateral, totais, botão Stripe
```

**Persistência entre abas**: tudo (água, refeições marcadas, séries logadas,
carrinho, endereço, tema) vive em **um único `useKore`** Zustand store, então
trocar de aba **não desmonta o estado**. O `AppShell` apenas troca a árvore de
componentes via `AnimatePresence mode="wait"`.

Para uma versão produção, adicionar `zustand/middleware → persist` com
`localStorage` (web) ou `expo-secure-store` (mobile) reativa esse mesmo store
em sessões futuras sem código adicional.
