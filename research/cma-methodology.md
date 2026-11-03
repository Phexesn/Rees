# RealtyBoost: CMA Methodology Research

**As of 2026-11-03.** Scope: Comparative Market Analysis (CMA) for licensed real estate agents, not appraisals. RealtyBoost users are agents, not licensed appraisers.

> **Research limits.** Direct fetches of trec.texas.gov, fcc.gov and other primary sites failed (DNS not resolvable in this session). Claims below come from **search-result snippets** unless marked otherwise. Tags:
> - **[snippet]** seen in a search result, not opened
> - **[unverified]** conflicting, secondary-only, or no source found
> - **[background]** general domain knowledge, not checked in this session
>
> **This document is not legal advice.** Attorney review is required before any disclaimer or product claim goes live.

---

## 1. What a CMA is (and is not)

- A CMA is a **pricing analysis** prepared by a licensee using comparable sales, listings, and market trends, to advise a client on list price or offer strategy. **[snippet]** https://www.opendoor.com/articles/comparative-market-analysis (consumer-facing; directional only)
- A **BPO (Broker Price Opinion)** is a related document, often for lenders or asset managers. State rules differ on whether a BPO is allowed, who may prepare it, and required wording. **[snippet]** https://www.oregon.gov/rea/newsroom/Pages/2026_OREN-J/CMA-and-BPO-Requirements.aspx
- An **appraisal** is performed by a state-licensed or certified appraiser under USPAP for a defined purpose. Federally related transactions require a licensed or certified appraiser. **[snippet]** https://www.realtytexas.com/blog/10418/what-is-a-bpo-or-cma-under-texas-law.html ; https://floridarealtors.org/law-ethics/library/Appraisals

**Product rule:** RealtyBoost output is a **CMA** or **pricing guidance**. It must never be labeled an appraisal, never state a "market value" or "appraised value" as a determination, and never be used as a lender valuation.

---

## 2. Comparable (comp) selection

Common agent criteria [background, consistent across snippets]:

| Criterion | Typical guidance | Notes |
|---|---|---|
| Distance | Same subdivision or neighborhood first; expand radius only if needed. Radius varies by density (e.g., 0.5 mi urban, 1–3 mi suburban, more in rural) | Radius values are **[unverified]** rules of thumb |
| Recency (sale date) | Most recent sales, usually within 3–6 months; older sales need time adjustment | Window is market-dependent [unverified] |
| Size (GLA) | Often within ±10–20% of subject sqft | [unverified] |
| Property type | Same type (SFR vs. condo vs. townhome) | Strong consensus |
| Bed / bath count | Same or ±1 bed; adjust for differences | |
| Condition | Similar condition; flag renovated vs. original | Condition is subjective; document it |
| Age / style | Similar vintage and architectural style | |
| Lot size | Similar, or adjust | |
| Subdivision / HOA | Same subdivision preferred | |
| Status | Use **sold** comps as primary evidence; **active** and **pending** as market signals only | Standard practice |

**Number of comps:** Commonly 3–6 sold comps, plus 1–3 active and 1–2 expired/withdrawn for context. **[snippet, generic]** https://www.housecanary.com/blog/how-to-do-a-cma — exact counts vary by market and brokerage policy [unverified].

---

## 3. Adjustment approaches

Two common methods:
1. **Dollar-value adjustment**: adjust each comp's sold price by the value difference in each feature.
2. **Percentage adjustment**: adjust by a percentage of sale price.

Agents usually use dollar-value adjustments. Subject-to-comp direction: if the comp has a feature the subject lacks, subtract from the comp price. If the subject has more, add.

### Rule-of-thumb ranges seen in marketing content (all **[unverified]**)

These come from brokerage and marketing blogs. They conflict across sources and are not authoritative. **Derive adjustments from paired sales in the target market.** Do not hard-code these into the product as defaults.

