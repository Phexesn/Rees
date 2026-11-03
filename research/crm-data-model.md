# RealtyBoost: Real Estate CRM Data Model Research

**As of 2026-11-03.** Purpose: inform database and feature design for a US real-estate-agent SaaS (CRM + pipeline, lead capture, CMA assistant, AI marketing).

> **Research limits.** In this session, direct fetches of help.followupboss.com, reso.org, mlsgrid.com, trec.texas.gov and fcc.gov failed (DNS not resolvable from the session). All competitor and regulatory claims below come from **search-result snippets**, not from reading the primary page. Items are tagged:
> - **[snippet]** = seen in a search result snippet, not opened. Verify before relying on it.
> - **[unverified]** = conflicting or missing evidence, or no source found.
> - **[background]** = general domain knowledge, not checked in this session.
>
> Re-run the verification against the vendor help centers once those hosts are allowed.

---

## 1. Lead sources

| Source | Notes | Evidence |
|---|---|---|
| Zillow / Realtor.com / portal leads | Portal lead intake (Zillow, Realtor.com) is common. How each CRM ingests portal leads was **not found** in this session. | [unverified] |
| Facebook / Google / paid ads | Ad platforms → CRM via lead forms/webhooks. | [background] |
| Website / IDX lead capture | Standard in all platforms. | [background] |
| Referral / past client / SOI (sphere of influence) | No vendor-specific field found. Treat as a source value plus a relationship type. | [unverified] |
| Open house / sign call | Sign-in capture is common. Not confirmed per vendor. | [unverified] |
| Manually added | Agent picks source at creation. | [snippet] kvCORE: https://help.insiderealestate.com/en/articles/3322761-boldtrail-how-to-manually-add-a-new-contact |

**kvCORE / BoldTrail:** Source is recorded on the contact. There is a "standard" source and a "system" source (assigned automatically). Once a lead exists, the source generally can't be edited; you delete and re-add. **[snippet]** https://help.insiderealestate.com/en/articles/3330192-kvcore-lead-sources-in-kvcore

**Design implication:** Store `lead_source` as a controlled enum plus `lead_source_detail` (free text, e.g., campaign or listing address). Make it **immutable after creation, or keep history**. Competitors appear to lock it, and that is a known pain point for ROI reporting. Keep a `source_history` table if you allow edits.

---

## 2. Pipeline stages

Competitors use **two separate concepts**. Do not merge them.

| Concept | Purpose | Examples seen |
|---|---|---|
| **Lead / contact stage** (relationship status) | Who this person is to you right now, and when to follow up | Follow Up Boss: "Stages ... track who a contact is to you right now." **[snippet]** https://help.followupboss.com/hc/en-us/articles/15835401067159 |
| **Deal / transaction pipeline stage** | Lifecycle of a transaction | Follow Up Boss: "Each deal pipeline holds a series of stages that represent the lifetime of a deal from creation to close." **[snippet]** same URL |

**Competitor naming (all [snippet]):**

| Platform | Stage names seen |
|---|---|
| Follow Up Boss | Lead, Closed, Trash are system stages (renaming/deletion disallowed per a third-party guide). Custom stages allowed. **[unverified]** https://followupace.com/blog/follow-up-boss-deal-stages-naming-audit |
| Wise Agent | Example custom stages: New Lead, Attempted Contact, Active Buyer, Showing Homes, Long-Term Nurture; Under Contract mentioned. https://wiseagent.com/blog/lead-pipeline-in-wise-agent-a-smarter-way-to-manage-real-estate-leads |
| CINC | Has an "Under Contract" stage. Appointments are scheduled in-platform. https://www.cincpro.com/blog/the-ultimate-guide-to-managing-your-pipeline-in-the-cinc-platform |
| Lofty | Stages configurable per team. Common: New Lead, Contacted, Qualified, Under Contract, Closed. https://developer.lofty.com/concepts/leads |
| kvCORE / BoldTrail | Separate **lead types** (five types; a contact can have several) and **contact statuses** (pipeline position). https://intercom.help/kvcore/en/articles/9380473-kvcore-lead-types-overview |

**Your requested stages vs. competitors:**

