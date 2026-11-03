# TCPA and SMS Marketing

> **Researched 2026-11-03 — not legal advice.** Attorney review required before launch. `fcc.gov` pages were not fetched; findings come from law-firm/news search results. Verify each **[verify]** item against FCC and Federal Register primary sources. **Do not send any marketing SMS until counsel signs off and 10DLC registration is approved.**

## 1. The law in brief

- **Telephone Consumer Protection Act, 47 U.S.C. 227**; FCC rules at **47 CFR 64.1200**.
- Marketing texts sent with an autodialer (and, for FCC purposes, texts are "calls") need the recipient's **prior express written consent**. Statutory damages are **$500 per message, up to $1,500 if willful** — and class actions are common. That exposure can end a startup. **[verify amounts]**
- Real estate is a heavy TCPA litigation target because agents blast leads. RealtyBoost's CRM + landing pages make us a natural place for consent to be captured (or faked) — build it right.

## 2. Prior express written consent (marketing texts)

The consent must be a signed (e-sign OK) written agreement that:
1. Clearly authorizes **this seller** to send marketing texts using automated technology,
2. Identifies the **phone number**,
3. Says consent is **not a condition of purchase**,
4. Was obtained with clear disclosure.

### 2.1 Consent language to put next to the phone field on every lead form (template — counsel to finalize)

```
[ ] By checking this box and submitting this form, I agree to receive recurring
marketing and informational text messages (including from an automated system)
from [Agent Name], [Brokerage], at the number above. Consent is not a condition
of purchasing or selling any property or service. Msg & data rates may apply.
Message frequency varies. Reply STOP to cancel, HELP for help. See
[Terms] and [Privacy Policy].
```

Rules for the form:
- **Unchecked** checkbox, separate from the form-submit button and from the Terms checkbox. No pre-ticked boxes.
- Name the **actual sender** (the agent/brokerage), not just "partners".
- Do not make the SMS checkbox mandatory to get the property info.
- Don't share the number with others for their marketing (see 3).
- Store proof (Section 6).

## 3. The FCC "one-to-one consent" rule — status (checked)

| Event | Date | Source |
|---|---|---|
| FCC adopted rule requiring consent be given to **one seller at a time** and be "logically and topically related" to the website (closing the "lead generator loophole"); was due to take effect Jan 27, 2025 | adopted Dec 2023, effective date Jan 27, 2025 | https://www.jdsupra.com/legalnews/fcc-to-change-definition-of-prior-6235236 |
| **Eleventh Circuit vacated the one-to-one rule** (*Insurance Marketing Coalition v. FCC*): FCC exceeded its statutory authority | **Jan 24, 2025**; mandate issued April 30, 2025 | https://jdsupra.com/legalnews/eleventh-circuit-vacates-tcpa-1-1-9136309 ; https://www.kelleydrye.com/viewpoints/blogs/ad-law-access/eleventh-circuit-vacates-tcpa-11-consent-rule |
| FCC formally removed the vacated language from the CFR | Final rule, Federal Register Aug 29, 2025 (90 FR, 2025-16641) | https://www.govinfo.gov/content/pkg/FR-2025-08-29/html/2025-16641.htm |

**Answer:** Yes — the one-to-one consent rule was **vacated in January 2025** and the FCC conformed its rules in 2025. The "express written consent" definition otherwise remains, so you still need clear, signed written consent; but a single consent can, under the current text, cover more than one seller if properly disclosed. **Recommended practice anyway: one named sender per consent** (cheapest litigation defense).

Other changes found:
- **Revocation of consent ("revoke-all") rule:** originally effective April 11, 2025; the FCC delayed the "revoke-all" part to **April 11, 2026**, then (Jan 6, 2026 order) to **January 31, 2027**, while it considers a Further Notice of Proposed Rulemaking. Other revocation duties (honor reasonable revocation methods, e.g., "STOP", "quit", "end", "unsubscribe", and process within a short window — **10 business days under the 2024 order, verify**) remain in effect. Sources: https://www.burr.com/telephone-consumer-protection-act/the-fcc-delays-effective-date-of-tcpa-revoke-all-rule-until-january-31-2027 ; https://www.jdsupra.com/legalnews/fcc-further-extends-effective-date-for-4048246/ ; https://mslawgroup.com/delayed-again-fcc-pushes-back-tcpas-revoke-all-rule-to-january-31-2027/ . **[verify whether the FCC has acted since; I did not find a later order]**
- **Fifth Circuit (March 2026 panel):** reported holding that oral consent can suffice for autodialed telemarketing under the statute, in tension with the FCC's written-consent rule (https://www.mayerbrown.com/es/insights/publications/2026/03/fifth-circuit-panel-allows-prior-express-oral-consent-for-telemarketing-calls-under-the-telephone-consumer-protection-act). A single-circuit panel ruling — don't rely on it; keep written consent.
- **Do-Not-Call:** Do-Not-Call Registry protections are generally applied to marketing texts by the FCC; you must scrub against the National DNC Registry and the sender's internal DNC list unless there is documented written consent or an established business relationship exception. **[verify exact rules and EBR window]**; there are also state DNC lists (e.g., TX, FL).
- **State "mini-TCPA" laws:** e.g., Florida (FTSA) and Oklahoma, Maryland and others have their own texting rules and quiet-hour/consent requirements. **[counsel to build a state matrix before sending]**