| Feature | Ranges seen in sources | Notes |
|---|---|---|
| Size (price per sq ft) | Roughly $40–$120/sq ft, market dependent | Per-sqft is a cross-check, not the sole method |
| Additional bathroom | $3K–$20K, varies widely | |
| Garage (per bay or per stall) | $5K–$25K per bay; ~$15K–$40K for garage vs. none | |
| Pool | $10K–$50K; may be negative in cold markets | |
| Condition / renovation | Market-specific; often a % or a tiered scale | No consistent source |
| Age | Often tied to renovation or condition | |

**Source examples:** https://www.opendoor.com/articles/comparative-market-analysis ; https://www.housecanary.com/blog/how-to-do-a-cma

### Implementation guidance
- Store adjustment rules **per market** (zip or MLS area) and **per agent**, with the source of each value (agent override, paired-sales derived, default). Mark defaults as placeholders.
- Show the adjustment table to the agent. Never auto-apply an adjustment without an agent-visible line item.
- Time adjustments (market trend) are a separate line item.

---

## 4. Producing a list-price range

A CMA should output a **range**, not a single "value."

Typical method [background]:
1. Compute the adjusted sale price for each sold comp.
2. Weight comps (closest, most recent, most similar get higher weight).
3. Take the low, median or weighted-mid, and high of adjusted values.
4. Apply market trend adjustment, if any.
5. Check against active and pending listings (competition) and expired listings (overpricing signal).
6. Present a **suggested list-price range** (e.g., low, target, high) with the reasoning, and leave the final price to the agent and seller.

**Output template fields:** `subject_property`, `comps[]` (with adjustments), `range_low`, `range_target`, `range_high`, `market_trend_note`, `assumptions`, `data_as_of`, `disclaimer_id`.

**Language rule:** Use "suggested price range" and "comparable sales support a range of..." Do **not** use "market value," "appraised value," "worth," or "the home is valued at."

---

## 5. Where an AI assistant can help vs. where it must stop

| AI can help with | AI must not do |
|---|---|
| Gather comp data from MLS feeds or public records (with source tags) | Assign a market value or appraised value |
| Filter and sort comps by the agent's criteria | Pick the final list price or set the agent's recommendation |
| Format the comp grid and adjustment table | Make adjustments the agent has not reviewed or approved |
| Draft narrative explaining adjustments in plain language (agent edits and approves) | Claim the output is an appraisal or USPAP-compliant |
| Explain how an adjustment was calculated | Invent sales, listings, or dates (every number must cite its source record) |
| Flag missing data, stale data, or outliers | Substitute for the agent's judgment on condition, or inspect a property |
| Draft the disclaimer block for attorney review | Silently remove or alter disclaimers |

**Required product controls:** Source citation on each comp (MLS number or public record ID and date pulled). Visible "Agent-reviewed" step before export. Disclaimer always rendered. Audit log of who edited the adjustments.

---

## 6. Legal distinction: CMA / BPO vs. appraisal

- **USPAP** governs how appraisals are performed. State law governs who may perform them. **[snippet]** https://www.realtytexas.com/blog/10418/what-is-a-bpo-or-cma-under-texas-law.html and https://www.oregon.gov/rea/newsroom/Pages/2026_OREN-J/CMA-and-BPO-Requirements.aspx
- **Federally related** transactions (most mortgage-backed sales) require appraisals by a state-licensed or certified appraiser. **[background]**
- CMAs and BPOs prepared by licensees are generally outside USPAP, but states differ on wording and disclosure. **[snippet]** Several state documents below.

### State-specific items seen (all [snippet], verify with state agency)

