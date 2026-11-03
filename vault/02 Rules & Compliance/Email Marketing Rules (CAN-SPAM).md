---
title: Email Marketing Rules (CAN-SPAM)
tags: [realtor-playbook, compliance, email, can-spam, gmail, yahoo, marketing]
last_verified: 2026-11-03
status: partly-verified
---

# Email Marketing Rules (CAN-SPAM)

**In short:** Federal law (CAN-SPAM) lets you send commercial email without prior opt-in, but every message must be honest about who sent it, include your physical address, and give an easy way to unsubscribe, which you must honor within 10 business days. On top of that, Gmail and Yahoo require stricter technical setup and one-click unsubscribe if you send large volumes. Texting is different and much stricter: see [[Texting & Calling Leads (TCPA)]].

## CAN-SPAM requirements (FTC guide)
From the FTC's compliance guide (https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business , seen through search summary):
1. **No false or misleading header info.** "From", "To", reply-to and routing info must accurately identify who sent it.
2. **Subject lines must match the content.** No deceptive subjects.
3. **Identify it as an ad** (clearly and conspicuously) when it is one. The law gives flexibility in how.
4. **Include a valid physical postal address.** A street address, a registered USPS PO box or a registered private mailbox works.
5. **Tell recipients how to opt out**, clearly, with a working reply address or web link.
6. **Honor opt-outs within 10 business days.** The opt-out mechanism must work for at least 30 days after sending. You cannot charge a fee or demand more than an email address.
7. **Do not sell or transfer opted-out addresses** (except to a company helping you comply).
8. **You are still responsible if a vendor sends for you.**
Also: it covers all commercial email, including to past clients and business contacts. Transactional or relationship messages (like closing details to your client) are mostly exempt but the FTC reads that narrowly. Penalty amounts per email: (unverified — check ftc.gov, it is adjusted yearly).

FTC resources: https://www.ftc.gov/legal-library/browse/statutes/controlling-assault-non-solicited-pornography-marketing-act-2003-can-spam-act , FAQ-style blog: https://www.ftc.gov/business-guidance/blog/2015/08/candid-answers-can-spam-questions , quick PDF: https://www.ftc.gov/media/71413

## Gmail and Yahoo bulk-sender rules (2024)
Google and Yahoo began requiring more from bulk senders in February 2024. Details below come from vendor summaries, since Google's own pages were not available in this session (verify at Google's "Email sender guidelines" help page):
- "Bulk" means roughly 5,000+ messages per day to personal Gmail accounts (once flagged as bulk, always bulk).
- Authenticate with SPF, DKIM and a DMARC record (a "none" policy is enough to meet the basic requirement per one source).
- Marketing email needs easy one-click unsubscribe (and honoring it within 2 days per vendor summaries).
- Keep spam complaint rate under 0.3% (vendors advise staying under 0.1%).
- Enforcement has grown: temporary rate-limiting and later hard rejections for non-compliant mail.
Vendor summaries: https://help.close.com/docs/requirements-for-bulk-email-senders , https://redsift.com/resources/blog/gmails-enforcement-ramps-up-what-bulk-senders-need-to-know , https://www.suped.com/learn/email-deliverability/what-are-the-recent-changes-to-googles-bulk-sender-guidelines
Most individual agents will not hit 5,000 a day, but your CRM or brokerage platform may. Good authentication and easy unsubscribe also help inboxing for small senders.

## Real estate tips
- Use your brokerage name as the sender where state rules require brokerage identification: [[Advertising Rules by State]].
- Do not add people to a newsletter just because you met them once without telling them. CAN-SPAM allows it, but your state, brokerage or other rules may not, and it hurts deliverability.
- Keep fair housing in mind in email copy: [[Fair Housing Advertising]].

## What to do
- [ ] Add your name/brokerage and a physical address to every email footer.
- [ ] Use a visible unsubscribe link and process requests quickly (aim for same day).
- [ ] Keep subject lines honest.
- [ ] Use a CRM or email platform that sets up SPF, DKIM, DMARC for your sending domain.
- [ ] Check complaint rates in your email tool; remove cold or bounced contacts.
- [ ] Keep an unsubscribe list and never re-add those people.
- [ ] If an agent assistant or vendor sends for you, check their compliance.

## Sources
- FTC CAN-SPAM compliance guide: https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
- FTC statute page: https://www.ftc.gov/legal-library/browse/statutes/controlling-assault-non-solicited-pornography-marketing-act-2003-can-spam-act
- FTC blog on CAN-SPAM questions: https://www.ftc.gov/business-guidance/blog/2015/08/candid-answers-can-spam-questions
- FTC PDF "Complying with the CAN-SPAM Act": https://www.ftc.gov/media/71413
- Close, bulk sender requirements: https://help.close.com/docs/requirements-for-bulk-email-senders
- Red Sift: https://redsift.com/resources/blog/gmails-enforcement-ramps-up-what-bulk-senders-need-to-know
- Suped: https://www.suped.com/learn/email-deliverability/what-are-the-recent-changes-to-googles-bulk-sender-guidelines

> Not legal advice. Rules change and vary by state and MLS — confirm with your broker or an attorney.
