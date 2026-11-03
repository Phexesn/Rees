# State Advertising and Disclosure Quirks — Top Agent Markets

> **Researched 2026-11-03 — not legal advice.** Attorney review required before launch. Only **CA** and **TX** rows are backed by sources I actually found (links below). The other eight states are listed with **what to look up** and the likely authority; I deliberately did **not** invent rule numbers. Each state's real estate commission website is the primary source; use a licensed-in-state attorney or the commission's advertising FAQ to confirm.

## 1. Cross-state baseline (design for the strictest)

Nearly every state requires, for agent ads (including websites, social posts and emails):
- The **brokerage's name** (as licensed with the state), shown clearly.
- The agent not to appear to be the brokerage.
- No misleading claims ("#1", "guaranteed sale", "no commission") without substantiation.
- A **license number** in a subset of states (CA is the best-known).
- Special rules for **team names**, **DBAs / trade names**, **"sold" ads**, and **ads for another broker's listing**.

**Design rule:** collect state, agent license number, brokerage legal name/DBA, and team name at onboarding; build an "ad attribution block" template per state; let counsel approve the template per state before enabling that state.

## 2. California (DRE) — researched

| Item | Detail | Source |
|---|---|---|
| License number in ads | The **DRE license number** of each licensee named must appear on **first point of contact** solicitation materials, including websites/online ads/business cards (Bus. & Prof. Code 10140.6; DRE Reg. 2773 per a DRE decision quoted in results). Revocation has occurred partly for failing to list license numbers on a website. | https://www.dre.ca.gov/files/pdf/forms/re559.pdf ; https://law.justia.com/codes/california/code-bpc/division-4/part-1/chapter-3/article-1/section-10140-6/ ; https://journal.firsttuesday.us/?p=54979 |
| Broker identification | Ad must identify the broker (name; and the DRE license-status statement that the broker is licensed by the State of California). | DRE form above |
| Team names | Team advertising rules in Bus. & Prof. Code 10159.6 and 10159.7 (team name defined in 10159.7; team ads must include the responsible broker's identity displayed as prominently as the team name, and the licensee's name and license number). **Results quoted a 2014 bill version — confirm current text.** | https://www.dre.ca.gov/files/pdf/faqs/Team%20Name%20FAQs.pdf ; https://journal.firsttuesday.us/fictitious-business-names-teams-and-identification-requirements/90320/ |
| Fictitious names | Using a fictitious business name requires a DRE license endorsement (Bus. & Prof. Code 10159.5 — **verify**). | firsttuesday link above |
| Fair housing | Extra CA protected classes — see `fair-housing.md`. | |

## 3. Texas (TREC) — researched

| Item | Detail | Source |
|---|---|---|
| Broker name in ads | Ads must include the **broker's name** as licensed; for team ads the broker name must be at least **half the size of the largest** contact information for any agent/team name in the ad (Rule 535.155). | https://www.trec.texas.gov/sites/default/files/pdf-forms/TREC%20Advertisement%20Rule%20Review.pdf ; https://www.trec.texas.gov/what-required-information-must-be-provided-advertisements-such-signs-email-and-business-cards |
| Team names | Must be **registered with TREC by the broker before use** (Rule 535.154); must end in "Team" or "Group"; cannot include "brokerage", "company", "associates" or similar; "realty" allowed within limits (e.g., "John Doe Realty Group" ok, "John Doe Realty" not). | same + https://www.vaned.com/blog/TREC-recently-adopted-updated-advertising-rules |
| Assumed names/DBAs | Must be registered with TREC before advertising. | TREC FAQ |
| License number | Not required in every ad (confirm: TREC publishes an ad checklist for what's required in each media type). | TREC FAQ |
| Other | Texas also has the "Information About Brokerage Services" (IABS) notice for consumers; not an ad rule, but part of agent-consumer first contact — **verify applicability to landing pages**. | TREC site |

## 4. Other eight states — look-ups needed

| State | Regulator | What to check |
|---|---|---|
| **Florida** | Florida Real Estate Commission / DBPR | Brokerage name in all ads; specific rules for team names and trade names; requirements about including the **registered brokerage name** and often the licensee's name; "sales associate" vs "broker" disclosure; Fla. Admin. Code ch. 61J2-10 (advertising rule is in this chapter — **verify section**). Florida also has the FTSA mini-TCPA (see `tcpa-sms.md`). |
| **New York** | NY Department of State, Division of Licensing | Brokerage name in ads; "licensed real estate salesperson" vs broker disclosure; NYS fair housing notices; NYC has its own licensing/advertising overlays. NY requires the **Fair Housing Notice** and a **Standardized Operating Procedures** disclosure at first substantive contact — **verify applicability to digital ads and landing pages**. Also see NY consumer data law. |
| **Illinois** | IDFPR, Real Estate License Act of 2000 (225 ILCS 454) | Advertising must state the sponsoring broker's name; team-name rules; no misleading ads. **Verify the specific section on advertising and "team" advertising.** |
| **Georgia** | Georgia Real Estate Commission | Advertising rule in Georgia Real Estate Commission Rules (Chapter 520-1); brokerage name and "team" rules. **Verify rule number.** |
| **North Carolina** | NC Real Estate Commission | NC Administrative Code 21 NCAC 58A; advertising by broker-in-charge, team rules, "broker" disclosure. **Verify exact rule.** |
| **Arizona** | Arizona Department of Real Estate | A.R.S. Title 32 ch. 20 and Arizona Administrative Code Title 4 ch. 28 on advertising; brokerage name, "team" and trade-name rules. **Verify.** |
| **Washington** | DOL Real Estate Program | RCW 18.85 and WAC 308-124; name of firm in ads; team rules; extra fair-housing classes. **Verify.** |
| **New Jersey** | NJ Real Estate Commission | Advertising rules in N.J.A.C. 11:5 (broker name, team name, DBA, no implication that the agent is the broker); extra LAD classes and NJ privacy law (see privacy outline). **Verify.** |

For each of these eight: (1) ask the commission or counsel for the advertising rule number; (2) write down exactly what the ad block must show; (3) add a unit test that the generated email/landing/social text includes it.

## 5. Other state quirks that may affect AI-generated content

- **"Sold" and "Just Listed" posts:** generally need the listing broker's consent and brokerage attribution; some states restrict mention of price or ask for the seller's consent. **[verify per state]**
- **Testimonials/reviews:** FTC rule on fake reviews/testimonials (16 CFR Part 465, effective Oct 2024 — **verify**) and state rules; do not let the AI fabricate testimonials or "client success stories". See ToS acceptable-use.
- **AI disclosure laws:** some states require disclosure when AI generates certain consumer-facing content or chat (e.g., Utah's AI law, California's chatbot disclosure and new AI laws). Not researched in detail. **[ask counsel; track a state AI-law list]**
- **Video scripts / voice or likeness:** if AI voice or avatar is added later, state right-of-publicity and deepfake laws apply.
- **CMAs:** several states restrict agents from giving "appraisals" without an appraiser license; CMAs/BPOs are generally allowed but must be labeled not an appraisal. **[verify each state; see ToS outline]**

## 6. What the software MUST enforce

1. State-specific ad attribution block with required fields (broker name, license number where required, team name registered).
2. Block publishing until onboarding fields for the selected state are complete.
3. "Not an appraisal" label on every CMA.
4. No AI-fabricated testimonials, statistics, or awards.