| State | Item seen | Source |
|---|---|---|
| Texas | TREC rule (cited as §535.17 in snippets) requires specific disclaimer language on BPOs and CMAs. The wording was **not retrieved**. Texas BPO guidance also relates to who may prepare one. | https://www.trec.texas.gov/sites/default/files/AdvisorApril2015.pdf ; https://www.realtytexas.com/blog/10418/what-is-a-bpo-or-cma-under-texas-law.html |
| Idaho | Required disclaimer says the BPO is not intended to meet USPAP standards | https://dopl.idaho.gov/wp-content/uploads/2023/11/REC-Guideline-20-rev-7.11.pdf |
| Virginia | An evaluation that is not an appraisal must say it was not performed under USPAP | [unverified] source not located in this session |
| Pennsylvania | CMA must have a conspicuous first-page statement that it was not an appraisal under state law | [unverified] |
| Oregon | Agency page on CMA and BPO requirements (2026 newsroom item) | https://www.oregon.gov/rea/newsroom/Pages/2026_OREN-J/CMA-and-BPO-Requirements.aspx |
| Florida | Florida Realtors guidance: non-appraisers must not call work an appraisal | https://floridarealtors.org/law-ethics/library/Appraisals |
| New Jersey | Regulator guidance states non-licensed BPO preparers may be engaged in unlicensed appraisal practice | https://nj.gov/dobi/bulletins/blt13_05.pdf |
| New York | CMAs reportedly do not count toward appraiser experience credit | [unverified] |

**Action:** Build a state rules table with the exact text from each state's agency. Launch only in states where counsel signs off. The snippets point to state-by-state variation, so a single national disclaimer is not sufficient.

---

## 7. DRAFT disclaimer language

> **DRAFT FOR ATTORNEY REVIEW. NOT APPROVED FOR USE.**
> This draft is an AI-assisted starting point. It is not legal advice and has not been reviewed by counsel. All state-specific wording must be replaced with the exact text required by the agent's state real estate commission, and the agent's brokerage must approve it.

### Draft A: standard CMA footer

> **Comparative Market Analysis. Not an Appraisal.**
> This Comparative Market Analysis ("CMA") was prepared by [Agent Name], licensed real estate [salesperson/broker] in [State], License No. [###], with [Brokerage Name], License No. [###]. It is based on information from [MLS / public records / other sources] as of [date], which the preparer believes to be reliable but has not independently verified. It is not an appraisal, is not prepared in accordance with the Uniform Standards of Professional Appraisal Practice (USPAP), and is not a valuation of the property for lending, tax, or any other purpose. It does not state or imply a market value or appraised value. It reflects the preparer's opinion of a suggested price range based on the comparable properties listed. Pricing decisions are the responsibility of the seller and listing agent. Any buyer, seller, lender, or other party should obtain a licensed or certified appraiser's opinion where one is needed.
>
> **[ATTORNEY REVIEW: confirm required state wording; confirm "not USPAP" statement; confirm "deemed reliable" standard; confirm MLS data-use disclaimer wording.]**

### Draft B: AI-assistance disclosure

> **[DRAFT FOR ATTORNEY REVIEW]** Portions of this document, including narrative text and formatting, were drafted with the assistance of software and reviewed by the licensee named above before delivery. The licensee is responsible for the content, data, and price opinion in this document.

### Draft C: short-form (for in-app preview only)

> **Not an appraisal. Suggested price range only. Prepared by a licensee. See full disclaimer.** **[ATTORNEY REVIEW]**

---

## 8. Open questions for counsel

1. Which states will RealtyBoost support at launch? Each needs its own wording.
2. Will the product ever produce a **BPO** (e.g., for lenders)? If so, state licensing and BPO rules apply.
3. Is a "suggested price range" wording acceptable in each target state, or does it need different phrasing?
4. MLS data-use and display rules for CMA outputs (see MLS file).
5. Liability for AI-drafted content and for errors in pulled comp data.

---

## Sources

- https://www.opendoor.com/articles/comparative-market-analysis
- https://www.housecanary.com/blog/how-to-do-a-cma
- https://www.oregon.gov/rea/newsroom/Pages/2026_OREN-J/CMA-and-BPO-Requirements.aspx
- https://www.realtytexas.com/blog/10418/what-is-a-bpo-or-cma-under-texas-law.html
- https://www.trec.texas.gov/sites/default/files/AdvisorApril2015.pdf (snippet only; not opened)
- https://dopl.idaho.gov/wp-content/uploads/2023/11/REC-Guideline-20-rev-7.11.pdf
- https://floridarealtors.org/law-ethics/library/Appraisals
- https://nj.gov/dobi/bulletins/blt13_05.pdf
