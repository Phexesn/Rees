# Backlog

Everything from the north-star vision that is **not** in v1, plus follow-ups found while building. Each entry: user story · dependencies · rough effort · suggested order (1 = do first within its section). Estimates assume one experienced developer or one focused AI build session.

## 0. Before charging real customers (do these first)

| Item | Story | Depends on | Effort | Order |
|---|---|---|---|---|
| Real AI quality pass | As the founder, I review 90 real outputs (5 listings × 6 modules × 3 languages) and iterate the weakest prompts | `ANTHROPIC_API_KEY`; `npm run walkthrough` | 6–10 h | 1 |
| Attorney review | Fair Housing rules, consent wording on lead forms, CMA disclaimer, ToS and privacy policy | `compliance/` drafts | external | 1 |
| Terms & Privacy pages | As a visitor, I can read the terms and privacy policy before signing up | attorney review | 2 h | 2 |
| Password reset | As an agent who forgot my password, I get a reset link by email | Resend | 3 h | 2 |
| Email verification | As the platform, I confirm signup emails | Resend | 2 h | 3 |
| Production deploy | Vercel + Neon + Stripe live keys + domain | accounts | 3 h | 1 |
| Rate limiting (durable) | Public forms and login are rate-limited across serverless instances | Upstash/Redis or Postgres table | 2 h | 3 |
| Native-speaker review of UI translations | es/zh/vi/ko strings, especially legal/consent text | reviewers | external | 2 |

## 1. Transaction management

| Item | Story | Depends on | Effort | Order |
|---|---|---|---|---|
| Document upload per deal | As an agent, I attach PDFs/photos to checklist items | Vercel Blob or S3 | 6 h | 1 |
| Compliance completeness check | As a broker, I see which required documents are missing per file | document upload | 4 h | 2 |
| State-specific checklist templates | TX option period, CA contingencies, etc. | research per state | 2 h/state | 3 |
| Deadline reminders by email | Daily digest of deadlines in the next 3 days | Resend, cron (Vercel Cron) | 4 h | 2 |
| Calendar export (ICS) | Deadlines appear in Google/Apple calendar | — | 3 h | 3 |

## 2. Documents & eSignature

| Item | Story | Depends on | Effort | Order |
|---|---|---|---|---|
| Contract template library (per state) | Links to/organizes state association forms the agent already has access to | licensing research (forms are copyrighted) | 8 h | 2 |
| DocuSign / Dropbox Sign integration | Send a document for signature from a deal | vendor API account | 16 h | 3 |
| 7-year compliance archive | Immutable storage + retention policy | document upload | 6 h | 3 |

## 3. Communication

