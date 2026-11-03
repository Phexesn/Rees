# Email Deliverability: Bulk and Cold Sending

As of 2026-11-03. Google and Yahoo help pages were not reachable. Requirements below come from secondary sources and must be checked against Google Postmaster and Yahoo documentation before launch.

Tags: **[S]** = secondary source. **[U]** = unverified, commonly cited.

## Gmail and Yahoo bulk sender rules (2024)
- **Threshold:** the "bulk" line is commonly stated as **5,000+ messages per day** to Gmail or Yahoo addresses [U]. Yahoo has said there is no fixed magic number, so apply the rules to any campaign volume [S] (vendor reporting quoting Yahoo).
- **Authentication:** SPF and DKIM must pass, the From domain must align, and a DMARC record must be published [S] help.close.com/technical-support/email-deliverability/requirements-for-bulk-email-senders; warmy.io/guides/google-yahoo-sender-requirements/.
- **One-click unsubscribe:** RFC 8058 `List-Unsubscribe-Post` header on promotional mail [S].
- **Opt-out processing:** honored within 2 days [S].
- **Spam rate:** keep below **0.3%** (Google Postmaster Tools / Yahoo Complaint Feedback Loop). Target under 0.1% [S].
- **Rule effective:** February 2024 [U] (commonly cited date; verify).

## Cold outreach (agent prospecting)
- Cold email to individuals without consent is a CAN-SPAM question (US), not a TCPA question (see sms-compliance.md).
- Warm up new domains. Start at ~20–50 sends/day and ramp over 2–4 weeks [U].
- Use a separate sending domain or subdomain from the brokerage's main domain.
- Keep the spam rate under 0.1% as an operating target [U].

## CAN-SPAM basics (US)
- Honor opt-outs within **10 business days** [S] FTC guide archived copy: webarchive.library.unt.edu/web/20130214054537/http://business.ftc.gov/documents/bus61-can-spam-act-compliance-guide-business.
- Opt-out must work for at least 30 days after send [S] same guide.
- No fee, no extra steps to opt out [S].
- Include a valid physical postal address in every commercial email [S] (CAN-SPAM requirement; widely cited).
- Accurate From and subject lines; no deceptive headers [S].
- Penalties: per-email amounts differ across sources (about $43,000 to $53,000 per violation depending on the inflation-adjustment year). Verify against the Federal Register before quoting [S, conflicting].

## Prompt-writer rules for email blasts
1. Include the unsubscribe link and physical address in the template footer. Never generate an email without them.
2. Subject lines: no "RE:" or "FW:" tricks; no all-caps; no deceptive urgency.
3. One CTA per email.
4. Personalization tokens must have fallbacks.

## Sources
- Requirements summary: https://help.close.com/technical-support/email-deliverability/requirements-for-bulk-email-senders [S]
- Gmail and Yahoo overview: https://www.warmy.io/guides/google-yahoo-sender-requirements/ [S]
- CAN-SPAM guide (archived FTC): https://webarchive.library.unt.edu/web/20130214054537/http://business.ftc.gov/documents/bus61-can-spam-act-compliance-guide-business [S]
- Google sender guidelines (not reached): https://support.google.com/a/answer/81126 [unverified]
