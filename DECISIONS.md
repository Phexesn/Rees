# Decisions

Product and technical decisions made during the build, with the alternative we didn't pick. (Brief rule: "When in doubt, pick the simpler path and log the alternative.")

| # | Decision | Alternative considered | Why |
|---|---|---|---|
| 1 | **Web app, installable (PWA manifest)** — not a desktop download | Electron/desktop app | Agents work from phone, laptop and tablet; one version to maintain; billing and updates are simpler. "Add to Home Screen" gives the app feel. (Founder confirmed.) |
| 2 | Email + password auth with DB sessions | Clerk / Auth.js | No third-party setup or monthly cost; simple to reason about. Swap later for Google sign-in / magic links. |
| 3 | Own small UI kit instead of shadcn/ui | shadcn CLI | Fewer dependencies; age-friendly sizes enforced centrally (16px minimum, 20px inputs, 56px buttons). |
| 4 | Postgres RLS **plus** app-level tenant scoping | App-level only | Brief: "no shortcuts" on multi-tenancy. RLS makes a forgotten `where` harmless. Cost: one extra statement per query. |
| 5 | Cookie-based locale (no `/es/...` URLs) | Locale-prefixed routes | Simpler for an app behind login; public listing pages use the page's own language. |
| 6 | **Default model: `claude-opus-5-5`** for all prompts, configurable per prompt file | Haiku/Sonnet for cheaper modules | "Prompts are the real product" — start with the best quality, then move individual modules down once real outputs are reviewed. Watch `/admin` cost. |
| 7 | `temperature` kept in prompt files but not sent to Claude | Remove the field | Brief asks prompts to declare temperature; current Claude models reject sampling params, so it's only used for OpenAI/Google. `effort` is the Claude equivalent. |
| 8 | Offline **mock AI provider** in development | Require keys to run locally | Every screen can be clicked through without paying for AI. Banner says "Demo mode". Never active in production. |
| 9 | Fair Housing rules in `compliance/fair-housing.rules.yaml`; policy text in `fair-housing.md` | Rules parsed from the markdown | YAML is reliable to parse and still editable by non-engineers / attorneys. |
| 10 | Filter behavior: rewrite safe synonyms → regenerate once on violations → remove remaining violating sentences → flag risky phrases | Block the whole output | Agents get usable copy and a clear explanation instead of an error. |
| 11 | **CMA math is deterministic code**; AI only writes the narrative | Let the AI estimate value | Keeps out of appraisal territory; numbers are explainable and reproducible. |
| 12 | **Follow-Up Coach** added (not in the original brief), in the Solo tier | Pro-only, or not built | Founder's idea; strongest value for new agents. Messages are sent by the agent from their own phone/email (one-to-one replies to people who reached out). |
| 13 | "Automated drip" in v1 = automatic follow-up **task plan** (call now, text day 1, email day 3, check-in day 7) + agent email alert | Automated email/SMS sending | Brief puts email/SMS sending out of scope; also avoids TCPA/10DLC exposure until registration is done. |
| 14 | Lead form captures email + **SMS consent with timestamp, source and exact wording** | Single "contact me" checkbox | TCPA record keeping; needed before any future texting feature. Wording needs attorney review. |
| 15 | Dev billing mode (switch plans without Stripe) when `STRIPE_SECRET_KEY` is unset and not production | Require Stripe to test tiers | Lets every tier be tested locally; impossible in production. |
| 16 | 14-day **Pro** trial on signup | Start on Solo / require card | Shows the full product; standard SaaS practice. |
| 17 | Content languages: 8 (en, es, zh, vi, ko, tl, pt-BR, fr-CA); UI languages: 5 | 8 UI languages | Team tier promises 8 languages — content generation supports all 8 today; UI translation of the last 3 is in the backlog. |
| 18 | Listing photos as a pasted URL (no uploads) | File uploads (Vercel Blob/S3) | Avoids storage setup in v1; uploads are in the backlog. |
| 19 | Lead routing **not shown** anywhere until it is built | List it as a Team feature now | Brief: no "coming soon" in the product UI. Add it back to the Team plan card when it ships (see BACKLOG). |
| 20 | Prompt hot reload from the filesystem (mtime check); DB-backed store later | DB store now | Simplest thing that satisfies "edit prompts without code changes" in dev/self-hosted; interface ready for a DB store. |
| 21 | Photo-guide reference text = the research file, with confidence tags | Hand-written summary | Model can distinguish sourced facts from "(verify)" items and tells agents what to double-check. |
| 22 | Realtor Playbook **Obsidian vault** as a side product in `/vault` | Separate repo | Reuses the research; can be sold before the app launches. |