| Your stage | Competitor equivalent | Status |
|---|---|---|
| Lead | New Lead / Lead | Common |
| Nurture | Long-Term Nurture (Wise Agent) | Common |
| Appointment set | "Appointment" (third-party funnels) | [unverified] for named vendor stage |
| Listing / buyer agreement signed | Not confirmed in vendor snippets | [unverified] |
| Under contract | Under Contract (CINC, Lofty, Wise Agent) | Common |
| Closed | Closed | Common |
| Past client | Usually a tag or type, not a stage (see §4) | [snippet] generic guides |
| Lost | Only a "won" checkbox per a third-party claim about Follow Up Boss | [unverified] |

**Recommended model:**
- `contact.relationship_stage` enum: `lead`, `contacted`, `appointment_set`, `nurture`, `active_client`, `past_client`, `lost`, `do_not_contact`.
- `deal.stage` enum (per deal, not per contact): `consult`, `agreement_signed`, `active_listing` / `active_search`, `under_contract`, `closed`, `lost`. Make pipeline stage names **configurable per brokerage team**, with system stages locked.
- `deal.outcome` (`won` / `lost` / `withdrawn`) and `deal.lost_reason` (required when lost). Lost reason is a reporting need no competitor snippet confirmed.
- Store stage transitions in an append-only `stage_history` table. Stage-based cadences and reporting depend on it.

---

## 3. Property-tied vs. contact-tied data

Core rule: **contacts are people, deals and properties are transactions.** A contact can be a buyer on one deal and a seller on another.

- `Contact` (person): name, emails, phones, addresses, consent, preferences, roles across deals.
- `Property` (address/listing): MLS number, address, beds, baths, sqft, lot, year built, status, list price, list date, owner contacts (many-to-many via roles).
- `Deal` (transaction): links one primary property (for sellers / listing side) or a set of search criteria (buyers), plus price, dates, commission, and `deal_participants`.
- `DealParticipant` (join): `deal_id`, `contact_id` or `external_party_id`, `role` (see §4), `is_primary`.

**Why this matters:** A seller's property stays linked to a deal even after the contact is marked past client. A buyer's search criteria belong to the deal, not the contact, so one contact can keep multiple buyer searches over time.

---

## 4. Role fields

Roles observed or implied in competitor UIs [snippet, generic]:

| Role | Type | Notes |
|---|---|---|
| Buyer | Deal role | Has buyer preference record |
| Seller | Deal role | Linked to listing property |
| Both (dual agency or repeat) | Derived | Do not store as a role; derive from deals |
| Investor | Contact type or tag | Often needs investment criteria (cap rate, cash flow) |
| Renter | Contact type | Usually lower-value, separate from sale |
| Cooperating agent | External party | Other brokerage's agent |
| Lender | External party | Pre-approval, loan officer |
| Title / escrow | External party | Opening order, closing |
| Inspector | External party | Vendor directory |

Recommend an `external_parties` directory shared across the brokerage (lender, title, inspector, cooperating agent) so one vendor record links to many deals.

---

## 5. Buyer preference fields

Typical fields [background, not per-vendor verified]:

- `price_min`, `price_max`
- `beds_min`, `baths_min`
- `areas`: list of zip codes, cities, neighborhoods, or polygons (store as normalized list, not free text)
- `property_types`: single-family, condo, townhome, multi-family, land
- `must_haves` (free text plus tag list, e.g., pool, garage, single-story)
- `timeline` (target move date, urgency)
- `pre_approval_status`: none / in progress / approved; `pre_approval_amount`; `pre_approval_expires_at`
- `lender_contact_id` (link to external party)
- `financing_type`: conventional / FHA / VA / cash

---

## 6. Compliance fields

| Field | Level | Notes | Status |
|---|---|---|---|
| Agent license number | User (agent) | Per state | [background] |
| License state | User | Multi-state agents need a list | [background] |
| Brokerage name | Organization | | [background] |
| Brokerage license number | Organization | Per state | [background] |
| MLS ID / MLS membership | User + Organization | Per MLS | [background] |
| Board/association membership | User | Needed for MLS attribution | [background] |

