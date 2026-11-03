# SMS Compliance: TCPA, A2P 10DLC, Quiet Hours, Opt-Outs

As of 2026-11-03. Statute and carrier pages were not fetched directly; this is a first-pass brief. **Get legal review before sending any marketing text.**

Tags: **[S]** = secondary source. **[U]** = unverified, commonly cited.

## TCPA consent (US)
- Marketing texts need **prior express written consent** from the recipient [S] (vendor compliance guides: help.postscript.io, bird.com/docs).
- Keep consent records: who, when, what wording, and how it was given. The sender bears the burden of proof [S].
- Consent can be collected electronically, including by text keyword [S].
- Transactional messages (e.g., showing confirmations you initiated) need only prior express consent [S].
- Include opt-out instructions on the first message and periodically [S].
- Include the statement that consent is not a condition of purchase [S] (vendor guidance).

## Quiet hours
- Commonly cited window: **8:00 a.m. to 9:00 p.m.** in the recipient's local time [U]. Some sources say 8 p.m.; the 9 p.m. figure is the common one.
- Reported 2025 class actions test whether this window covers promotional texts [S] (Buchalter client alert, March 2025: buchalter.com/insights/...). Treat the window as a hard rule in code.
- Some states are stricter. Check state rules per recipient.

## Opt-out keywords
- Honor **STOP** at minimum [S].
- Also honor common variants: "stop", "end", "unsubscribe", "cancel", "quit", "please opt me out" [S] (bird.com US SMS compliance).
- Opt-out is immediate and permanent. Confirm once with a single reply, then do not text again [S].
- Keyword handling is done by the messaging provider; check it is enabled before launch.

## A2P 10DLC registration (US application-to-person texting)
Process (typical):
1. Register the **brand** (business identity: legal name, EIN, address, website) with the registry (The Campaign Registry via your provider).
2. Register a **campaign** (use case, sample messages, opt-in flow, opt-out language).
3. Attach phone numbers to the approved campaign.
4. Carriers review; approval time varies. Plan for days to weeks [U].

### Costs (Twilio, from search snippets; verify on Twilio pricing)
| Item | Cost | Status |
|---|---|---|
| Standard brand registration (one-time) | $44 [S] (Twilio overview). One Twilio brand page shows $41.50. | Conflicting |
| Low-volume standard brand | $4 one-time [S] | |
| Campaign vetting (one-time per campaign) | $15 [S] | |
| Monthly per campaign | $1.50–$10 depending on use case, Standard [S]; $2 for sole proprietors [S] | |
| Political vetting (brand, yearly) | $66–$96 [S] | |
| Carrier pass-through and fees | Changed 2025-08-01 [S] | Check current |

A third-party blog cites $4/month per brand and $10/month per use case. It conflicts with Twilio's published structure, so do not use it [S, low reliability].

Sources: https://support.twilio.com/hc/en-us/articles/1260803965530 [S]; https://www.twilio.com/docs/trust-hub/registrations/a2p-10dlc-campaign [S, URL from search].

## Prompt-writer rules for SMS
1. Every outbound message: sender name, brand, and "Reply STOP to opt out" (on first message).
2. Generate only for contacts with a consent record. Gate the send in code, not in the prompt.
3. Check recipient local time before scheduling; drop sends outside 8 a.m. to 9 p.m.
4. Keep messages short (160 GSM characters per segment; 70 UCS-2 characters for Chinese, Korean, or Vietnamese-accented text) [U: standard SMS segment sizes].
5. Never send MLS-restricted content (see mls-listing-rules.md).

## Sources
- Twilio A2P 10DLC brand: https://www.twilio.com/docs/trust-hub/registrations/a2p-10dlc-brand [S, URL from search]
- Twilio A2P 10DLC campaign: https://www.twilio.com/docs/trust-hub/registrations/a2p-10dlc-campaign [S]
- US SMS compliance (bird): https://docs.bird.com/applications/general/deliverability-and-compliance/united-states-compliance/us-sms-mms-compliance [S]
- Quiet-hours litigation alert (Buchalter, 2025): https://www.buchalter.com/insights/one-florida-firm-is-targeting-ecommerce-brands-with-tcpa-class-actions-claiming-that-promotional-text-messages-sent-outside-of-8am-9pm-are-illegal-the-industry-is-fighting-back-and-heres-wh/ [S]
