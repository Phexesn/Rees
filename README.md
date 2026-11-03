# RealtyBoost

**Listing marketing, phone-photo guides, lead pages, follow-up coaching and a simple CRM for real estate agents — in English, Spanish, Chinese, Vietnamese and Korean.**

Built for agents who'd rather sell homes than fight software: big text, clear buttons, one task per screen, Fair Housing checks on everything the AI writes.

## What it does

- ✍️ **MLS descriptions, social posts, Reel/TikTok plans, listing emails** — written from the listing's real facts, in the agent's voice, sized for each platform.
- 📷 **DIY phone photo & video guide** — settings for the agent's exact phone, best light based on which way the house faces, shot list, staging and free-app editing.
- 🧭 **Follow-Up Coach** — what to say to a lead: call script, honest answers to objections, a text, an email and a 2-week plan.
- 🌐 **Listing pages** that capture leads (with consent records) and an open-house sign-in kiosk.
- 👥 **CRM** — contacts, saved lists, conversation log, tasks, drag-and-drop pipeline, closing checklists, buyer ↔ listing matching.
- 📊 **CMA assistant** — transparent comp adjustments, price range, client-ready explanation, printable report (not an appraisal).
- 🛡️ **Fair Housing filter** — rewrites, removes or flags risky wording in 5+ languages and explains why.
- 💳 Solo $29 · Pro $79 · Team $199 (Stripe), 14-day Pro trial.

## Quick start

Requirements: Node 22+, PostgreSQL 16 (local or Neon/Supabase).

```bash
cp .env.example .env          # set DATABASE_URL at minimum
npm install
npm run db:migrate
npm run db:seed               # optional demo account
npm run dev                   # http://localhost:3000
```

Without an AI key the app runs in **demo mode** (sample text). Add `ANTHROPIC_API_KEY` to write real content.

## Docs

- [`architecture/README.md`](architecture/README.md) — stack, multi-tenancy, modules, prompts, deployment
- [`HANDOFF.md`](HANDOFF.md) — what's done, what's next, env vars
- [`BACKLOG.md`](BACKLOG.md) — everything not in v1
- [`DECISIONS.md`](DECISIONS.md) · [`CHANGELOG.md`](CHANGELOG.md)
- [`research/`](research/) — market research, positioning, go/no-go
- [`compliance/`](compliance/) — Fair Housing rules and legal research (not legal advice)
- [`prompts/`](prompts/) — the AI prompts (edit these to improve writing quality)
- [`vault/`](vault/) — the Realtor Playbook Obsidian vault (side product)
