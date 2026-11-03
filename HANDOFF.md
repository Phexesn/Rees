# Handoff — end of build session 1 (2026-11-03)

## TL;DR

RealtyBoost v0.1 runs end to end locally: sign up → 5-step setup → add a listing → generate MLS copy, social posts, a Reel plan, a listing email, a DIY photo guide and Follow-Up Coach scripts in up to 3 languages side by side → publish a lead-capture page → leads land in the CRM with follow-up tasks → move deals on the pipeline → closing checklist → CMA report. Five UI languages. Production build passes. **It has not been deployed and has not generated real AI content yet** (no AI key in the build environment).

## What shipped end to end (verified in a real browser)

| Area | Status | Verified how |
|---|---|---|
| Auth, sessions, 14-day Pro trial | ✅ | Playwright: signup/login |
| Multi-tenancy (RLS + scoped client) | ✅ | Script: tenants can't see each other; raw client sees 0 rows; spoofed tenantId overwritten |
| Setup wizard (5 screens) | ✅ | Playwright |
| Billing: Stripe Checkout/Portal/webhook | ⚠️ code complete, **not tested against Stripe** (no test keys here) | Dev billing mode tested (plan switch) |
| Listings | ✅ | Playwright |
| 6 content modules + multilingual toggle | ✅ with mock AI | Playwright + walkthrough script (12 outputs) |
| Fair Housing filter | ✅ | 64 unit tests (5 languages) |
| Results page: FH explanation, print, email-me, regenerate | ✅ (email needs Resend key) | Playwright |
| Listing pages + open-house kiosk + lead capture | ✅ | Playwright: lead → contact, deal, 4 tasks, activity |
| CRM: contacts, saved lists, log, notes, tasks | ✅ | Playwright + DB check |
| Pipeline drag/drop + Move-to menu | ✅ (menu tested; drag is native HTML5) | Playwright |
| Deal closing checklists | ✅ | Playwright + DB check (13 items) |
| CMA | ✅ | Playwright: 3 comps → $910k–$925k range + report |
| Buyer ↔ listing matching | ✅ | Playwright against demo data |
| Team page, admin dashboard, help, PWA manifest | ✅ | HTTP 200 + screenshots |
| Translations es / zh / vi / ko | ✅ 1,115 keys each, checker passes | `npm run check:locales`; screenshots in 4 languages |
| Landing page | ✅ | Screenshot review |
| Realtor Playbook vault (side product) | ✅ draft, 35 notes, 178 links, 0 broken | link checker |

## Half-done / needs attention

1. **Real AI output quality is unreviewed.** Add `ANTHROPIC_API_KEY`, run `npm run db:seed` then `npm run walkthrough`, read the files in `walkthrough-output/`, and iterate the weakest prompts in `/prompts` (bump `version` each time). This is the most important next step — "prompts are the real product".
2. **Stripe** — create test prices + webhook and run one real test-mode checkout (card 4242 4242 4242 4242).
3. **Email** — add `RESEND_API_KEY` + a verified sender domain for new-lead alerts and "Email it to me".
4. **Research verification** — the environment blocked many primary sources (nar.realtor, apple.com support, fcc.gov, hud.gov pages, MLS rulebooks, Instagram/TikTok help). Notes are tagged `partly-verified`; re-run checks once those hosts are allowed (cloud environment → Network access).
5. **Legal** — attorney review of `compliance/fair-housing.rules.yaml`, the lead-form consent wording (`publicPage.smsConsent` in every locale), the CMA disclaimer, and ToS/privacy (outlines in `compliance/`). Terms/Privacy pages don't exist yet.
6. **Native-speaker review** of translations (legal strings first).

## Not started (see BACKLOG.md)

Email/SMS sending, Gmail/Outlook sync, MLS import, e-signature, document uploads, showing scheduler, lead routing, commission tracking, analytics funnel, password reset, Tagalog/Portuguese/French UI translations, video rendering.

## Known issues & workarounds

- **Rate limiting** on public forms is in-memory (per server instance) — fine for launch volume, replace with Redis/Postgres-backed limiting before ads.
- **Email-to-self section order**: Postgres JSONB reorders object keys, so emailed text lists sections in a different order than the screen. Cosmetic (BACKLOG §11).
- **Prompt hot reload** works when running `next dev`/self-hosted; on Vercel, prompt files are bundled at build time (redeploy to change). DB-backed prompt store is in the backlog.
- **Listing photos** are pasted links (no uploads yet).
- **Times** on server-rendered pages use the server's time zone setting (`America/New_York` in `src/i18n/request.ts`); per-agent time zones are not stored yet.
- **Next.js dev overlay** shows "1 issue" during automated screenshots — a hydration warning caused by the screenshot tool hiding the text cursor, not by the app.

## What the next session should do first (in order)

1. Deploy: Neon + Vercel (see `architecture/README.md` → Deployment). Set `ANTHROPIC_API_KEY`, `ADMIN_EMAILS`.
2. Run the walkthrough with a real key; fix the 3 weakest prompts; re-run.
3. Wire Stripe test mode end to end.
4. Build: Terms/Privacy pages, password reset, sending email from the app (BACKLOG §0 and §3).
5. Start the validation gate in `research/go-no-go.md` (15 agent interviews, 5 pre-sales).

## Environment variables (names only — values live in Vercel / `.env`)

| Name | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection (non-superuser role) |
| `APP_URL` | yes | Public base URL (used in links and Stripe redirects) |
| `ANTHROPIC_API_KEY` | yes in prod (or another provider key) | Claude |
| `OPENAI_API_KEY` | optional | OpenAI provider |
| `GOOGLE_API_KEY` / `GEMINI_API_KEY` | optional | Google provider |
| `LLM_PROVIDER` | optional | Force one provider for all prompts (`anthropic`/`openai`/`google`/`mock`) |
| `LLM_MODEL_ANTHROPIC` / `LLM_MODEL_OPENAI` / `LLM_MODEL_GOOGLE` | optional | Model override when a provider is forced |
| `ADMIN_EMAILS` | recommended | Comma-separated emails that can open `/admin` |
| `STRIPE_SECRET_KEY` | for billing | Stripe API key (test: `sk_test_…`) |
| `STRIPE_WEBHOOK_SECRET` | for billing | Webhook signing secret |
| `STRIPE_PRICE_SOLO` / `STRIPE_PRICE_PRO` / `STRIPE_PRICE_TEAM` | for billing | Monthly price IDs |
| `RESEND_API_KEY` | for email | New-lead alerts, email-to-self |
| `EMAIL_FROM` | for email | Verified sender, e.g. `RealtyBoost <alerts@yourdomain.com>` |

## Useful commands

```bash
npm install && npm run db:migrate   # set up
npm run dev                         # http://localhost:3000
npm run db:seed                     # demo@realtyboost.app / demo-password-123
npm test                            # Fair Housing filter tests
npm run check:locales               # translation completeness
npm run walkthrough                 # AI quality review files (needs a key)
npm run build                       # production build
```
