# RealtyBoost: MLS Data Integration Research

**As of 2026-11-03.** Purpose: map the path to importing MLS listing data. **Nothing has been signed.** This is a planning document only.

> **Research limits.** Direct fetches of reso.org, mlsgrid.com and the other primary sites failed (DNS not resolvable in this session). Claims below come from **search-result snippets** unless marked. Tags:
> - **[snippet]** seen in a search result, not opened
> - **[unverified]** conflicting, secondary-only, or no source found
> - **[background]** general domain knowledge, not checked here
>
> Pricing, approval steps, and display rules differ by MLS. Confirm each in writing with the target MLS before any commitment.

---

## 1. Standards: RETS vs. RESO Web API

| Item | RETS | RESO Web API |
|---|---|---|
| Status | **Deprecated.** RESO describes RETS as deprecated and replaced by the Web API. [snippet] https://www.reso.org/?p=26916 | Current standard. Built on OData, with OAuth 2.0 auth per one vendor blog [snippet] |
| Retirement timing | Conflicting. One vendor claims RESO ended RETS support in June 2018 [snippet]. RESO's own transition page is titled "Timelines for MLSs Transitioning 100% to RESO Web API and Sunsetting RETS" [snippet] https://reso.org/?p=18407. Per-MLS dates were not readable. | |
| Coverage (per RESO tracker, as reported in snippet) | At least 90% of MLSs reported to have RESO-certified Web API services. About 49.6% of US subscribers on converted feeds, and another 69.3% on feeds committed to convert [snippet] | |
| Auth | Username/password (per vendor) | OAuth 2.0 [snippet, unverified] |

**Implication for RealtyBoost:** Build only against the **RESO Web API**. Assume any RETS-only MLS is a legacy exception and check for it during MLS onboarding. Do not start new work on RETS.

**RESO Data Dictionary:** Defines standard field names and lookup values for the Web API. Version details (1.7, 2.0) were **not confirmed** in this session. Use it as the canonical schema reference. [unverified version] See https://www.reso.org/api-guide/ (snippet only).

**Mapping advice:** Map MLS fields to the RESO Data Dictionary first, and treat local MLS fields as extensions. Keep the raw payload (`raw_listing_json`) so fields can be remapped later.

---

## 2. Aggregators and vendors

| Vendor | What it does | Pricing (as seen) | Source |
|---|---|---|---|
| **MLS Grid** | Aggregator providing a unified API across many MLSs. Uses API Version 2 for new consumers. Collects per-MLS license fees on participants' behalf, so the developer pays the fee each MLS charges. Requires signing the MLS Grid Master Data License Agreement. | No universal price. Per-MLS fees apply. Canopy MLS example: $500 setup plus $100/mo for standard feeds. Canopy non-participant license: $1,000 setup and $1,200/quarter, requires board approval. | https://mlsgrid.com/s/MLS-GRID-Data-License-Agreement.pdf ; https://go.canopymls.com/data [snippet] |
| **Bridge Interactive (Zillow Group)** | Data services and back-end connectivity. Vendors are billed through Bridge or Trestle for data access; pricing is set by the MLS and vendor. | Not public in snippets | https://us.fitgap.com/products/029538/bridge-interactive (third-party) ; https://www.rirealtors.org/idx-products |
| **Trestle (CoreLogic / Cotality)** | Unified feed across 100+ MLSs per snippet. Rates vary by MLS. | One Miami listing shows $30/mo (own data), $100/mo (MLS-wide, brokers), $85/mo per feed (vendors). Treat as **example only**. | https://www.miamirealtors.com/mls/webapi/pricing/ [snippet] |
| **Spark API (FBS Data)** | API access per MLS. | $50/mo per MLS (flat). Multiple keys for one MLS = one charge. Only published flat rate found. | https://www.sparkplatform.com/docs/overview/api_vs_rets ; https://www.sparkplatform.com/docs/overview/which_api [snippet] |
| **Realtyna** | Not researched in this session | Unknown | **[unverified]** |
| **SimplyRETS** | Developer API and WordPress plugin, converts RETS or RESO Web API data to JSON. Per a third-party listing, offers no free live-data trial. | No price found | https://www.parse.gl/brands/simplyrets-com (third-party) **[unverified]** |

