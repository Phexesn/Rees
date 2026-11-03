# RealtyBoost — Architecture

## Stack

| Layer | Choice | Why |
|---|---|---|
| App | **Next.js 15** (App Router, React 19, server actions) + TypeScript | One codebase for pages, APIs and server logic; deploys to Vercel with zero config |
| Styling | **Tailwind CSS v4** + a small in-house UI kit (`src/components/ui`) | Age-friendly sizes and contrast are enforced in one place (no shadcn CLI dependency) |
| Font | Atkinson Hyperlegible (Braille Institute) with CJK/Vietnamese system fallbacks | Designed for low-vision readers |
| Database | **PostgreSQL** (Neon or Supabase in production) via **Prisma 6** | Row-level security, JSON columns, mature migrations |
| Auth | Email + password (bcrypt), DB-backed sessions, httpOnly cookie | No third-party auth vendor to configure; easy to swap for Auth.js/Clerk later |
| i18n | **next-intl** (cookie-based locale, no locale in URLs) | `locales/<lang>.json`, English fallback for any missing key |
| AI | Provider abstraction over **Anthropic** (official SDK), **OpenAI**, **Google** (REST), plus an offline mock | One env var swaps providers |
| Billing | **Stripe** Checkout + Billing Portal + webhook | Test mode works out of the box; dev billing mode when Stripe isn't configured |
| Email | Resend REST API (optional) | New-lead alerts and "email it to me"; logged when not configured |
| Tests | Vitest — Fair Housing filter only (64 tests) | Per brief: only the legal-safety module is unit tested |

## Folder map

```
prisma/                 schema + migrations (incl. row-level security)
prompts/                AI prompt templates (*.prompt.md) + reference assets — editable by non-engineers
compliance/             Fair Housing rules (YAML) + legal research notes
locales/                UI translations (en, es, zh, vi, ko)
src/app/                routes
  (auth)/               signup, login
  (app)/                signed-in app (dashboard, listings, create, CRM, CMA, settings, team, admin, help)
  setup/                5-step onboarding wizard
  l/[slug]/             public listing pages + open-house kiosk
  api/stripe/webhook    Stripe → subscription sync
src/modules/<id>/       content modules (module.ts + View.tsx) — auto-registered
src/lib/                db, auth, features (plans), llm, prompts, generation pipeline, billing, leads, cma, email, audit
src/compliance/         Fair Housing filter engine + tests
scripts/                registry generator, locale checker, seed, walkthrough
research/ vault/        research notes; the Realtor Playbook Obsidian vault (side product)
```

## Multi-tenancy (defense in depth)

1. **Every tenant-owned table has `tenantId`** (see `prisma/schema.prisma`).
2. **App layer** — `tenantDb(tenantId)` (`src/lib/db.ts`) is a Prisma client extension that adds `tenantId` to every `where`, and overwrites `tenantId` on every create (a caller cannot write into another tenant).
3. **Database layer** — Postgres row-level security is **forced** on every tenant table (`prisma/migrations/*_row_level_security`). Each query runs in a transaction that sets `app.tenant_id`; without it, a query sees **zero rows**. Verified: a raw Prisma client with no setting reads 0 rows.
4. **`systemDb()`** sets `app.bypass_rls = on` and is used only where there is no tenant yet: login, signup, session lookup, Stripe webhook, public listing pages, platform admin. Each call site has a comment explaining why.
5. Conventions: use scalar foreign keys (`contactId`), not nested `connect`/`create`; pass `tenantId` on create.

The app's database role must **not** be a superuser or have `BYPASSRLS` (both skip RLS). Check with `select rolsuper, rolbypassrls from pg_roles where rolname = current_user;`. Some hosted defaults (e.g. Neon's owner role) may have `BYPASSRLS` — the app still works and app-level scoping still applies, but for production create a dedicated app role without it.

## Feature flags & tiers

`src/lib/features.ts` is the single source of truth:

```ts
FeatureFlag.CRM_ENABLED(tenant)      // → boolean, driven by plan + subscription status
assertFeature(tenant, "CMA")         // throws FeatureLockedError on the server
ctx.can("MICROSITES")                // used in pages/nav
```

Locked features render `<LockedFeature feature="…" />` (explains the benefit + upgrade button), never an error. New accounts get a 14-day Pro trial. Plan limits (listings/month, content languages, seats) live in `PLANS`.

## Content modules

A module is a folder `src/modules/<id>/` with:

- **`module.ts`** — default export of `defineModule({...})` (`src/modules/types.ts`):
  - `id`, `icon`, `feature` (tier gate), `order`, `requires` (`"property"` | `"property-optional"`), `usesContact?`, `hidden?`
  - `options`: declarative form fields (select / checkbox / text) rendered by a generic form — labels are i18n keys
  - `inputSchema`: zod schema for those options
  - `promptId`: which file in `/prompts` to use
  - `buildVariables(ctx, input)`: returns the plain-text variables the prompt sees (use helpers in `src/modules/_shared/variables.ts`)
- **`View.tsx`** — a client component that renders the module's JSON output (use helpers in `src/components/output.tsx`: `CopyBlock` with character limits, `OutputSection`, `Checklist`, `Tabs`).

`npm run gen:registry` (runs automatically before `dev` and `build`) scans the folders and writes `src/modules/_generated/{registry,views}.ts`.

### Adding a new content type (≈30 minutes)