The Texas and Oregon CMA/BPO disclosure rules (see the CMA file) also imply that **the agent's license number and brokerage must appear on any generated CMA**. Store these on user and org records and render them in templates.

---

## 7. Communication, consent, do-not-contact

### 7.1 Communication log (`activity`)

Fields: `id`, `contact_id`, `deal_id` (nullable), `type` (call, sms, email, meeting, note, showing, mailer), `direction` (inbound/outbound), `channel_id` / `from`, `to`, `subject`, `body_ref`, `occurred_at`, `duration_sec`, `outcome`, `created_by_user_id`, `source_system` (email sync, dialer, manual).

### 7.2 Consent (`consent_record`), TCPA-oriented

Store **one row per consent event**, not a boolean on the contact:

- `contact_id`, `channel` (`sms`, `email`, `call`), `consent_type` (`marketing`, `informational`), `status` (`granted`, `revoked`)
- `granted_at`, `source` (web form URL, verbal, signed agreement, keyword reply), `evidence_ref` (stored form payload or screenshot), `disclosure_text_version`
- `revoked_at`, `revocation_method` (STOP keyword, phone, email, other)

**Legal context (from snippets, [unverified] on current status):**
- Telemarketing texts require **prior express written consent**; informational texts may use oral or written consent. **[snippet]** https://nar.realtor/node/171240 and https://oregonrealtors.org/?p=32902
- The FCC's consent amendments (year and scope per [background], not verified here) were reported as **struck down by the Eleventh Circuit** by one source and as only partially affected by another. **[unverified]** https://www.housingwire.com/articles/tcpa-modifications-set-for-today-struck-down-by-appeals-court/ ; https://help.agentlegend.com/what-is-1-to-1-consent
- Revocation timing (e.g., "honor within 10 business days") and effective dates are inconsistent across sources. **[unverified]** Do not hard-code until counsel confirms. Regulation reference: 47 C.F.R. §64.1200 **[background]**.
- Penalty range cited in snippets: $500–$1,500 per violation. **[background]** statute 47 U.S.C. §227.

**Design implication:** Log consent evidence, and make revocation processing global (one revocation blocks all sends on that channel). Keep the disclosure text versioned.

### 7.3 Do-not-contact (`dnc`)

- Per-contact and per-channel flags, separate from consent: `do_not_call` (national DNC registry check), `do_not_text`, `do_not_email`.
- Maintain `dnc_checked_at` and `dnc_source` (e.g., federal registry, state list, internal request).
- Block sends at the service layer, not only in UI.

---

## 8. Tags, smart lists, saved views, cadences

- **Tags:** many-to-many, `tag_id`, scoped to a team or user. Examples: `past-client`, `investor`, `hot-lead`, `sphere`. Tags are cheap and frequently used for segmentation.
- **Smart lists / saved views:** saved filter definitions over contacts, deals, or tasks. Store the filter as JSON (`filter_json`), owner, and shared flag. Competitors and generic CRMs both use this pattern **[background]**.
- **Action plans / cadences:** Competitors (CINC, Follow Up Boss, Lofty, kvCORE) use automated follow-up sequences. Model as:
  - `cadence` (template): name, trigger (stage change, tag added, manual), owner
  - `cadence_step`: order, delay, action type (task, email, sms-with-consent-check, call reminder)
  - `cadence_enrollment`: contact, cadence, current step, status (active, paused, completed, exited)
  - Exit on stage change, reply, or DNC. Check consent for every SMS step.

Vendor-specific automation names were **not verified** in this session. Mark as [unverified].

---

## 9. Proposed entity list

