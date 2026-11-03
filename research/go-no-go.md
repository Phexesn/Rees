# Go / No-Go — RealtyBoost

_Decision gate from the build brief. Written 2026-11-03._

## Decision: **GO — with a validation gate before spending money on marketing.**

We have a clear enough positioning (see `positioning.md`) to justify building v1: no competitor we found offers a full Spanish/Chinese/Vietnamese/Korean interface, the age-friendly + transparent-pricing angle matches the most common complaints, and two features (DIY photo guide, per-lead Follow-Up Coach) are genuinely different. Building is also cheap at this stage (one cloud session, no paid staff).

But the evidence is **thin**: most research came from search summaries, much of the bilingual-market evidence is 2014–2020 trade press, and nobody has paid us yet. So the next step is not more features — it's talking to agents.

## Why GO

- **Differentiation exists** in four concrete places (multilingual UI, photo guide, explained Fair Housing filter, per-lead coaching).
- **Pain is real and repeated**: tool sprawl, onboarding pain, opaque pricing, older agents left behind (`audience-pain-points.md` #1–#10).
- **Low cost to test**: hosting + database + AI costs are small until there are users.
- **A second product** (the Realtor Playbook vault in `/vault`) can earn money and build an email list while the app matures.

## Biggest risks

| Risk | Why it matters | Mitigation |
|---|---|---|
| Distribution | The founder has no existing agent network; SaaS for agents is sold through trust | Start in one language community; demo in person; sell the vault first to build a list |
| Copyable features | Incumbents can add AI copy | Compete on the whole experience + community; iterate prompts with real agents |
| AI output quality | Bad copy kills trust instantly | Walkthrough with 5 real listings in 2–3 languages before launch (see HANDOFF) |
| Legal | Fair Housing, TCPA, privacy | Filter + consent capture are built; attorney review of filter rules, consent text, ToS and privacy before charging |
| AI cost per user | Thin margins at $29 | Track in `/admin`; switch heavy modules to Sonnet/Haiku per prompt file if needed |

## Validation gate (do this before paid marketing)

Within 30 days:
1. **Interview 15 agents** (at least 5 bilingual, at least 5 aged 45+). Show the app; ask what they'd pay.
2. **Pre-sell**: get **5 agents to pay** for a founding-member price (e.g. 3 months for $29 total) or **30 waitlist sign-ups** from ~200 targeted contacts.
3. **Real-content test**: generate listings for 5 real (public) homes in 2–3 languages and have 2 native-speaking agents rate them 1–5. Target average ≥ 4.

## Kill / pivot criteria

- If fewer than **2 of 15** interviewed agents say they'd pay $29+/month → **pivot**: focus on the Follow-Up Coach + vault as a cheaper "new agent toolkit", or on one language community only.
- If AI output scores average **< 3.5** after two rounds of prompt iteration → pause selling; fix quality first.
- If an attorney flags the product concept itself (not just wording) as high-risk → stop and redesign the affected feature.