## 4. Quiet hours and frequency

- Federal: telemarketing calls/texts **not before 8:00 a.m. or after 9:00 p.m. in the recipient's local time** (47 CFR 64.1200(c)(1)). Local-time calculation must use the recipient's area code/zip, not the agent's. **[verify]**
- Some states are stricter (e.g., Florida's FTSA 8am-8pm, Texas 9am-9pm weekdays/noon-9pm Sunday, Oklahoma 8am-8pm, Washington 8am-9pm — **all [verify] before relying**).
- The product should enforce the **strictest relevant window** (recommend 9 a.m.–8 p.m. recipient local time) and a per-recipient frequency cap.

## 5. Required messages and keywords

- Every campaign: first message identifies the sender and says how to stop: e.g., "RealtyBoost for Jane Smith, ABC Realty: Thanks for your interest in 123 Main St. Msg&data rates may apply. Reply STOP to opt out, HELP for help."
- **STOP** (also STOPALL, UNSUBSCRIBE, CANCEL, END, QUIT) → immediately unsubscribe, send **one** confirmation, then no further texts. Treat any reasonable revocation phrase as STOP (FCC revocation rule).
- **HELP** → reply with sender name, contact info, and how to opt out.
- **START/UNSTOP** → re-subscribe only if the person asks.
- Don't send marketing to anyone who opted out on any channel from the same sender without legal advice.

## 6. Record keeping

- Keep for each number: timestamp of consent, exact consent text and form version, URL, IP, device/user agent, phone number, who the sender was, opt-out time, all messages sent. Many practitioners keep **at least 4–5 years** (TCPA statute of limitations is 4 years; **[verify; counsel to set policy]**). Make it immutable/append-only and exportable.

## 7. A2P 10DLC registration (carrier requirement, not a law)

- "10DLC" = 10-digit long-code numbers used for application-to-person (A2P) texting in the US. Registration is through **The Campaign Registry (TCR)**, usually via your SMS provider (Twilio, Telnyx, Bandwidth, etc.).
- Steps: register **brand** (company legal name, EIN, address, website) → register **campaign** (use case, sample messages, opt-in flow description, opt-out/HELP text, privacy policy and terms URLs) → attach numbers.
- Unregistered 10DLC traffic is **blocked** by US carriers in practice (secondary sources date the hard cutoff to around Feb 2025); carriers also pass through fines to non-compliant senders. Vendor guides: https://conduit.ai/blog/a2p-10dlc-registration-step-by-step-for-2026 ; https://dev.to/alfredo_romero_fc4afdcb68/a2p-10dlc-survival-guide-for-voice-agencies-2026-carrier-filtering-is-now-real-time-29mp (secondary; **[verify with provider docs]**).
- Fees are small but change often (one-time brand fee of a few dollars to ~$50 with vetting, monthly campaign fees of a few to ~$15, plus per-message carrier surcharges raised in 2026 by some carriers — vendor sources conflict; **[verify with provider]**).
- **Two ways to structure registration:** (a) RealtyBoost registers once as the platform and each agent is a sub-brand/ISV customer, or (b) each agent registers their own brand. Check your SMS provider's ISV/reseller model early; it affects onboarding flow and approvals.
- Carrier content rules: no SHAFT content (sex, hate, alcohol, firearms, tobacco), no phishing, no public URL shorteners (bit.ly), no number-rotation to evade filters. **[verify with CTIA Messaging Principles and Best Practices]**

## 8. What the software MUST enforce for SMS

1. **No SMS feature until 10DLC is approved** and counsel signs off on the consent copy.
2. **Per-contact consent record** required to send; imported contacts without proof of written consent cannot receive marketing texts.
3. **STOP/HELP handling** automated, with a global per-agent suppression list.
4. **Quiet hours** by recipient local time (strictest state window), with scheduling queued, not dropped.
5. **Consent text template** cannot be edited by agents to remove required disclosures.

## 9. Questions for counsel

- Who is the "sender" for TCPA — agent, brokerage, or RealtyBoost?
- Do we use an "autodialer" within TCPA/Facebook v. Duguid (2021) meaning? (Plain click-to-send texts may not be; do not rely on this without advice.)
- State mini-TCPA matrix; vicarious liability for agents' misuse; indemnity and insurance.