**Notes:**
- Pricing from snippets is **examples, not quotes**. Vendor and MLS-specific pricing needs confirmation.
- Some MLSs provide direct RESO feeds without an aggregator. Check each target market.
- Aggregators take on per-MLS agreement management, but each MLS still has its own rules and approval. [background]

---

## 3. Per-MLS licensing

### Feed types (typical categories [background])

| Feed type | Who it serves | Typical use | Notes |
|---|---|---|---|
| **IDX** | Public website display for consumers | Search and display listings on a broker website | Strictest display rules (see §4) |
| **VOW** | Logged-in consumers | Extra fields (e.g., estimates, comments), user accounts | Requires more approvals and consumer-facing terms |
| **Back-office / broker** | Brokerage internal use | CRM, CMA, internal tools | Usually not public display; CMA output may qualify. **Confirm with each MLS** |
| **Vendor / developer** | Software vendors | Build tools that use feeds for members | Requires vendor agreement and often sponsorship |

**RealtyBoost likely needs:** Back-office or broker access for CRM and CMA. Use IDX/VOW only if a public or consumer-facing display is built. Confirm whether AI-generated CMAs and marketing count as back-office use in each MLS.

### Onboarding steps seen in snippets [snippet]

1. Register with the aggregator or MLS. The aggregator verifies the application and provides pricing.
2. Sign the vendor/technology agreement (e.g., MLS Grid Master Data License Agreement). The MLS approves last, after the participant and subscriber sign.
3. Add payment information.
4. Begin API use (MLS Grid: API Version 2).

### Broker sponsorship
Some MLSs require a participating brokerage to sponsor the data consumer or to sign off on usage. **[unverified]** requirement in general; confirm per MLS. Canopy's non-participant license requires board approval (snippet).

### Approval timeline and cost
- Per-MLS approval timeline: **not found** in this session. Expect weeks to months. **[unverified]**
- Per-MLS fees: examples above. Each MLS sets its own.

---

## 4. IDX display rules (apply to any display)

Rules are set locally by each MLS or board. The points below are common patterns seen in multiple rulebooks.

| Requirement | Pattern seen | Source |
|---|---|---|
| Refresh frequency | NAR benchmark: refresh at least every **12 hours**. Some boards allow up to 3 days (Lubbock). MLS Now requires at least daily. | https://www.nar.realtor/node/165020 ; https://support.mlsnow.com/hc/en-us/articles/47636914764059-MLS-Now-Rules-Section-9-IDX-VOW-Digital-Display-Policy [snippet] |
| Brokerage attribution | Brokerage name and/or logo visible "above the fold" (RMLS). Some boards require "Listed by" rather than "Presented by" (San Diego). Font size and color limits (CRMLS). | https://www.rmlsweb.com/v2/public2/loadfile.asp?id=16322 ; https://sdmls.com/data-access/requirements.html ; https://kb.crmls.org/?p=5372 [snippet] |
| MLS logo | Required on each sourced listing in some boards (RMLS). Separate logo for listings not held by the agent (Rhode Island). | https://www.rirealtors.org/idx-logos-disclaimers [snippet] |
| Disclaimer | Almost all MLSs require "deemed reliable but not guaranteed" language. Some require exact wording. Rhode Island allows own wording if objectives are met. | https://www.rirealtors.org/idx-logos-disclaimers ; https://www.maar.org/clientuploads/mls/idx/IDX_Rules_26.pdf [snippet] |
| Data display scope | Varies. Some MLSs limit certain fields (e.g., sold price, private remarks) in IDX | **[unverified]** general |

**Design implication:**
- Build a **per-MLS display config** (refresh interval, required attribution text, logo asset, disclaimer text, field allow-list).
- Refresh jobs must run at the strictest interval for the MLS (default: every 12 hours or faster).
- Keep MLS data separate from user-entered data in the database. Track `mls_source`, `fetched_at`, and `expires_at` on every listing row. Purge data that the MLS rules say must be removed.

