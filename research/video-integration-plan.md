# Video Integration Plan (RealtyBoost)

As of 2026-11-03. Vendor pricing and API details were gathered from secondary sources (vendor blogs, pricing aggregators). Official vendor pricing pages were not reachable from this environment. Every price here is tagged **[S]** (secondary, conflicting or single-source) or **[U]** (unverified). Re-check on each vendor's pricing page before budgeting.

---

## v1: Scripts and storyboards handed to a human editor (ships first)

RealtyBoost generates the production package; the agent finishes the video in CapCut or Submagic in about 15 minutes.

### Package the product delivers per listing
| File | Contents | Format |
|---|---|---|
| `script.md` | Hook, beats, CTA, timing (30 s target, ~75 words VO) | Text, one section per beat |
| `shotlist.csv` | Shot #, room or subject, camera move, duration, source (agent photo / video / stock), status | CSV |
| `storyboard.png` (optional v1.1) | One frame per shot with the shot number | Image |
| `voiceover.txt` | Exact VO text, with pronunciation notes for street names | Text |
| `onscreen.txt` | Text overlays with timestamp: price, beds/baths, city, CTA | Text |
| `captions.srt` | Subtitles timed to VO | SRT |
| `platform-cuts.md` | Per-platform caption and hashtag text (see platform-briefs/) | Text |

### Agent workflow (about 15 minutes)
1. **Upload (2 min):** agent drops listing photos and any clips into the project folder named by MLS number.
2. **Import (2 min):** in CapCut, import the shot list order. Name each clip by shot number so matching is one step.
3. **Assemble (5 min):** place clips on the timeline, trim to the duration in `shotlist.csv`, add the VO audio file.
4. **Text overlays (3 min):** paste `onscreen.txt` lines at the timestamps. Use the template style for the brokerage.
5. **Captions (1 min):** import `captions.srt`, or auto-generate in CapCut or Submagic and check against VO.
6. **Export (2 min):** 9:16 for Shorts, Reels, and TikTok; 16:9 for MLS/YouTube/website. Export 1080p.
7. **Post:** agent copies `platform-cuts.md` text into each platform.

### What the platform must do in v1
- Output must be deterministic: the same listing data always yields the same `shotlist.csv` row structure.
- Every VO line and overlay must fit the duration: check words-per-second (about 2.5 words/s) and character count of overlays before export.
- Fair Housing and MLS checks run on `script.md` and `voiceover.txt` before the package is released (see platform-briefs/mls-listing-rules.md).

### Risks in v1
- Editor skill varies. Mitigate with a single brokerage template in CapCut.
- CapCut has no public API assumed in this plan [U]. Do not design an integration against it in v1.

---

## v2: Automated video generation via API

### Vendor comparison

Tags: API = public API availability. Price tags are as found (see notes).

| Vendor | Public API | Pricing as found | Voice / avatar realism | Own face/voice (cloning) and consent | Output formats | Status |
|---|---|---|---|---|---|---|
| **Pictory** | Yes, separate product from plans. Docs at pictory.ai/pictory-api | Subscriptions ~$25–29/mo (annual) [S]; API priced separately, rate not found [U] | Stock voices, text-to-video from article/script. Not an avatar tool | Not a clone product [S] | MP4, 16:9 and 9:16 [U] | API price not verified |
| **HeyGen** | Yes. Wallet-based USD billing from $5 [S] | Avatar IV ~$0.05–0.10/sec [S]; Avatar III ~$1/min [S]; conflicting sources | Strong avatar realism at the top tier [U] | Custom avatars require the depicted person's explicit consent, recorded on camera; the platform checks it [S] (heygen.com/moderation-policy, heygen.com/blog/ai-avatar-consent-brand-controls) | MP4, up to 1080p [U] | Pricing conflicts |
| **Submagic** | Yes, in Business + API plan [S] | Business + API $69/mo (monthly) or $41/mo (annual) [S]. Minute packs: 250 min $57, 1,000 min $150 [S, single source] | Not a generator; captions, B-roll and clip tools on existing footage | Not a clone product | MP4, 9:16 and 16:9 [U] | Best fit for captioning |
| **Veed** | Yes, billed separately from subscriptions with prepaid API credits that expire after 2 years [S] | Fabric 8 credits/sec at 720p [S, unverified]; API rate not found | Editor; Fabric is an avatar/lip-sync feature | Not verified | MP4 [U] | API rate unverified |
| **Runway** | Yes [S] | Gen-4.5 12 credits/sec; Gen-4 Turbo 5 credits/sec; $0.01 per credit [S] (developersdigest.tech; apiframe.ai; costbench.com, which marks its own prices unverified) | Cinematic B-roll; no talking-head avatar | Not a face-clone product in these sources | MP4, 16:9 and 9:16 [U] | Good for B-roll |
| **D-ID** | Yes; Build (API) plan $18/mo for 64 credits [S] (FitGap listing) | ~4 credits per minute of standard video [S] (Creatify) | Talking-head avatars; realism depends on source photo [U] | Requires consent from the person whose image is used [U]; policy not verified | MP4 [U] | Pricing conflicts across sources |
| **Synthesia** | Enterprise tier is quote-based. A UK guide says API is Enterprise-only; a US guide lists it under Creator [S, conflicting] | No public per-minute API rate. Credits ~90–160/min cited [S, conflicting] | Strong stock avatars | Custom avatars need explicit consent from the depicted person; stock avatars cannot be used for paid ads with a personal characteristic without consent [S] (synthesia.io/legal/user-terms-of-service; conductatlas.com excerpts) | MP4 [U] | Quote required |

