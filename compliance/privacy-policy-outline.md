# Privacy Policy — Outline (not final text)

> **Researched 2026-11-03 — not legal advice.** Outline only. A licensed privacy attorney must review the actual policy and the data flows before launch. I did not complete primary-source research on state privacy statutes; thresholds and effective dates below are from my background knowledge and are marked **[verify]**.

## 0. Approach
- Publish **two layers**: (1) Privacy Policy for agents (customers) and website visitors; (2) a short **consumer notice** on each landing page (what the agent collects, who processes it, how to opt out), linking to the full policy.
- Policy must match reality exactly. Do a **data map** first (what, where, who has it, how long). Misstating practices is an FTC Act Section 5 "deceptive practice" risk. **[verify with counsel]**

## 1. Data collected

| Source | Data | Purpose |
|---|---|---|
| **Agents** | Name, email, phone, license number/state, brokerage, address, logo/headshot, payment info (via Stripe), usage logs, support messages | Provide the service, billing, compliance attribution, support |
| **Consumers via lead forms** | Name, email, phone, message, property of interest, consent records (timestamp, IP, form text), device/browser info | Deliver the lead to the agent, run follow-ups the consumer consented to |
| **Agent's CRM contacts** | Names, emails, phones, notes, tags, communication history; possibly imported | Agent's CRM |
| **Listing / CMA inputs** | Property address, features, photos, comps, price opinions | Content generation, CMAs |
| **Technical** | IP, cookies, analytics, logs | Security, product analytics |

- **Do not collect** sensitive data intentionally (SSN, financial accounts, health, precise geolocation, race/ethnicity, immigration status). Prompt for notes with warnings; consider filters. Some state laws treat such data as "sensitive" and require opt-in.
- Do not collect race/ethnicity/religion to personalize copy (also a fair housing rule).

## 2. How we use data
- Provide/improve service; security/fraud; legal compliance; support; communications about the service; **no sale** and **no sharing for cross-context behavioral advertising** (state clearly if true — this simplifies CCPA/CPRA).
- AI: explain that inputs are sent to LLM providers to generate content; state whether inputs are used to train models (target: **no** — check each provider's API terms **[verify]**); avoid sending unnecessary personal data to LLMs (e.g., don't include lead phone/email in prompts).

## 3. Processors / service providers (list publicly)
- Cloud hosting/database; **LLM providers**; **Stripe** (payments); email delivery; SMS provider (Twilio, Telnyx, etc.); analytics/error monitoring; customer support tools; backup. Sign DPAs / service-provider contracts with each. Keep a subprocessor list and update when it changes.

## 4. Sharing and disclosure
- With agents (their leads); processors; legal requests; business transfer; with consent. No selling data.
- Brokerage access: if a brokerage account owner administers agents, say so.

## 5. California — CCPA/CPRA basics (Cal. Civ. Code 1798.100 et seq.)
- Applies to for-profit businesses that meet a threshold (annual gross revenue over a statutory amount — adjusted for inflation — or handling data of 100,000+ consumers/households or earning 50%+ of revenue from selling/sharing personal info) **[verify current numbers]**. A new startup may be below thresholds today, but **plan for it**; many obligations will also arise contractually from agent customers who are covered. As a **service provider**, we must have a contract limiting our use of the agent's data.
- Content to include if covered: categories collected/disclosed in the last 12 months; sources; purposes; whether sold/shared; rights (know, delete, correct, opt-out of sale/sharing, limit sensitive PI, non-discrimination); how to submit requests (two methods, typically web form + email/toll-free); 45-day response; verification; authorized agents; retention periods (CPRA); "Do Not Sell or Share" link only if applicable; honor **Global Privacy Control** signals if selling/sharing. **[verify]**
- Notice at collection on forms (a short line + link).

## 6. Other U.S. state privacy laws
- A growing list of comprehensive state laws (e.g., Virginia, Colorado, Connecticut, Utah, Texas, Oregon, Montana, Florida (narrow), New Jersey, and others) — each with different thresholds, effective dates, and rights. **Get an up-to-date list from counsel (IAPP maintains a tracker).** Common rights: access, deletion, correction, portability, opt-out of targeted ads/sale/profiling; consent for sensitive data; data protection assessments for certain processing; appeals process.
- **Washington My Health My Data Act** — only relevant if collecting health data; not core.
- **New York, New Jersey, Texas, Washington, Oregon** are among the target markets: check each. NJ's law took effect in January 2025 **[verify]**; Oregon's covers nonprofits too **[verify]**; Texas has a small-business carve-out that is narrower than people think **[verify]**.
- **Data breach notification laws:** all 50 states; plan an incident response procedure.
- **Biometric laws (IL BIPA, TX, WA):** avoid collecting face/voice prints (relevant if video features use voice/face cloning).

## 7. Cookies / tracking
- Landing pages and app: list cookies/SDKs; use consent banner where required; **avoid** third-party ad pixels on landing pages by default (they trigger "sharing" under CCPA and wiretap/pixel lawsuits, e.g., under California Invasion of Privacy Act claims — **verify**). If agents add their own pixels, the agent is responsible and the policy should say so.

## 8. Communications
- Service emails vs. marketing emails; unsubscribe; consumer texts governed by `tcpa-sms.md`; mention that agents may contact leads and that consumers can opt out by replying STOP or contacting the agent.

## 9. Retention and deletion
- Define periods: account data (life of account + X days); lead data (per agent, until the agent deletes or X years of inactivity); consent logs (keep long enough to defend TCPA/CASL claims — often 4-5 years after last message **[counsel]**); billing records (tax: usually 7 years **[verify]**); backups purge window (e.g., 30-90 days).
- Deletion on request and account closure; honor consumer deletion requests by forwarding to the agent and deleting from our systems where we are controller.

## 10. Security
- Encryption in transit and at rest; access controls; MFA for agents; least privilege for staff; logging; vendor review; backups; incident plan. Avoid promising "100% secure".

## 11. Children
- Service is for adults/licensed agents; not directed to children under 13 (COPPA) or 16-18 where state laws apply; do not knowingly collect children's data; delete if discovered. Lead forms: instruct that submitters must be 18+. Fair housing "familial status" content never involves collecting minors' data.

## 12. International
- **GDPR / UK GDPR note:** applies if you offer services to people in the EU/UK or monitor them. The product targets US agents; keep sign-up US-only and say so (not a guarantee of exemption). If EU/UK users appear, you'd need a lawful basis, DPA/SCCs for transfers, EU representative (if no EU establishment), and data-subject rights handling. **[counsel]**
- **Canada (PIPEDA / CASL)** if Canadian leads appear — see `can-spam-casl.md`.

## 13. Your rights and contact
- How to request access/deletion; appeals; contact email and postal address; Data Protection contact; effective date and change log.

## 14. Pre-launch tasks
1. Build data map and subprocessor list.
2. Check LLM provider contracts on retention/training; configure zero-retention if available.
3. Draft the consumer notice used on landing pages and the SMS/email consent language.
4. Decide cookie/analytics stack (privacy-friendly analytics preferred).
5. Counsel to determine CCPA applicability and which state-law disclosures to include.
