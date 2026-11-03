# Changelog

## v0.1.0 — 2026-11-03 (first build session)

**Research (Phase 1).** Competitor landscape, audience pain points, platform briefs (MLS, Instagram, TikTok, Shorts, Facebook, LinkedIn, X, Zillow/Realtor.com, email deliverability, SMS), video-integration plan, CRM data model, CMA methodology, MLS/RESO integration path, DIY phone-photography reference, legal/compliance notes, positioning and a go/no-go memo (GO with a validation gate). Most sources were read as search summaries because the build environment blocked many primary sites — files are tagged accordingly.

**Slice 1 — Core infrastructure.** Next.js 15 + TypeScript + Tailwind, Prisma schema for the whole product, Postgres row-level security forced on every tenant table with an app-level tenant-scoping client, email/password auth with DB sessions, next-intl with five UI languages, multi-provider LLM client (Anthropic SDK, OpenAI, Google, offline mock) with cost tracking, hot-reloading prompt files with strict JSON schemas, auto-registered module system, structured logs and an audit table, tier feature flags.

**Slice 2 — Billing.** Stripe test-mode Checkout and Billing Portal, idempotent webhook that maps prices to plans, 14-day Pro trial, dev billing mode for local testing, locked-feature upgrade screens.

**Slice 3 — Setup wizard.** Five large, single-task screens: profile and license, app + content languages, brand voice (with example sentences per tone), phone model and areas served, summary.

**Slices 4–9 — Marketing suite.** Shared listing form (including which way the house faces), MLS description (3 angles × headline/short/long, MLS character limits), social posts (Instagram with 5 hashtags and alt text, Facebook, LinkedIn, X, story slides), Reel/TikTok plan (hook, timed storyboard, filming-day shot list, voiceover, CapCut steps, caption), listing email (3 subject lines, preview text, body, CTA), DIY photo & video guide (device-specific settings, lighting plan by orientation and season, room-by-room shot list, staging, composition, free-app editing values, walkthrough clips, troubleshooting), and the **Follow-Up Coach** (call script, objection answers, text, email, 14-day plan, coaching tips). Every module supports "also write it in…" side-by-side languages, print, email-to-self and regenerate.

**Slice 10 — Lead capture.** One-click public listing pages with agent card, license/brokerage attribution, Equal Housing notice and consent capture; an open-house sign-in kiosk; leads become contacts with a deal, a 4-step follow-up task plan and an email alert.

**Slices 11–13 — CRM.** Contacts with search, filters, tags and saved lists; contact cards with one-tap call/text/email, consent record, conversation log, notes, tasks and deals; drag-and-drop pipeline with an accessible "Move to" menu, stale/overdue badges; tasks page grouped by urgency; closing checklists with typical deadlines (Pro).

**Slice 14 — CMA.** Comps entry, deterministic adjustments (size, beds, baths, garage, pool, condition), adjusted range and suggested list range, weak-comp warnings, AI narrative, printable report with a not-an-appraisal disclaimer.

**Slice 15 — Fair Housing filter.** YAML rule set covering federal protected classes plus CA/NY/NJ/OR/WA additions and steering language, in English, Spanish, Chinese, Vietnamese and Korean (plus basics for Tagalog, Portuguese and French). 64 unit tests. The results page explains every rewrite, removal and flag in plain words.

**Slice 16 — Landing page.** Benefit-led page for experienced agents with the "No photographer? No problem." hook, how-it-works, features, Fair Housing / languages / ease trust blocks, pricing, FAQ and a "coming next" list.

**Also.** Team page (seats, add teammate, 30-day activity), platform admin dashboard (cost per account, top actions, failures), help center, installable web-app manifest and icons, demo seed script, quality walkthrough script, full translations (es, zh, vi, ko), and the **Realtor Playbook** Obsidian vault (side product).
