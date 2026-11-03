# Terms of Service — Outline (not final text)

> **Researched 2026-11-03 — not legal advice.** This is an outline of what a SaaS ToS for RealtyBoost should cover. Do not copy it into production. A licensed attorney must draft/review the real Terms before launch. Items marked **[counsel]** are decisions for the attorney.

## 0. Structure notes
- Two audiences: **Agents** (customers, parties to the ToS) and **Consumers** (leads who submit landing-page forms; they are *not* RealtyBoost customers but their data flows through us). Agents get a ToS + Data Processing terms; consumers see a short notice + Privacy Policy on every landing page.
- Use plain language headings and a short summary box at top; keep the long form for enforceability. Use click-wrap acceptance (checkbox + logged timestamp, IP, ToS version).
- Minimum age: 18; users must be licensed (or working under a licensed broker) in their state. **[counsel]**

## 1. Parties and acceptance
- Entity name (LLC once formed), contact, effective date, version history.
- Agent represents they hold an active license, have authority to bind their brokerage if using the brokerage's name, and are 18+.
- Changes to terms: notice by email/in-app; continued use = acceptance; material changes need advance notice. **[counsel]**

## 2. The service
- Describe: AI content generation (listing descriptions, social, email, video scripts) in EN/ES/zh-Hans/VI/KO; landing pages; CRM; CMA drafts.
- Beta/features may change; no guarantee of uptime (SLA only if offered).

## 3. AI-output disclaimer (core section)
- **Agent is solely responsible** for reviewing, editing, and approving every AI output before publishing or sending: accuracy, fair housing, license/advertising rules, MLS rules, truth-in-advertising.
- AI can be wrong, biased, or produce plagiarized/infringing text; outputs are not guaranteed unique; translation may be imperfect — recommend native-speaker review for non-English copy.
- Fair housing filter is a **tool, not legal compliance**; may miss violations (false negatives) or flag acceptable text (false positives). Agent keeps responsibility. Agent must not try to circumvent the filter. Describe logging of filter flags/overrides.
- No professional advice (legal, tax, financial, appraisal).
- Agent must not rely on outputs for pricing or valuation decisions without independent verification.

## 4. CMAs and "no appraisal" claims
- CMAs are drafts for **the agent's use**, not appraisals, valuations, or opinions of value regulated under appraisal laws (USPAP, state appraiser licensing, and — if applicable — federal "valuation" rules). Required disclaimer on every CMA: "This is not an appraisal. It is an opinion of price based on comparable data and may be inaccurate."
- No guarantee of any sale price, days on market, ROI.
- Agent must not represent a CMA as an appraisal or provide it for lending purposes. **[counsel on state-by-state limits on compensated broker price opinions]**

## 5. Acceptable use
- No discriminatory content or targeting by protected class; no attempts to bypass filters.
- No spam; compliance with CAN-SPAM, TCPA, CASL, state texting laws; no purchased lists; consent proof required (see companion files).
- No false or misleading ads, fake testimonials, fake listings, bait-and-switch.
- No unlicensed practice; no impersonation; no illegal content; no scraping or reverse engineering; no use of outputs to build competing models (if desired — **[counsel]**).
- No uploading data you lack rights to (MLS data, photos, contact lists).
- Enforcement: warnings, suspension, termination, content takedown, reporting to authorities as required.

## 6. Agent content and licenses
- Agent owns their inputs; grants RealtyBoost a limited license to host, process, and display them to provide the service (including sending to LLM providers).
- **Outputs:** state that, as between the parties, the agent owns the AI outputs to the extent permitted by law; RealtyBoost makes no promise of copyright protection for AI-generated text. **[counsel; also check LLM provider terms on output ownership and restrictions]**
- RealtyBoost owns the platform, templates, filter lists, and aggregate/de-identified usage data.
- Feedback license.
- Third-party content: photos, MLS data — agent responsible.

## 7. Data ownership, privacy, and roles
- Agent is the **business/controller** for their contacts and lead data; RealtyBoost acts as **service provider/processor** — except for account data and service-improvement data where RealtyBoost decides purposes. Reference a DPA. **[counsel]**
- Consumers' lead data collected via landing pages belongs to the agent (subject to the Privacy Policy); RealtyBoost will not sell it or use it to market to consumers on our own behalf.
- No use of customer content to train foundation models by RealtyBoost; flow-down of LLM provider terms (no training on API data — **verify each provider's current terms**).
- Export on request; deletion after termination within X days (match Privacy Policy retention).
- Security: describe reasonable safeguards; breach notification to affected agents without undue delay; no warranty of absolute security.
- Agent's duties: lawful notice and consent for contacts, honoring opt-outs and deletion requests, not uploading sensitive data (SSNs, financial account numbers, health data). Consider forbidding children's data.

## 8. Subscription, billing, and cancellation
- Plans, prices, usage caps (AI credits, SMS volumes), taxes.
- **Stripe** processes payments; agent agrees to Stripe's terms; RealtyBoost does not store card numbers.
- Auto-renewal disclosures must satisfy state auto-renewal laws (CA's Automatic Renewal Law, Bus. & Prof. Code 17600 et seq., and FTC rules/"click-to-cancel" status — **verify the current FTC rule status; the 2024 FTC negative-option rule was challenged in court — verify**). Practical rule: clear price and renewal term at checkout; easy online cancellation; reminder emails where required; refund policy stated.
- Free trial terms; failed payments, suspension, data retention after non-payment.
- Price changes: notice period; right to cancel.
- Chargebacks: reserve right to suspend.
- SMS carrier fees, 10DLC pass-through.

## 9. Third-party services
- LLM providers, hosting, email, SMS, Stripe; no responsibility for third-party downtime. Agent complies with their policies (e.g., carrier rules).

## 10. Disclaimers of warranty
- "As is/as available"; no warranty of accuracy, fitness, uninterrupted service. Conspicuous (all caps customary). **[counsel; some states limit disclaimers]**

## 11. Limitation of liability and indemnity
- Cap (e.g., fees paid in prior 12 months); exclude indirect/consequential damages; carve-outs required by law. **Because fair housing, TCPA and copyright claims can be large, the cap and indemnity are critical — [counsel].**
- **Agent indemnifies** RealtyBoost for claims arising from agent's content, messages sent, failure to review output, consent failures, fair housing violations, MLS/brokerage violations.
- Consider insurance (tech E&O/cyber) once revenue starts.

## 12. Term, termination, suspension
- Agent can cancel anytime; effect on prepaid fees; our right to suspend immediately for legal risk (e.g., TCPA complaints, filter circumvention).

## 13. Dispute resolution
- Governing law/venue; **arbitration + class action waiver** (opt-out window) — **[counsel; consider state limitations and mass-arbitration risks]**; small-claims carve-out; notice-and-cure before filing.

## 14. Consumer-facing terms (landing pages)
- Short Terms of Use + Privacy Notice link; SMS consent language per `tcpa-sms.md`; "Agent, not RealtyBoost, is the party you are dealing with"; Equal Housing Opportunity statement; brokerage/license attribution.

## 15. Misc.
- Notices, assignment, force majeure, severability, entire agreement, export controls, DMCA agent registration (17 U.S.C. 512 — **register a DMCA agent with the Copyright Office if hosting user content**), electronic signatures, accessibility statement (WCAG goal; ADA website lawsuits exist).

## 16. Appendices to prepare
A) Acceptable Use Policy; B) Fair Housing policy summary (link to the public version of `fair-housing.md`); C) DPA / service-provider terms; D) SMS & Email compliance addendum; E) Subprocessor list.