### Consent requirements (applies to any avatar of a real person)
- Both HeyGen and Synthesia require the depicted person's explicit consent before a custom avatar is created [S] (their terms and policy pages).
- For agents' own avatars: collect a signed consent record, plus the vendor's on-camera consent step. Store the consent record with the agent account.
- Do not generate an avatar of any person who has not consented. Do not generate an avatar of another agent or a seller.
- Stock avatars used in paid ads may need additional consent under vendor terms [S] (Synthesia AUP excerpt).

### Recommendation
- **Captions and clean-up:** Submagic (Business + API). Cheapest verified per-minute path, and it is an API product.
- **B-roll for empty rooms or exteriors without footage:** Runway Gen-4 Turbo (5 credits/sec) on a per-job cap. Use only for non-people shots.
- **Talking-head avatar:** HeyGen, only for agents who have completed the consent flow. Budget the high end of its range until pricing is confirmed.
- **Not recommended for v2 now:** Synthesia (quote required, unclear API tier), Veed (API rate unverified), Pictory (API price not found; reconsider once its API card is confirmed).
- Gate all avatar generation behind the consent record check, in code.

### Cost estimate per 30-second listing video (generation and captions only)

Assumes 30 s of output. Excludes platform subscription fees and the agent's time. Prices are as found and conflicting; use these as order-of-magnitude.

| Component | Basis | Cost per 30 s | Status |
|---|---|---|---|
| Captions (Submagic) | $57 per 250 min pack = $0.23/min | ~$0.11 | [S, single source] |
| B-roll, Runway Gen-4 Turbo | 5 cr/s x 30 s x $0.01 | $1.50 | [S] |
| B-roll, Runway Gen-4.5 | 12 cr/s x 30 s x $0.01 | $3.60 | [S] |
| Avatar, HeyGen Avatar III | ~$1/min x 0.5 min | ~$0.50 | [S, conflicting] |
| Avatar, HeyGen Avatar IV | $0.05–0.10/s x 30 s | $1.50–3.00 | [S, conflicting] |
| Avatar, D-ID standard | ~4 cr/min; $0.28/credit implied by Build plan | ~$0.56 | [S, derived] |

**Estimated generation cost per 30 s listing video:**
- Captions + B-roll only (no avatar): **~$1.60 to $3.70**
- With HeyGen avatar: **~$2.10 to $6.70**

Plus fixed costs: Submagic Business + API at $69/mo (annual $41/mo) and the HeyGen wallet top-up. At 100 videos/mo, the fixed plan cost dominates until volume is high enough to amortize it.

Confirm prices on the vendors' own pricing pages before using these numbers in customer-facing pricing.

### Output formats the pipeline needs
- 9:16 MP4 (1080x1920) for Shorts, Reels, TikTok.
- 16:9 MP4 (1920x1080) for MLS, website and YouTube.
- SRT captions alongside every export.
- Confirm each vendor's max duration and resolution before wiring the pipeline [U].

---

## Sources
- Submagic pricing aggregator (conflicting): https://costbench.com/software/ai-video-editing-saas/submagic/ [S]
- Runway API pricing aggregator: https://costbench.com/software/ai-media-apis/runway-api/ [S, self-labeled unverified]
- Runway Gen-4.5 credits: https://www.developersdigest.tech/models/video-generation/runway [S]
- HeyGen pricing aggregator (conflicting): https://creatify.ai/blog/heygen-pricing-(2026)-plans-and-what-you-ll-actually-pay [S]
- HeyGen consent policy: https://www.heygen.com/moderation-policy [S]
- HeyGen avatar consent: https://www.heygen.com/blog/ai-avatar-consent-brand-controls [S]
- Synthesia terms: https://www.synthesia.io/legal/user-terms-of-service [S]
- Synthesia pricing aggregator (conflicting): https://www.activepieces.com/blog/synthesia-pricing-2026-plan-costs-and-cost-per-video [S]
- D-ID API tiers: https://us.fitgap.com/products/d-id [S]
- Pictory pricing aggregator: https://pricingsaas.com/companies/pictory [S]
- Veed API billing: https://flowith.io/blog/veed-io-pricing-2026-free-vs-basic-vs-pro/ [S]
- Official pricing pages (not reached): heygen.com/pricing, synthesia.io/pricing, runwayml.com/pricing, d-id.com/pricing, pictory.ai/pricing, submagic.co/pricing, veed.io/pricing [unverified]
