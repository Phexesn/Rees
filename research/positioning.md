# RealtyBoost — Positioning

_Written 2026-11-03 from `competitors.md`, `audience-pain-points.md` and the other briefs in this folder. Most underlying sources were read as search summaries (see the honesty notes in each file); treat claims as directional until re-verified._

## The one-line position

**The simple, multilingual marketing-and-follow-up assistant for real estate agents who don't want five tools — $29 to start.**

For agents (especially 45+ and bilingual agents serving Spanish, Chinese, Vietnamese and Korean buyers) who lose time and listings to tech-fluent competitors, RealtyBoost turns one set of listing facts into Fair-Housing-checked marketing in their clients' languages, and tells them what to say when a lead calls. Unlike kvCORE/BoldTrail, Lofty or Follow Up Boss, it is built to be learned in one sitting, priced transparently, and works in five languages from the first screen.

## Where the incumbents leave a gap

| Pain (from audience research) | What incumbents do | RealtyBoost wedge |
|---|---|---|
| Tool sprawl, too many logins (#1) | All-in-ones exist but are heavy; marketing tools are separate products | One place for listing copy, posts, video plans, emails, photo guide, lead pages, CRM, CMA |
| Steep learning curve; support fades (#4, #5) | Feature-dense dashboards, onboarding calls | Age-friendly UI: 18px+ text, one task per screen, 5-step setup, plain-language help |
| Opaque pricing and add-ons (#6, #7) | FUB ~$69 headline, more with calling/IDX; kvCORE/Lofty sold via brokerages | Published $29 / $79 / $199 tiers, no add-ons |
| Older agents feel left behind (#9, #10) | Training programs | Software that doesn't need training; peer-demo-friendly ("watch me make a listing in 2 minutes") |
| AI copy needs editing; fact errors (#11) | Generic AI writers (ListingAI, ListingCopy.ai) | Writes only from entered facts, platform-specific limits, brand voice, built-in Fair Housing filter that explains its changes |
| Spanish/Asian-language clients underserved (#12–#15) | No vendor found with a Spanish, Chinese, Vietnamese or Korean **UI** | Full UI in 5 languages + content in 8; "also write it in…" side-by-side output |
| New agents don't know what to say | Action plans / drip templates in CRMs | **Follow-Up Coach**: per-lead call script, objection answers, text, email, 2-week plan |
| Photography costs per listing | Pros or nothing | **DIY phone photo guide** tailored to the house's orientation and the agent's exact phone |

## What we do that none of the top five all-in-ones do (as far as we could find)

1. **Native-language UI + content for es / zh / vi / ko** in the same product.
2. **A per-listing phone-photography plan** (lighting by orientation, device-specific settings, shot list, free-app editing).
3. **A Fair Housing filter that shows its work** (what was rewritten/removed and why), in five languages.
4. **Per-lead AI coaching** aimed at new agents, not just templated drips.

These are wedges, not moats: incumbents can add AI copy quickly. The defensible parts are (a) the multilingual + age-friendly experience as a whole, (b) the community and trust we build in specific language communities, and (c) prompt quality iterated on real agent feedback.

## Who to sell to first (beachhead)

1. **Bilingual Vietnamese-American and Korean-American agents** in Orange County / Houston / Atlanta / Northern Virginia — tight communities, word of mouth, very few tools in their language. The founder's language and network may be an advantage here.
2. **Spanish-speaking agents in Texas, Florida, California** — the largest bilingual segment.
3. **Solo agents 45+** frustrated by their brokerage's all-in-one — via local association meetups and Facebook groups.

## Pricing logic

- **Solo $29** sits below Wise Agent (~$49, unverified) and far below FUB/kvCORE; it's an impulse-level price for a marketing helper.
- **Pro $79** is where CRM + lead pages + CMA live; comparable to FUB's headline but without add-ons.
- **Team $199** for 5 seats undercuts per-seat pricing of incumbents.
- Unit economics to watch (see `/admin`): with Claude Opus 5.5 at $4/$20 per million tokens (thinking tokens bill as output), rough estimates are ~$0.08–0.12 per MLS/social/email generation and ~$0.20–0.30 per photo guide (it sends ~10k tokens of reference text). A heavy Solo user (~80 pieces/month, one language) could cost **~$5–15/month** — thin at $29. Levers: prompt caching (already on), and switching lighter modules to `claude-sonnet-5-5` ($2/$10) or `claude-haiku-5-5` in their prompt files. **Measure real usage before launch.**

## Messages that should land (to test)

- "Your next listing, marketed by lunch — in English and Spanish."
- "No photographer? Your phone, our plan."
- "Know exactly what to say when a buyer calls."
- "Big text, clear buttons, no 40-page manual."
