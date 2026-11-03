# Fair Housing Advertising Policy (basis for the AI copy filter)

> **Researched 2026-11-03 — not legal advice.** This is research for the founder, not a legal opinion. A licensed attorney (ideally one who handles fair housing / real estate advertising) must review this policy and the filter's term lists before launch.
>
> **Research limits:** `hud.gov` and `ftc.gov` could not be fetched from the research environment, so HUD points below rely on search results and secondary sources. Items marked **[verify]** need confirmation against the primary source. Nothing here is invented; where I could not confirm something I say so.

---

## 1. The one-sentence rule

**Describe the property, not the people.** Say what the home *has* (bedrooms, step-free entry, fenced yard, distance in miles to a named landmark). Never say who should, would, or wouldn't want to live there, and never describe who already lives nearby.

## 2. Federal law

### 2.1 Protected classes (Fair Housing Act, 42 U.S.C. 3601 et seq.)

| Class | Notes |
|---|---|
| Race | |
| Color | |
| Religion | |
| Sex | HUD's Feb 2021 memo read "sex" to include sexual orientation and gender identity (after *Bostock*). See 2.4 — federal status is in flux. **Product decision: treat both as protected anyway** (state laws, NAR Code of Ethics, and private lawsuits don't depend on HUD's current mood). |
| National origin | Includes language/ethnicity proxies ("English speakers only", "Americans only"). |
| Familial status | Households with children under 18, pregnant people, people securing custody of a child. Federal exemption only for qualifying 55+ / 62+ housing (HOPA); that exemption does not make "no kids" copy safe for a normal listing. |
| Disability | Called "handicap" in the statute. |

Source: HUD overview of the Act — https://www.hud.gov/program_offices/fair_housing_equal_opp/fair_housing_act_overview (not fetchable from the research environment; verify). Search-result summary of the seven classes: https://naahq.org/node/408 (secondary).

### 2.2 The advertising rule

