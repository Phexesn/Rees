# Email Marketing: CAN-SPAM (US) and CASL (Canada)

> **Researched 2026-11-03 — not legal advice.** Attorney review required before launch. `ftc.gov` could not be fetched from the research environment, so FTC points come from search results and my background knowledge; items marked **[verify]** need confirmation at the primary source.

## 1. Why this matters for RealtyBoost

RealtyBoost drafts emails that **agents send to their contacts and leads**. The agent is usually the "sender", but RealtyBoost may be the one that initiates/transmits (if emails go out via our infrastructure) — under CAN-SPAM both the one who initiates and the one whose product is promoted can have duties. **[ask counsel how this applies to a tool that sends on the agent's behalf]**

## 2. CAN-SPAM (15 U.S.C. 7701-7713; FTC rule at 16 CFR Part 316)

Applies to **commercial** email (primary purpose is advertising/promotion). It has **no business-to-business exception**. Transactional/relationship messages (e.g., a signed-contract update) have lighter rules, but real estate drip/newsletter/listing emails are commercial.

| Requirement | What to do | Software enforcement |
|---|---|---|
| **No false or misleading header info** | "From", "To", reply-to, and routing info must be accurate and identify the real sender. | Send from the agent's real name/brokerage; no spoofed addresses. |
| **No deceptive subject lines** | Subject must reflect the content. | LLM prompt rule + filter: no "Re:"/"Fwd:" fakes, no "URGENT: your account", no fake price drops. |
| **Identify the message as an ad** | Clear and conspicuous, unless the recipient gave prior affirmative consent. | Add a short "This is a marketing message" line by default. |
| **Valid physical postal address** | Street address, a registered PO box, or a private mailbox (CMRA). | Require the agent's brokerage address at onboarding; auto-insert in the footer; block sending if empty. |
| **Clear opt-out mechanism** | Working unsubscribe link/reply; must work for **at least 30 days** after sending. Opt-out can't require a fee, login, or more than the email address. | One-click unsubscribe link in every email. |
| **Honor opt-outs within 10 business days** | Don't send again; don't sell/transfer the address (except to a vendor helping comply). | Process immediately (do better than the law); global suppression list per agent. |
| **Monitor third parties** | If a vendor sends on your behalf, you are still responsible. | Contract terms with email provider. |

- **Penalties:** each violating email is a separate violation. Secondary sources quote a figure around **$53,088 per email** (adjusted annually; sources disagree: $50,120 / $51,744 / $53,088). **[verify current figure on ftc.gov]**. A 2024 enforcement example mentioned in results: Verkada, $2.95 million. Source summaries: https://www.adaptivesecurity.com/blog/can-spam-act-requirements , https://transcend.io/blog/can-spam-act (secondary).
- **FTC primary guide to fetch later:** https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business (not reachable from this environment).
- **Also (not CAN-SPAM):** Gmail/Yahoo bulk-sender requirements (SPF, DKIM, DMARC, one-click unsubscribe, spam rate under a threshold) apply when sending in volume. These are provider rules, not laws; **[verify current thresholds]**.
- **State laws:** some states have their own commercial-email statutes; CAN-SPAM preempts many but not all. **[counsel]**

### 2.1 Draft footer the product should append (template, not final text)

```
[Agent name] | [Brokerage legal name] | [License # where required]
[Street address, City, ST ZIP]
You received this because you [signed up at ... / inquired about ...].
Unsubscribe: [one-click link]    Equal Housing Opportunity
```

## 3. CASL (Canada's Anti-Spam Legislation, S.C. 2010, c. 23)

CASL is **stricter than CAN-SPAM** and is opt-in. It applies to commercial electronic messages (CEMs) **sent to or accessed from Canada**, including email and text. Penalties are large (administrative monetary penalties up to C$10 million per violation for organizations and C$1 million for individuals — **[verify]**). Primary sources: CRTC and Canada's Fight Spam site (https://crtc.gc.ca , https://fightspam.gc.ca) — not fetched here.

| Topic | Summary (from background knowledge — **verify**) |
|---|---|
| **Consent required before sending** | **Express consent** (opt-in, clearly says what they're agreeing to, who is asking, how to unsubscribe; not a pre-ticked box; you keep proof) or **implied consent**. |
| **Implied consent examples** | Existing business relationship (purchase/contract within last **2 years**); inquiry or application (within last **6 months**); conspicuously published address with no "no spam" notice and message relevant to their role; personal/family relationship per the rules. Real estate leads who submit a landing-page form: treat as *express* consent only if the form language says so; otherwise they are likely implied for 6 months only. |
| **Identification** | Sender name, who it's on behalf of, mailing address, and contact info (phone, email, or web link), valid for 60 days. |
| **Unsubscribe** | Free, easy, honored within **10 business days**. |
| **Computer program / software installs** | Separate rules; not relevant unless RealtyBoost installs software on users' devices. |
| **Texts to Canada** | Same CASL consent rules. |

**Recommended MVP stance:** (1) at launch, add a "Canadian recipient" flag and block bulk sends to numbers/emails flagged Canadian unless the contact record shows **express** consent with a captured timestamp and wording; or (2) state in the ToS that RealtyBoost is for US-based agents marketing to US residents and the agent warrants compliance for any non-US recipients. Option 2 alone does not remove risk — talk to counsel.

## 4. Consent records to store (for both laws)

- Contact email/phone; date/time; IP/user agent; page URL/form version; exact consent text shown; source; unsubscribe timestamp; suppression flag. Keep for at least as long as you email them plus a margin set by counsel (CASL practice is often 3+ years after consent ends — **[verify]**).

## 5. Open questions for counsel

- Is RealtyBoost a "sender" or "initiator" when it dispatches on the agent's behalf?
- Do we allow importing contact lists? (High risk: imported lists with unknown consent.) If yes, require the agent to attest consent and gate the first send.
- CASL position for a US-targeted product with some Canadian contacts.