---

## 5. Recommended path for a small startup

**Phase 0 (now): no contracts.**
- Choose 1–2 target MLSs or metro areas for launch.
- Confirm each MLS's data-use policy for CRM and CMA (back-office), and whether AI-generated outputs are allowed.
- Ask each MLS for its current vendor, feed, and fee schedule in writing.

**Phase 1: aggregator first.**
- Use **MLS Grid** or **Trestle** as the first aggregator. Both cover many MLSs under one contract (MLS Grid: multiple MLSs via one API, per its pitch). Verify coverage for your target markets. Spark is a candidate for specific markets.
- Start with **back-office** access. Add IDX/VOW later only if a public display is needed.
- Avoid building against RETS. Use RESO Web API only.

**Phase 2: onboarding.**
- Sign the aggregator's developer agreement and each MLS's participant/subscriber agreements, after legal review. Plan for sponsorship if required.
- Use a sandbox or test feed where available.

**Phase 3: cost planning (rough, with [unverified] flags).**
- Per-MLS fees and aggregator fees (examples: $85–$100/mo per feed/MLS, $500 setup in one MLS): low hundreds to low thousands per month across a few MLSs. **Confirm actual costs with each vendor.**
- Approval timeline: **unknown**. Plan for multi-week to multi-month timelines. [unverified]

**Engineering decisions to make now:**
1. Store listings in a shared `Property` table with `mls_source`, `mls_number`, `raw_listing_json`, `fetched_at`.
2. Implement RESO Data Dictionary field mapping with per-MLS overrides.
3. Build a refresh scheduler with per-MLS intervals (default 12h).
4. Build a display layer that enforces per-MLS attribution and disclaimers.
5. Keep CMA comp data tagged with MLS source and pull date (see CMA file).

---

## 6. Open questions

1. Which MLSs or metros will RealtyBoost launch in? (Drives aggregator choice.)
2. Does each target MLS treat AI-generated CMAs and marketing as back-office or display? (Drives feed type.)
3. Does each target MLS require broker sponsorship? (Needs a partner brokerage.)
4. Can RealtyBoost show Zillow/Realtor.com listing data? (Not researched in this session. Realtor.com and Zillow feed cutover dates were not found.)
5. Realtyna and SimplyRETS pricing and terms: not confirmed.

---

## Sources

- https://www.reso.org/?p=26916 (snippet)
- https://reso.org/?p=18407 (snippet)
- https://www.reso.org/api-guide/ (snippet)
- https://www.inman.com/2021/10/29/what-is-rets-the-zombie-data-standard-that-mlss-need-to-end/ (snippet)
- https://mlsgrid.com/s/MLS-GRID-Data-License-Agreement.pdf (snippet)
- https://go.canopymls.com/data (snippet)
- https://www.miamirealtors.com/mls/webapi/pricing/ (snippet)
- https://www.sparkplatform.com/docs/overview/api_vs_rets (snippet)
- https://www.sparkplatform.com/docs/overview/which_api (snippet)
- https://us.fitgap.com/products/029538/bridge-interactive (third-party)
- https://www.rirealtors.org/idx-products (snippet)
- https://www.nar.realtor/node/165020 (snippet)
- https://support.mlsnow.com/hc/en-us/articles/47636914764059-MLS-Now-Rules-Section-9-IDX-VOW-Digital-Display-Policy (snippet)
- https://www.rmlsweb.com/v2/public2/loadfile.asp?id=16322 (snippet)
- https://sdmls.com/data-access/requirements.html (snippet)
- https://kb.crmls.org/?p=5372 (snippet)
- https://www.rirealtors.org/idx-logos-disclaimers (snippet)
- https://www.maar.org/clientuploads/mls/idx/IDX_Rules_26.pdf (snippet)
- https://www.parse.gl/brands/simplyrets-com (third-party, unverified)