1. Copy `src/modules/email-blast/` to `src/modules/<new-id>/` and rename the id.
2. Copy `prompts/email-blast.prompt.md` to `prompts/<new-id>.prompt.md`; write the system/user text and the `output_schema`.
3. Adjust `options` + `inputSchema` + `buildVariables` in `module.ts`.
4. Render the output in `View.tsx`.
5. Add `modules.<new-id>.name`, `.description` and any option labels to `locales/en.json`; run `npm run check:locales` (other languages fall back to English until translated).
6. `npm run dev` → it appears in **Create content** and on every listing page. Every output automatically goes through schema validation, the Fair Housing filter, cost logging and the multi-language toggle.

## Prompt files

```markdown
---
id: mls-listing                       # must match the file name
version: 1                            # bump when you change the prompt (stored on every generation)
description: …
model: anthropic:claude-opus-5-5      # provider:model — default for this prompt
temperature: 0.7                      # used by providers that accept it (current Claude models don't)
effort: medium                        # Anthropic reasoning effort: low | medium | high
max_tokens: 8000
language_param: language              # variable that receives the output language instruction
inputs: [property_facts, agent, brand_voice, …]   # documentation of expected variables
output_schema: { JSON Schema }        # every object becomes strict (all props required, no extras)
---
# System
… {{compliance_rules}} … {{language}} …
# User
… {{property_facts}} … {{#if emphasis}}…{{/if}}
```

- `{{name}}` inserts a variable; `{{#if name}}…{{/if}}` keeps a block only when the variable is non-empty.
- `{{compliance_rules}}` is injected by the pipeline (Fair Housing + honesty rules) — keep it in every customer-facing prompt.
- **Hot reload:** `FilePromptStore` re-reads a file when its modification time changes. On Vercel the files are bundled (see `outputFileTracingIncludes` in `next.config.ts`), so prompt changes need a deploy there; a DB-backed store can implement the same `PromptStore` interface (`src/lib/prompts/store.ts`) for no-deploy edits.

## Generation pipeline (`src/lib/generation/run.ts`)

1. Feature check (`assertFeature`) and option validation (zod).
2. Language check against the tenant's allowed content languages (plan-limited).
3. For each requested language **in parallel**: build variables → render prompt → resolve provider/model → call LLM with JSON schema → parse + validate (one retry on bad output).
4. **Fair Housing filter** (`src/compliance/fair-housing`) walks every string: safe rewrites applied, block-level phrases trigger **one regeneration** with explicit feedback, then any remaining violating sentence is removed; risky phrases are flagged for the agent.
5. Save a `Generation` row (output, compliance report, model, tokens, cost, latency, prompt version) + an `AuditLog` row.

## LLM abstraction (`src/lib/llm`)

- `LLMProvider.generate({ model, system, prompt, maxTokens, temperature?, effort?, schema })`.
- **Anthropic**: official SDK, streaming + `finalMessage()`, `output_config.format` JSON schema, adaptive thinking with `effort`, automatic prompt caching, server-side refusal fallback (`fallbacks: "default"`), typed error handling.
- **OpenAI** / **Google**: REST with JSON-schema output.
- **Mock**: schema-valid sample output; used automatically in development when no key is set; never in production.
- **Swap providers**: `LLM_PROVIDER=openai` (+ optional `LLM_MODEL_OPENAI=…`) routes every prompt to that provider. Per prompt: change `model:` in the prompt file.
- **Cost**: `src/lib/llm/pricing.ts` (per-million-token rates; OpenAI/Google rates need verifying).

## Data model (core)

`Tenant` (plan, subscription, white-label) → `User` (role) → `AgentProfile` (brand voice, languages, phone) ·
`Property` (listing facts) → `Generation`, `Microsite`, `Cma` ·
`Contact` (roles, source, buyer preferences, consent record) → `Deal` (stage, side, value) → `ChecklistItem`, `Task`, `Note`, `Activity` ·
`SavedView` · `AuditLog` · `StripeEvent` (webhook idempotency) · `Session`.

## Observability

- Structured JSON logs to stdout (`src/lib/log.ts`) → Vercel Logs; drain to Axiom/Logtail without code changes.
- `AuditLog` row for every AI generation (model, tokens, cost, latency) and every CRM/listing/billing mutation.
- `/admin` (emails in `ADMIN_EMAILS`): accounts by plan, generations, AI cost per account, average cost and latency, most-used actions, recent failures.

## Deployment (Vercel + Neon)

1. Create a Neon (or Supabase) Postgres database; copy the connection string.
2. Import the GitHub repo in Vercel. Set env vars (names in `.env.example`): `DATABASE_URL`, `APP_URL`, `ANTHROPIC_API_KEY`, `ADMIN_EMAILS`, and optionally Stripe/Resend keys.
3. Build command: default (`npm run build` — generates the module registry and Prisma client).
4. Migrations run automatically on Vercel: the `vercel-build` script runs `prisma migrate deploy` before building.
5. Stripe: create three monthly prices (Solo/Pro/Team) in test mode → `STRIPE_PRICE_SOLO/PRO/TEAM`; add a webhook endpoint `https://<domain>/api/stripe/webhook` for `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed` → `STRIPE_WEBHOOK_SECRET`.
6. **Rollback**: Vercel → Deployments → "Promote" a previous deployment (instant). Migrations are additive; never drop columns in the same release that stops using them.
