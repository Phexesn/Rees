# MLS / IDX Display Rules and Brokerage Attribution

> **Researched 2026-11-03 — not legal advice.** Attorney review required before launch. I could not fetch the NAR MLS Handbook itself; points come from search results and are marked **[verify]** where they matter. **Every MLS has its own rules** — they vary, and you must read the rules of each MLS a user is in.

## 1. Big picture for RealtyBoost

- RealtyBoost does **not** have MLS data unless a user pastes it in or we sign a data license. **MVP recommendation: agents paste/enter their own listing facts; RealtyBoost never ingests or redisplays MLS feeds.** This avoids IDX/RESO licensing, and it avoids most "participant display" rules.
- Even then, **ads the agent publishes** (social posts, emails, landing pages) are subject to (a) state advertising rules, (b) brokerage policy, and (c) MLS rules if the content contains MLS-sourced listing data. Pasting MLS data into a third-party tool can itself breach MLS terms. **[check MLS rules and ask each MLS if a vendor license is needed]**
- Only the **listing broker** may advertise a listing in many states without its consent; an agent promoting *another broker's* listing has extra attribution duties.

## 2. NAR MLS policy (what applies to IDX displays)

- **Policy Statement 7.58 (IDX)** — per search results, requires the participant's IDX display to **clearly identify the brokerage firm's name** in a reasonably prominent location, in a readable color and typeface not smaller than the median size of listing data (local MLS summary: https://www.stellarmls.com/compliancecorner/idx-edits). The IDX display must also comply with state law and MLS rules. **[verify exact text in current NAR MLS Handbook]**
- **Listing attribution (adopted Nov 2021, effective 2022):** IDX and VOW displays must show the **listing brokerage's name** and the **email or phone number provided by the listing broker** (the earlier proposal of listing-agent contact and "at least as prominent" language was dropped). Sources: https://www.inman.com/2021/11/15/national-association-of-realtors-passes-listing-attribution-policy/ ; https://www.inman.com/2021/11/15/listing-agents-dropped-from-nars-controversial-attribution-proposal/ ; https://d7.nar.realtor/sites/default/files/documents/2022_summary_of_mls_changes_2.22.22_changes.pdf
- **Policy 7.91 (VOW)** governs Virtual Office Websites (registration-gated displays). Registration and consumer-account rules differ from IDX. **[verify]**
- **Filtering/sorting:** per search summary, IDX/VOW policies restrict filtering by brokerage or agent name, though a participant may sort to show its own listings first.
- **Other typical MLS display rules (varies):** show listing office name on every listing; "courtesy of" lines; MLS copyright/disclaimer; refresh interval; no display of sold data to non-members in some MLSs; no display of listings that the seller opted out of display; must remove expired/withdrawn listings; limits on how many listings a non-logged-in user may see; do not alter data. **[each MLS differs; verify]**

## 3. Post-2024 NAR settlement rules that touch ads

- Since the **August 2024** practice changes from the NAR settlement (*Burnett/Sitzer* litigation — **verify case names and terms**): offers of buyer-broker compensation can no longer be published on MLS fields; participants must use written buyer agreements. Agents can still talk about compensation off-MLS, but statements in ads such as "buyer agents paid X%" are now disputed territory.
- **Product rule:** AI copy must not state or imply a commission amount or buyer-broker compensation unless the agent adds it deliberately, and WARN on any such text. **[ask counsel; also check local MLS rule]**
- Related: the NAR "Clear Cooperation Policy" (private-listing / pre-marketing rules) — whether to publicly advertise a listing before it is submitted to the MLS. Policy has been revised more than once; **[verify current version]**. **Product rule:** warn the agent before generating public ads for a listing marked "pre-market/coming soon/off-market", so they can check their MLS rule.

## 4. Brokerage name attribution — general principle

Almost every state requires licensees' ads to show the **responsible broker/brokerage name** and often disallow ads that look like the agent is the brokerage. See `state-disclosures.md` for the ten states researched. The software should:

1. Require at onboarding: agent legal name, license number(s) and state, brokerage legal name and any DBA registered with the state, brokerage address and phone.
2. Insert an attribution block on **every** generated artifact (emails, landing pages, social captions, video script on-screen end card, CMA PDF).
3. Prevent agents from editing away or shrinking the attribution (e.g., brokerage name at least as prominent as agent/team name where the state requires it).
4. Support a **team name** field that appears only if the broker has registered it where required.

## 5. Listing-photo and data issues (briefly)

- Photos: the copyright is usually the photographer's; MLS license terms often limit reuse. The ToS should make the agent responsible for rights. **[counsel]**
- AI-generated or AI-edited images (virtual staging) must be disclosed in many MLSs; deceptive staging can violate state license law. **[verify MLS and state rule]**
- Don't generate claims the agent can't verify (square footage, school assignment, flood zone, "no HOA"). Square footage and room counts should come from the agent's input, not AI inference.

## 6. What the software MUST enforce

1. Brokerage + license attribution block on every public-facing output (cannot be removed).
2. No MLS bulk ingestion in MVP; if added later, only under a signed data license and with each MLS's display rules coded as configuration.
3. Warn on commission/compensation language and "coming soon/pre-market" listings.
4. Equal Housing Opportunity statement included with ads (see `fair-housing.md`).

## 7. Questions for counsel

- Is pasting MLS data into an AI tool permitted under each target MLS's terms?
- Do we need MLS/IDX vendor licenses or RESO certification if we later add search/IDX pages?
- Who is "responsible" for compliance when RealtyBoost generates the ad but the agent publishes it?