| Item | Story | Depends on | Effort | Order |
|---|---|---|---|---|
| Send email from the app | Send Follow-Up Coach emails and listing emails directly, logged automatically | Resend/Postmark domain auth, CAN-SPAM footer, unsubscribe handling | 12 h | 1 |
| Gmail/Outlook sync | Conversations appear in the contact log | Google/Microsoft OAuth verification | 24 h | 3 |
| SMS sending (Twilio) | Text leads from the app | **A2P 10DLC registration**, consent records (built), STOP handling | 16 h | 2 |
| Click-to-call + call logging | Calls logged automatically | Twilio Voice | 12 h | 3 |
| Automated nurture sequences | Multi-step email sequences per contact with opt-out | email sending | 16 h | 2 |
| WeChat / KakaoTalk / Zalo notes | Quick log buttons for messaging apps used by Asian-American clients (research #15) | — | 2 h | 1 |

## 4. MLS integration

| Item | Story | Depends on | Effort | Order |
|---|---|---|---|---|
| Import my listing by MLS number | Fill the listing form from MLS data | RESO Web API vendor (MLS Grid / Trestle / Bridge) + per-MLS license (see `research/mls-integration.md`) | 24 h + approvals | 2 |
| MLS display compliance | Brokerage attribution, MLS logo, refresh rules on public pages | MLS agreement | 6 h | 3 |
| Market snapshot | Price trends, days on market, inventory for a zip | MLS or licensed data feed | 16 h | 3 |

## 5. Showings & scheduling

| Item | Story | Depends on | Effort | Order |
|---|---|---|---|---|
| Showing request on listing pages | Buyer picks a time from the agent's availability | calendar availability model | 12 h | 1 |
| Buyer tour builder | Order showings by route | maps API (Google/Mapbox) | 12 h | 3 |
| Open-house check-in improvements | QR code to the kiosk page, printable sign-in sheet | — | 3 h | 1 |

## 6. Buyer representation

| Item | Story | Depends on | Effort | Order |
|---|---|---|---|---|
| Listing ↔ buyer matching — **basic version shipped in v1** (contact card + listing page). Next: notify the agent when a new listing matches saved buyers | Email alert on new matching listing | email sending | 3 h | 2 |
| Property comparison sheet | Side-by-side sheet of 2–4 homes for a buyer (printable) | — | 6 h | 2 |
| Buyer intake form (public) | "Tell me what you're looking for" page that creates a contact with preferences | microsite pattern | 4 h | 1 |

## 7. Business operations

| Item | Story | Depends on | Effort | Order |
|---|---|---|---|---|
| Commission tracking | Expected vs. paid commission, splits | deals (built) | 6 h | 1 |
| Referral tracking + payouts | Track referral fees owed/received | contacts | 4 h | 2 |
| Expenses & mileage | Log marketing spend and miles | — | 6 h | 2 |
| P&L / tax export (CSV) | Year-end summary for an accountant | the above | 4 h | 3 |

## 8. Team & brokerage

| Item | Story | Depends on | Effort | Order |
|---|---|---|---|---|
| Lead routing rules | Round-robin or by language/area for new leads (Team) | team (built) | 8 h | 1 |
| Shared vs. private contacts | Owner sees all; agents see their own + shared | `ownerId` on Contact + RLS policy update | 8 h | 1 |
| Remove/deactivate teammate, reset password | | — | 3 h | 1 |
| Roles & permissions | Admin vs. agent abilities | — | 6 h | 2 |
| Full white-label | Custom domain and brand colors on listing pages | Vercel domains API | 12 h | 3 |
| Brokerage plan (>5 seats) | Seat-based billing | Stripe quantities | 6 h | 3 |

## 9. Analytics & reporting

| Item | Story | Depends on | Effort | Order |
|---|---|---|---|---|
| Lead source → closing funnel | Which sources and listing pages produce deals | data exists (AuditLog, Contact.source, Deal) | 8 h | 1 |
| Listing page analytics | Views (built), form conversion rate, top referrers | — | 4 h | 1 |
| GCI forecast | Expected commission by month from pipeline | commission tracking | 4 h | 2 |
| Marketing performance | Which posts drove leads (UTM links on copy) | link tracking | 8 h | 3 |

## 10. Learning & onboarding

| Item | Story | Depends on | Effort | Order |
|---|---|---|---|---|
| Video walkthroughs | 2-minute screen videos per feature, embedded in Help | recording | 6 h | 1 |
| Guided tour | First-visit highlights on the dashboard | — | 4 h | 2 |
| Text-size switch | "Larger text" toggle (125%) for low-vision users | — | 2 h | 1 |
| UI languages: Tagalog, Portuguese (BR), French (CA) | Content already supported; translate `locales/` | translators | 4 h | 2 |

## 11. AI & content

| Item | Story | Depends on | Effort | Order |
|---|---|---|---|---|
| Photo uploads + AI photo feedback | Agent uploads test shots; AI points out leaning verticals, blown windows | uploads, vision model | 12 h | 1 |
| Zillow/Realtor.com-specific description | Lower-priority module per brief | — | 1 h | 3 |
| Video generation (v2) | Submagic captions, HeyGen avatar (with consent), Runway b-roll — see `research/video-integration-plan.md` | vendor APIs | 24 h | 3 |
| DB-backed prompt store with admin editor | Edit prompts in production without a deploy; version history | — | 8 h | 2 |
| Per-module model routing by plan | Use Sonnet/Haiku for Solo to protect margins | cost data from `/admin` | 2 h | 2 |
| Output key ordering in email/text export | Email-to-self lists sections in schema order (Postgres JSONB reorders keys) | — | 1 h | 3 |
| Re-verify research with primary sources | Re-run research once NAR, Apple, Meta, MLS hosts are reachable | network allow-list | 4 h | 1 |