| Entity | Key fields | Relations |
|---|---|---|
| **Organization** (brokerage/team) | id, name, brokerage_license_no, state, plan | has many Users, Pipelines, Tags |
| **User** (agent) | id, org_id, name, email, license_no, license_state, mls_ids[], role | belongs to Organization |
| **Contact** | id, org_id, first_name, last_name, relationship_stage, lead_source, lead_source_detail, owner_user_id, created_at, do_not_contact flags | has many Phones, Emails, Addresses, Roles (via DealParticipant), Consents, Activities, Tags |
| **Deal** | id, org_id, type (buy/sell/lease), stage, outcome, lost_reason, price, close_date, commission, owner_user_id | has many DealParticipants, Tasks, Notes, Documents; belongs to Property (sell) and/or BuyerPreference (buy) |
| **DealParticipant** | deal_id, contact_id or external_party_id, role, is_primary | join table |
| **ExternalParty** | id, org_id, type (lender, title, inspector, cooperating_agent), name, company, license_no | shared across deals |
| **Property** | id, address (normalized), zip, mls_number, mls_source, beds, baths, sqft, lot_sqft, year_built, property_type, list_price, status, raw_listing_json | many-to-many Deals; owned via DealParticipant |
| **BuyerPreference** | id, deal_id, price_min/max, beds_min, baths_min, areas[], property_types[], must_haves[], timeline, pre_approval fields, lender_id | belongs to Deal |
| **Pipeline** | id, org_id, name, type (lead or deal) | has many PipelineStages |
| **PipelineStage** | id, pipeline_id, name, order, is_system, is_closed_state | |
| **StageHistory** | id, entity_type, entity_id, from_stage, to_stage, changed_at, changed_by | append-only |
| **Task** | id, owner_user_id, contact_id?, deal_id?, due_at, type, status, cadence_step_id? | |
| **Note** | id, author_id, contact_id?, deal_id?, body, created_at | |
| **Activity** | id, contact_id, deal_id?, type, direction, occurred_at, duration_sec, outcome, source_system | |
| **ConsentRecord** | id, contact_id, channel, consent_type, status, granted_at, revoked_at, source, evidence_ref, disclosure_version | |
| **Tag** | id, org_id, name, color, scope | join: ContactTag, DealTag |
| **SavedView** | id, owner_user_id, entity_type, filter_json, shared, name | |
| **Cadence** | id, org_id, name, trigger, status | has many CadenceSteps |
| **CadenceEnrollment** | id, cadence_id, contact_id, current_step, status | |
| **Document** | id, deal_id, type, storage_ref, signed_at, esign_provider_ref | |
| **LeadSourceEvent** | id, contact_id, source, detail, received_at, raw_payload_ref | immutable; supports ROI reporting |

**Key modeling calls:**
1. Keep `Contact` separate from `Deal`. Roles live on the join table.
2. Store consent as events, not booleans.
3. Keep `StageHistory` and `LeadSourceEvent` append-only. Reporting depends on them.
4. Put `Property` in a shared table. MLS listing imports and manual properties both link to it (see the MLS file).

---

## 10. Open gaps

- How Zillow, Realtor.com, and open-house capture flow into each competitor's CRM: **not found**.
- Exact stage names for Follow Up Boss, CINC, and Lofty defaults: **only partially confirmed** (snippets and third-party sites).
- Whether Follow Up Boss has a "lost" stage or only a "won" checkbox: **conflicting** (third-party claim only).
- Current TCPA consent and revocation rules after the 2025–2026 litigation: **conflicting**. Get counsel review.

## Sources (all seen in search results; primary pages not opened)

- https://help.followupboss.com/hc/en-us/articles/15835401067159
- https://help.followupboss.com/hc/en-us/articles/360012456793-Changing-a-Lead-Stage
- https://followupace.com/blog/follow-up-boss-deal-stages-naming-audit (third-party)
- https://help.insiderealestate.com/en/articles/3330192-kvcore-lead-sources-in-kvcore
- https://help.insiderealestate.com/en/articles/3322761-boldtrail-how-to-manually-add-a-new-contact
- https://intercom.help/kvcore/en/articles/9380473-kvcore-lead-types-overview
- https://wiseagent.com/blog/lead-pipeline-in-wise-agent-a-smarter-way-to-manage-real-estate-leads
- https://www.cincpro.com/blog/the-ultimate-guide-to-managing-your-pipeline-in-the-cinc-platform
- https://developer.lofty.com/concepts/leads
- https://nar.realtor/node/171240
- https://oregonrealtors.org/?p=32902
- https://www.housingwire.com/articles/tcpa-modifications-set-for-today-struck-down-by-appeals-court/
- https://help.agentlegend.com/what-is-1-to-1-consent (third-party)
