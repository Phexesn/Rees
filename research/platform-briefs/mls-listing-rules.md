# MLS Listing Remarks: Format and Compliance Rules

As of 2026-11-03. **Status: limits are mostly UNVERIFIED.** Official MLS rulebooks (MLS Grid, CRMLS, Bright, Stellar, Northstar) could not be fetched from this environment (DNS failures for devdocs.crmls.org, northstarmls.com, kb.crmls.org, ddwiki.reso.org). Figures below come from search snippets or vendor blogs and are tagged.

Tags: **[S]** = stated in a search snippet from the named source (not a full page read). **[U]** = unverified, commonly cited by vendors. Before shipping any character limit into a prompt, confirm it with the MLS's own rules or compliance desk.

## Limits by MLS (do not hard-code without verification)

| MLS | Public remarks limit | Private/agent remarks limit | Source / status |
|---|---|---|---|
| MLS Grid | Not found | Not found | Aggregator; the limit is the feeding MLS's. [U] |
| CRMLS (California) | Not confirmed | Not confirmed | No numeric limit found. Rule-based restrictions below are [S]. |
| Bright MLS (Mid-Atlantic) | 4,000 [U] | 1,000 [U] | Vendor blog only: listingai-nine.vercel.app/blog/mls-character-limits-complete-guide. Conflicting: Beycome cites 1,960 (unlabeled). |
| Stellar MLS (Florida) | 2,000 [U] (one blog) | 1,000 [U] | Conflicting: another source says 1,200 for "listing remarks". Verify. |
| NorthstarMLS (MN/WI) | Not found | Not found; closest field is "Agent Remarks" [S] | Rules@northstarmls.com for compliance checks [S]. |

**Recommendation for prompt writers:** until verified, cap public remarks at **1,000 characters** and private remarks at **500**. Both are conservative picks, not MLS requirements. Build the MLS-specific limit as a config value per board.

## Content rules (highest-value part of this brief)

**CRMLS** [S]
- Public remarks may describe only the property's description, features and condition (and related amenities) (search snippet from CRMLS compliance material, blog.crmls.org/compliance/trending-topics-compliance-september-2022/ and kb.crmls.org).
- Barred in public remarks: contact information, external links of any kind, showing instructions, open house details.
- Agent contact info (phone, email, website) belongs in **Syndication Remarks**.
- Violations of Rule 12.5 (misuse of public remarks) get a **warning before a citation** (June 2023 update).

**NorthstarMLS** [S] (northstarmls.com insight article, snippet only)
- Public remarks describe the physical property and its vicinity.
- No open-house details, contact information or third-party promotions in public remarks. Open-house info goes in its designated fields.
- No commission or compensation language in Agent Remarks.
- Financial remarks are not visible to the public.

**RESO standard** [S] (ddwiki.reso.org PrivateRemarks field, snippet)
- Private remarks may hold security or proprietary information and must be restricted from public view. Never put private-remarks content into public remarks, syndication or portal feeds.

**General** [S] (one MLS rules excerpt)
- Public remarks should relate only to marketing, description and condition of the property.

## Fair Housing (applies to all remarks and to all listing copy)

- Governing rule: HUD advertising regulations, 24 C.F.R. Part 109 [S] (search snippets citing hud.gov/sites/documents/DOC_7784.PDF and gme-0008lops.pdf; full text not read).
- Words HUD lists as signaling familial status: "adults", "children", "singles", "mature persons", "adult building" [S].
- Religion example listed as off-limits: "Jewish home" [S].
- Describe the property, not the likely buyers or tenants. Avoid "perfect for couples/families/young professionals", "walk to church", "exclusive neighborhood", "safe for kids", and similar steering phrases [U: from realtor-association word lists, which vary by source].
- A nondiscrimination disclaimer does not cure discriminatory wording [S].

## Prompt-writer rules
1. Output two fields: **public remarks** (property only) and **private remarks** (agent-only, restricted), kept separate.
2. Public remarks: no phone numbers, emails, URLs, social handles, "call me", open-house times, showing instructions, or commission/incentive language.
3. Put agent contact details in the syndication field, not public remarks (CRMLS guidance).
4. Enforce the per-MLS character limit from config. Show a live character count.
5. Fair Housing check on every output: no family, religion, race, national origin, or steering language.

## Sources
- CRMLS compliance trends, Sept 2022: https://blog.crmls.org/compliance/trending-topics-compliance-september-2022/ [S]
- CRMLS KB matrix syndication remarks: https://kb.crmls.org/knowledgebase/matrix-syndication-remarks/ [S, URL seen in search]
- NorthstarMLS remarks six sections: https://northstarmls.com/insights/listing-remarks-the-six-sections-and-how-to-stay-compliant [S]
- RESO PrivateRemarks: https://ddwiki.reso.org/display/DDW20/PrivateRemarks+Field [S]
- HUD advertising: https://hud.gov/sites/documents/DOC_7784.PDF [S]
- Vendor character-limit guide (unverified): https://listingai-nine.vercel.app/blog/mls-character-limits-complete-guide [U]