- **42 U.S.C. 3604(c)** makes it unlawful to "make, print, or publish, or cause to be made, printed, or published any notice, statement, or advertisement" for a sale or rental that "indicates any preference, limitation, or discrimination" based on a protected class, or an intention to make one. **[verify exact wording at https://www.law.cornell.edu/uscode/text/42/3604]**
- **24 CFR 100.75** is HUD's regulation on discriminatory notices, statements and advertisements. It is still the operative regulation. (A search summary also said it remains in force: https://syfert.com/cfr/sections/24-100.75.html — secondary; verify at https://www.ecfr.gov.)
- **The standard is the "ordinary reader."** Courts look at whether an ordinary reader would think the ad signals a preference. Intent to discriminate is not required for an *ad* to violate 3604(c). That is why an automated filter is valuable — and why it's the **agent's and RealtyBoost's** words on the line, not just the listing owner's. (Case law on this exists; **ask counsel for the controlling cases for your circuit — I am not citing any from memory.**)
- Publishers are in scope ("cause to be... published"). An AI tool that *generates* the copy is plausibly exposed. Treat the filter as a core safety feature, not a nice-to-have. **[ask counsel about platform liability and Section 230 limits]**

### 2.3 HUD advertising guidance: what exists and what's withdrawn

| Document | Status (as researched) |
|---|---|
| **24 CFR Part 109, "Fair Housing Advertising" (the 1989 guidelines)** | Search results of a 1997 Federal Register notice say Part 109 was removed from the CFR effective **May 1, 1996** (61 FR 14378, April 1, 1996) and relegated to non-codified guidance; HUD still treated its content as guidance afterward. Sources: https://www.govinfo.gov/content/pkg/FR-1997-07-07/html/97-17426.htm and https://govinfo.gov/content/pkg/FR-2001-04-26/pdf/01-10306.pdf. I did **not** confirm the 1989 original publication date — **[verify]**. Its word-by-word lists (the "famous" lists of "Words, phrases and symbols") are useful as *examples*, not binding law. |
| **Jan 9, 1995 HUD memo (Roberta Achtenberg) on advertising** | Exists as a HUD document (https://hud.gov/sites/documents/DOC_7784.PDF is the HUD-hosted PDF found by search). Per secondary summaries, it tells HUD staff **not to file complaints** over phrases like "master bedroom", "rare find", "desirable neighborhood" (https://oregonrealtors.org/news/tip-of-the-week/permissible-advertisements-under-the-fair-housing-act/). Verify current HUD posture. |
| **HUD digital advertising guidance (2024)** | One search result said a HUD notice published **April 6, 2026** withdrew eight FHEO guidance documents (effective Sept 17, 2025), possibly including the 2024 digital advertising guidance (https://www.nahro.org/news/hud-withdraws-eight-fair-housing-notices). **[verify which documents]**. HUD also said conduct violating the Act is still enforceable. |
| **HUD "Dear Colleague" letter, April 24, 2026 (Asst. Sec. Craig Trainor)** | Per news coverage: says agents sharing objective school-quality and crime data, *consistently for all clients*, is not by itself a Fair Housing Act violation; says steering needs discriminatory intent; treats the 2021 memo as superseded. NAR said it looked forward to working with HUD. Sources: https://www.nationalmortgagenews.com/news/hud-says-sharing-crime-school-data-doesnt-violate-fair-housing-act , https://www.rismedia.com/2026/04/30/hud-delivers-guidance-nar-proper-definition-steering/ , https://www.inman.com/2026/04/29/nar-responds-to-new-hud-guidance-on-school-and-crime-stats/ . I did not read the letter itself — **[verify at hud.gov]**. |

**What this means for the filter:** HUD's *current federal enforcement posture* has loosened on school/crime facts, but (a) the statute and 24 CFR 100.75 are unchanged, (b) state and local agencies (CA, NY, NJ, OR, WA especially), private plaintiffs and private fair-housing groups are not bound by HUD's letter, (c) NAR's Code of Ethics/MLS rules and brokerage policies may be stricter, and (d) a *generated ad* repeats the same sentence to every reader, which is where "describing the neighborhood's people" risk lives. **Recommended default: keep school/crime words at WARN (not BLOCK), require a neutral, sourced, factual rewrite, and let counsel decide whether to relax further.**

### 2.4 Sexual orientation and gender identity

- Feb 11, 2021: HUD memo directing enforcement of the Act's sex provisions to cover sexual orientation and gender identity, relying on *Bostock v. Clayton County* (2020). Source: https://www.govinfo.gov/content/pkg/FR-2021-04-27/html/2021-08513.htm
- 2025: coverage reports that executive orders and HUD actions rolled back related enforcement/policies (https://www.inman.com/2025/02/05/fair-housing-protections-rolled-back-on-day-1-of-trump-presidency/ ; https://www.banking.senate.gov/imo/media/doc/20260624lettertohudreequalaccessrule.pdf). I could not confirm the formal status of the 2021 memo itself. **[verify with counsel]**
- **Product rule regardless:** filter SOGI-related discriminatory copy. CA, NY, NJ, OR, WA all protect these classes under state law (see Section 6).

## 3. Words that are actually a problem vs. commonly over-flagged

**Problem = it states or implies a preference/limitation about people, or describes who lives there.**

| Often over-flagged (INFO only — do NOT block) | Why it's fine |
|---|---|
| "walk-in closet" | Describes a feature. "Walk" is not a disability reference. |
| "walking distance to...", "walkable", "steps from" | Describes distance. Optional alternative "short 5-minute stroll" or "0.4 miles" if you want to avoid any argument. |
| "family room", "bonus room" | Names a room type. HUD's guidance historically accepts it. |
| "great view", "stunning views", "sunny", "quiet street" | Property description. |
| "desirable neighborhood" (alone) | The 1995 memo lists it as not a violation (secondary source above). Still better to say *why* (parks, transit). |
| "starter home", "fixer-upper", "cozy" | Property description. |
| "playground nearby", "park", "walk to elementary school" | Amenity facts; fine if no "great for kids/families" framing. |
| "master bedroom" | See 3.1. |
| "handicap-accessible" / "wheelchair accessible" | Describing accessibility features is *allowed and helpful*. Prefer concrete features ("step-free entry, 36-inch doors, roll-in shower"). |

### 3.1 "Master bedroom" / "primary bedroom"
- The 1995 HUD memo reportedly says "master bedroom" is not a violation (see Oregon Realtors link above). A 2026 Inman piece said new HUD guidance reaffirmed that (https://www.inman.com/2026/05/07/fair-housing-hud-crime-statistics-school-ratings/ — secondary; verify).
- Many MLSs and brokerages nonetheless prefer **"primary bedroom"/"primary suite"** because "master" evokes gender/race connotations and slavery. The RealtyBoost default should **output "primary bedroom"** and mark user-typed "master bedroom" as WARN-low (auto-suggest swap, never block). This is an industry-preference choice, not a legal requirement; confirm your target MLSs' rules.

### 3.2 Churches / schools / "safe" areas
- A neutral reference to a landmark ("0.3 miles to Main St. Library") is fine. Naming a *specific house of worship or denomination* as a selling point can signal a religious preference — WARN. Prefer omitting it or only using it as a distance landmark without "perfect for", "community", "parish".
- Schools: naming the assigned public school district/school with a link to the official source is lower risk than "great schools!" or "top-rated". See Section 7.

## 4. Term list (machine-readable source of truth lives in code; this is the human version)

Severity: **BLOCK** = clear violation, do not publish, no one-click override. **WARN** = risky/context-dependent; show the rewrite; require the agent to accept the rewrite or confirm they've reviewed; log the choice. **INFO** = commonly over-flagged; no action.

Matching notes: case-insensitive, handle plurals/hyphens/spacing/unicode look-alikes, and check whole phrases in context (e.g. "no children" vs. "no children's toys left behind"). Counsel should review exact patterns.

### 4.1 Familial status

| Term / pattern | Sev | Safe rewrite |
|---|---|---|
| "no children", "no kids", "adults only", "adult community" (unless a legally qualified 55+/62+ community, see note), "child-free", "no minors" | BLOCK | Delete; describe the home. |
| "perfect for singles", "ideal for couples", "great for a single professional", "couples without children" | BLOCK | "One-bedroom plus den, 850 sq ft." |
| "perfect/ideal/great for families", "ideal for a growing family", "young family", "family-oriented community" | WARN | "Four bedrooms, two baths, fenced backyard." |
| "family-friendly", "kid-friendly", "child-safe" | WARN | State the feature: "fenced yard", "cul-de-sac", "near a city park". |
| "empty nesters", "retirees", "seniors", "mature couple", "young professionals" | WARN | "Main-floor primary suite, low-maintenance yard." |
| "bachelor pad", "newlyweds", "starter family" | WARN | "Open-plan loft with a flexible office space." |
| "55+" / "senior community" | WARN | Allowed only for a property the agent confirms is a lawfully qualified age-restricted community under the HOPA exemption; require agent confirmation checkbox. **[counsel]** |
| "nursery", "kid's room" | WARN | "Bedroom 3" / "flex room". |

### 4.2 Race, color, national origin, ethnicity

| Term / pattern | Sev | Safe rewrite |
|---|---|---|
| "white neighborhood", "no minorities", "whites only", "Caucasian", any "no [race/ethnicity]" | BLOCK | Delete. |
| "[ethnicity] community/area/neighborhood" (e.g. "Chinese neighborhood", "Hispanic area", "Korean enclave"), "diverse neighborhood", "integrated", "mixed neighborhood" | BLOCK | Describe amenities, not residents: "near Highway 101, 3 grocery stores within a mile." |
| "ideal for [nationality/ethnicity] buyers/families", "perfect for Asian/Latino buyers" | BLOCK | Delete. Do not let user prompts specify protected-class audiences (see 8). |
| "English-speaking only", "Americans only", "no foreigners", "citizens only" | BLOCK | Delete. |
| "changing neighborhood", "last chance before it changes", "up-and-coming demographic" | BLOCK | "Newly renovated kitchen; new transit stop 0.5 mi." |
| "exclusive neighborhood", "prestigious", "high-class", "elite", "restricted community" | WARN | "Gated community with 24-hour guard house" (if true). |
| "urban", "inner city", "ghetto", "bad neighborhood", "rough area", "transitional" | WARN (slur-like terms: BLOCK) | Neutral description of location and amenities. |
| "traditional neighborhood", "established neighborhood of old-money families" | WARN | "Mature trees; 1920s-era homes." |
| "good for investors from [country]" | BLOCK | Delete. |
| "feng shui" (as a property feature description, e.g. "front door faces east") | INFO | Fine as a property feature; do not pair with "for Chinese buyers". |

### 4.3 Religion

| Term / pattern | Sev | Safe rewrite |
|---|---|---|
| "Christian home/family", "no Muslims", "Jewish area", "Catholic neighborhood", "church-going family" | BLOCK | Delete. |
| "walking distance to church/synagogue/mosque/temple", "near St. Mary's Church", "parish" | WARN | Omit, or use a neutral landmark: "0.4 mile to Main Street shops". If naming a place of worship, state only the distance and never imply who it's for. |
| "Shabbat elevator", "kosher kitchen" | WARN | Describe as a feature ("separate dairy/meat sinks", "Shabbat-mode oven") with no "ideal for [religion]". |
| "Christmas-ready", "holiday home" | INFO | Fine as description if not tied to a religion. |

### 4.4 Sex (including sexual orientation, gender identity)

| Term / pattern | Sev | Safe rewrite |
|---|---|---|
| "men only", "women only", "ideal for a gentleman", "for a lady" | BLOCK | Delete. |
| "straight only", "no gays", "gay-friendly neighborhood", "LGBT area", "traditional family only", "no unmarried couples" | BLOCK | Delete. |
| "bachelor pad", "man cave", "she-shed" | WARN | "Finished basement with media area", "backyard studio". |
| "mother-in-law suite/apartment" | WARN | "In-law suite", "guest suite", or "ADU / accessory unit" (if legally permitted). |
| "master bedroom", "master suite", "master bath" | WARN (low) | "Primary bedroom/suite/bath". |
| "his and hers closets/sinks" | WARN (low) | "Dual closets / dual vanities". |
| "handyman special" | WARN (low) | "Fixer-upper / needs updating". |
| "housewife", "husband" as the assumed reader | BLOCK | Delete. |

### 4.5 Disability

| Term / pattern | Sev | Safe rewrite |
|---|---|---|
| "no wheelchairs", "not for handicapped", "able-bodied only", "healthy individuals only", "no mentally ill/disabled", "no service animals", "must be able to climb stairs" (as a limitation on who may apply) | BLOCK | Describe actual features. |
| "crippled", "invalid", "psycho", "crazy" used about people | BLOCK | Delete. |
| "sober residents only", "no recovering addicts" | BLOCK | Delete. |
| "handicap accessible", "handicapped parking" | INFO | Prefer: "step-free entry, 36-inch doors, grab bars" (describe features). |
| "great for seniors", "ideal for elderly" | WARN | "Single-story living; walk-in shower." |
| "walk-in closet/shower", "walk-up" (e.g., a walk-up apartment) | INFO | Fine; "walk-up" is better stated as "third-floor unit, no elevator" if that's the fact. |
| "stairs-free" / "no stairs" | INFO | Fine as a feature. |

### 4.6 Neighborhood "steering" proxies

| Term / pattern | Sev | Safe rewrite |
|---|---|---|
| "safe neighborhood", "crime-free", "low crime", "dangerous", "sketchy" | WARN | Prefer to omit. If the agent supplies a statistic, use a dated, sourced neutral statement through the agent's own review ("Per [city police dept.] data for [year]: X incidents/1,000 residents") — **[counsel on whether to ever auto-generate this]**. |
| "good schools", "top-rated schools", "best school district", "bad schools" | WARN | "Assigned to Lincoln Elementary (see [official district link])." |
| "no HOA/low-income housing nearby", "no Section 8" | BLOCK (source-of-income states) | Delete. |
| "desirable", "sought-after", "great location" | INFO | OK; prefer concrete amenity facts. |
| "exclusive", "upscale", "luxury" | INFO/WARN | "Luxury finishes" about the home = INFO; "exclusive neighborhood" = WARN (4.2). |
| Any statement of neighborhood demographics ("mostly families", "lots of young professionals", "70% X") | BLOCK | Delete. Do not use census demographics in copy. |

### 4.7 State-only protected classes (applies where the listing is in that state; see Section 6)

| Term / pattern | Sev | Safe rewrite |
|---|---|---|
| "no Section 8", "no vouchers", "must have W-2 income", "no housing assistance" | BLOCK (CA, NY, NJ, OR, WA at minimum — **[verify each]**) | Delete (rentals mostly; also avoid in sales ads to be safe). |
| "no immigrants", "US citizens only", "must have SSN", "green card holders only" | BLOCK | Delete. |
| "veterans only", "no military", "no tenants with military orders" | BLOCK (WA, others) | Delete. |
| "no unmarried couples", "married couples only" | BLOCK | Delete. |
| "no seniors/no young people" (age) | WARN→BLOCK in states with age protections | Delete. |

## 5. Non-English illustrative examples

> **Illustrative only.** I composed these from general knowledge of each language to show the *kind* of phrase the filter must catch. They have not been checked by native-speaking compliance reviewers. Hire a fluent reviewer (ideally someone familiar with local real estate marketing in each language) to build the real lists. Translating an English ad is not itself discriminatory; the same rules apply in every language. Also: non-English advertising should not be the *only* channel, and the Equal Housing Opportunity statement should appear in the same language as the ad (this is best practice; **[verify with counsel]**).

### 5.1 Spanish

| Phrase | English meaning | Sev | Why / rewrite |
|---|---|---|---|
| "ideal para parejas sin hijos" | ideal for couples without children | BLOCK | Familial status. → "Casa de 2 recámaras con jardín." |
| "no se permiten niños" / "solo adultos" | no children allowed / adults only | BLOCK | Familial status. |
| "ideal para solteros" | ideal for singles | BLOCK | Familial status / marital. |
| "comunidad latina", "barrio hispano", "zona de puro mexicano" | Latino community / Hispanic neighborhood / all-Mexican zone | BLOCK | Describes residents (national origin). |
| "familia cristiana", "solo católicos" | Christian family / Catholics only | BLOCK | Religion. |
| "cerca de la iglesia" | near the church | WARN | Use a neutral landmark. |
| "zona segura", "barrio tranquilo y seguro" | safe zone | WARN | Steering proxy; omit. |
| "excelentes escuelas" | excellent schools | WARN | Name the assigned school and link the source. |
| "recámara principal" | primary bedroom | INFO | Safe. ("Recámara master" also common — WARN low.) |
| "suite para la suegra" | mother-in-law suite | WARN | → "suite para huéspedes". |

### 5.2 Simplified Chinese

| Phrase | English meaning | Sev | Why / rewrite |
|---|---|---|---|
| "适合华人家庭" | suitable for Chinese families | BLOCK | National origin/race. |
| "华人社区", "华人区", "华人聚居" | Chinese community / area | BLOCK | Describes residents. |
| "远离黑人区/少数族裔社区" | away from Black / minority areas | BLOCK | Race, steering. |
| "不欢迎有小孩的家庭", "不接待儿童" | families with children not welcome | BLOCK | Familial status. |
| "仅限成年人" | adults only | BLOCK | Familial status. |
| "适合单身人士", "适合新婚夫妇" | ideal for singles / newlyweds | BLOCK / WARN | Familial/marital. |
| "基督徒家庭" | Christian household | BLOCK | Religion. |
| "安全社区", "治安好" | safe community / good security | WARN | Steering proxy. |
| "好学区" / "学区房" | good school district | WARN | Very common selling phrase in Chinese-language marketing — name the assigned school factually with an official link instead. |
| "邻近教堂/寺庙" | near church/temple | WARN | Use neutral landmark. |
| "主卧" | primary bedroom | INFO | Safe. |
| "风水好" | good feng shui | INFO | Fine as a feature; never pair with "for Chinese buyers". |

### 5.3 Vietnamese

| Phrase | English meaning | Sev | Why / rewrite |
|---|---|---|---|
| "khu người Việt", "khu Little Saigon" (as a "who lives here" claim) | Vietnamese area | BLOCK | Describes residents. Naming a place as a *location* (e.g., "2 miles from Bolsa Ave.") is OK. |
| "chỉ dành cho người Việt" | for Vietnamese only | BLOCK | National origin. |
| "không nhận gia đình có trẻ em" | no families with children | BLOCK | Familial status. |
| "chỉ dành cho người lớn" | adults only | BLOCK | Familial status. |
| "thích hợp cho người độc thân" | suitable for singles | BLOCK | Familial/marital. |
| "gia đình Công giáo/Phật tử" | Catholic/Buddhist family | BLOCK | Religion. |
| "khu an ninh tốt", "khu an toàn" | safe/secure area | WARN | Steering proxy. |
| "gần chùa / gần nhà thờ" | near temple / church | WARN | Neutral landmark only. |
| "khu cao cấp" | upscale/exclusive area | WARN | Describe the property. |
| "phòng ngủ chính" | primary bedroom | INFO | Safe. |

### 5.4 Korean

| Phrase | English meaning | Sev | Why / rewrite |
|---|---|---|---|
| "한인 밀집 지역" | area densely populated by Korean-Americans | BLOCK | Describes residents (national origin). |
| "한국인 전용", "한인만" | Koreans only | BLOCK | National origin. |
| "아이 있는 가정 불가", "어린이 불가" | no families with children | BLOCK | Familial status. |
| "성인 전용" | adults only | BLOCK | Familial status. |
| "독신자에게 적합", "신혼부부에게 적합" | good for singles / newlyweds | BLOCK / WARN | Familial/marital. |
| "기독교 가정" | Christian household | BLOCK | Religion. |
| "안전한 동네" | safe neighborhood | WARN | Steering proxy. |
| "교회 근처" | near church | WARN | Neutral landmark only. |
| "좋은 학군" | good school district | WARN | Name the assigned school factually. |
| "주 침실" (or "마스터 베드룸") | primary bedroom | INFO / WARN-low | Prefer "주 침실". |

**Engineering note:** CJK text has no spaces; word-boundary matching won't work — use phrase/substring matching plus a reviewed pattern list per language, and make the LLM do a second-pass classification ("does this text state or imply a preference about a protected class?") with the human list as a hard floor.

## 6. State-law additions (CA, NY, NJ, OR, WA)

These states add protected classes beyond the federal seven. **Lists change often; every row needs checking against the current statute.** Search results here were mostly secondary, so only items I could tie to a source are stated with confidence.

| State | Statute | Extra classes (as found) | Confidence |
|---|---|---|---|
| **California** | Fair Employment and Housing Act, Gov. Code 12955 (https://law.justia.com/codes/california/code-gov/title-2/division-3/part-2-8/chapter-6/article-2/section-12955) ; also Unruh Civil Rights Act (Civ. Code 51) | Gender identity, gender expression, sexual orientation, marital status, ancestry, source of income (lawful, verifiable income), genetic information, plus related items such as **primary language** and **immigration status** (CA added these in recent years — **I could not confirm either in the search results; [verify] at leginfo.legislature.ca.gov**). Source-of-income background: https://calcivilrights.ca.gov/wp-content/uploads/sites/32/2020/03/2020_OverviewFEHA_FairHousingRegs.pdf | Medium for core list; verify language/immigration |
| **New York** | Executive Law 296(5) | Search result reports **lawful source of income**, and **citizenship and immigration status** were added by amendment signed Dec 23, 2022 (https://pubs.royle.com/article/New+Protected+Classes+Added/4538219/786418/article.html). Others (age, marital status, sexual orientation, gender identity/expression, military status, creed) are listed in NY guidance (e.g., https://www.tompkinscountyny.gov/ar/files2/humanrights/NYS_Brochures/nysdhr-fair-housing-guide.pdf) — **[verify]**. Also NYC Human Rights Law has more. | Medium |
| **New Jersey** | Law Against Discrimination, N.J.S.A. 10:5-1 et seq. (search found 10:5-12 cited for housing provisions; not fully confirmed) | NJ guidance (https://www.nj.gov/dca/codes/publications/pdf_lti/discrim_in_hsing.pdf) lists additional classes (e.g., marital/civil union status, affectional or sexual orientation, gender identity/expression, ancestry, source of lawful income/housing subsidy, familial status, liability for military service). **[verify exact list]** | Low–medium |
| **Oregon** | ORS 659A.421 (https://law.justia.com/codes/oregon/volume-16/chapter-659a/section-659a-421/) | Per search summary: sexual orientation, gender identity, marital status, source of income, familial status, and others; a 2025 bill (HB 3523) may add classes — **[verify enacted text]** | Medium |
| **Washington** | RCW 49.60.222 (https://lawfilesext.leg.wa.gov/law/RCWPDF/RCW%20%2049%20%20TITLE/RCW%20%2049%20.%2060%20%20CHAPTER/RCW%20%2049%20.%2060%20.222.pdf) | Honorably discharged veteran or military status; marital status; sexual orientation including gender identity; source of income — **I could not confirm the statewide source-of-income status** (Seattle has its own ordinance, SMC 14.08, adding more). **[verify]** | Low–medium |

**Product implication:** put the listing's state in the data model. The filter applies the federal list plus state add-ons, and the "no Section 8 / no vouchers / no immigrants / veterans" rows jump to BLOCK. Local (city/county) ordinances can add more (e.g., Seattle) — **tell counsel you need a jurisdiction matrix**.

## 7. Steering, "safe areas", schools, and neighborhood demographics

- **Steering** = directing buyers toward or away from areas because of a protected class. Copy about crime, "safe" areas, "good schools", religious institutions, or "who lives here" is a classic proxy.
- **Federal posture changed in April 2026** (Section 2.3): sharing neutral crime/school data consistently is, per HUD's letter, not itself a violation. That is helpful but not a safe harbor against state agencies, private suits, or NAR rules. **Recommended product behavior:** (1) don't generate crime or school-quality claims on our own; (2) if the agent adds them, prompt for a named third-party source and date; (3) apply them identically to every listing (consistency is the condition in HUD's letter); (4) keep them at WARN and log the agent's confirmation.
- **Demographics:** never put race, religion, national origin, "diversity", "families", or age-mix statements about a neighborhood in copy, even if the figure comes from the census. Never use the *lead's* protected traits to personalize copy (e.g., "for Chinese families" because the lead has a Chinese name).
- **Targeted ads:** If RealtyBoost ever helps with paid social ads, housing ads on Meta and Google run under special restrictions on audience targeting (no targeting by age, gender, ZIP etc.). Not researched here; **[verify with each platform's current housing-ad policy]**.

## 8. What the software MUST enforce (summary)

1. **BLOCK list is a hard stop** in all five languages and every output type (listing, social, email, video script, CMA narrative, landing-page text, captions, alt-text, hashtags) — including text the agent edits by hand before publish/export.
2. **Describe-the-property prompt rules:** system prompt forbids the model from describing residents, demographics, schools' quality, safety, religion, or intended buyer type; user instructions that request those (e.g., "target Korean buyers", "family-friendly") are refused or rewritten.
3. **State-aware rules** using the listing's state; add state classes (source of income, immigration status, military/veteran, marital status, etc.).
4. **Default to neutral wording:** output "primary bedroom", "in-law suite", "dual closets"; add the Equal Housing Opportunity statement/logo to ads (in the ad's language), and brokerage/license attribution per other compliance files.
5. **WARN requires human acknowledgement + audit log** (who, when, term, rewrite accepted or not). The ToS must say the filter is an aid, not a guarantee, and the agent remains responsible.

## 9. Open questions for the attorney

- Platform/publisher liability for AI-generated ads under 3604(c); indemnity from agents; insurance.
- Whether to treat school/crime language as WARN or BLOCK now that HUD's 2026 letter exists.
- Federal treatment of SOGI today; confirm state lists in Section 6 and local ordinances in top markets.
- How to handle 55+ community copy, non-English ads, and EHO statement language.
- Retention period for filter logs.
