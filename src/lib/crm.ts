import type { ChecklistKind, DealSide, DealStage } from "@prisma/client";

export const DEAL_STAGES: DealStage[] = ["NEW_LEAD", "NURTURE", "APPOINTMENT", "ACTIVE", "UNDER_CONTRACT", "CLOSED", "LOST"];
export const CONTACT_STATUSES = ["NEW", "NURTURE", "ACTIVE", "PAST_CLIENT", "DO_NOT_CONTACT"] as const;
export const CONTACT_ROLES = ["BUYER", "SELLER", "INVESTOR", "RENTER", "PAST_CLIENT", "COOPERATING_AGENT", "LENDER", "VENDOR", "OTHER"] as const;
export const LEAD_SOURCES = [
  "MICROSITE", "OPEN_HOUSE", "ZILLOW", "REALTOR_COM", "FACEBOOK", "INSTAGRAM", "GOOGLE", "WEBSITE",
  "REFERRAL", "PAST_CLIENT", "SPHERE", "SIGN_CALL", "OTHER",
] as const;
export const ACTIVITY_TYPES = ["CALL", "EMAIL", "TEXT", "MEETING", "SHOWING", "OTHER"] as const;

type TemplateItem = { title: string; kind: ChecklistKind; required: boolean; daysFromContract?: number };

/**
 * Generic transaction checklists. Deadlines are typical defaults only — the
 * agent edits each date to match their contract and state.
 */
const BUYER: TemplateItem[] = [
  { title: "Written buyer agreement signed", kind: "DOCUMENT", required: true },
  { title: "Pre-approval letter on file", kind: "DOCUMENT", required: true },
  { title: "Executed purchase contract", kind: "DOCUMENT", required: true },
  { title: "Earnest money delivered", kind: "DEADLINE", required: true, daysFromContract: 3 },
  { title: "Inspection / option period ends", kind: "DEADLINE", required: true, daysFromContract: 10 },
  { title: "Inspection report reviewed with buyer", kind: "TASK", required: true },
  { title: "Appraisal completed", kind: "TASK", required: true },
  { title: "Financing contingency deadline", kind: "DEADLINE", required: true, daysFromContract: 21 },
  { title: "Title commitment reviewed", kind: "TASK", required: true },
  { title: "HOA documents received (if any)", kind: "DOCUMENT", required: false },
  { title: "Closing Disclosure received by buyer (3 business days before closing)", kind: "DEADLINE", required: true, daysFromContract: 27 },
  { title: "Final walkthrough", kind: "TASK", required: true },
  { title: "Closing", kind: "DEADLINE", required: true, daysFromContract: 30 },
];

const SELLER: TemplateItem[] = [
  { title: "Listing agreement signed", kind: "DOCUMENT", required: true },
  { title: "Seller disclosures completed", kind: "DOCUMENT", required: true },
  { title: "Photos taken and listing live", kind: "TASK", required: true },
  { title: "Executed purchase contract", kind: "DOCUMENT", required: true },
  { title: "Earnest money receipt confirmed", kind: "DEADLINE", required: true, daysFromContract: 3 },
  { title: "Inspection response / repairs agreed", kind: "DEADLINE", required: true, daysFromContract: 12 },
  { title: "Appraisal completed", kind: "TASK", required: true },
  { title: "Buyer financing approval", kind: "DEADLINE", required: true, daysFromContract: 21 },
  { title: "Title ordered and payoff requested", kind: "TASK", required: true },
  { title: "Agreed repairs completed (keep receipts)", kind: "TASK", required: false },
  { title: "Closing", kind: "DEADLINE", required: true, daysFromContract: 30 },
  { title: "Remind seller to transfer utilities", kind: "TASK", required: false },
];

export function checklistTemplate(side: DealSide, contractDate: Date | null) {
  const items = side === "SELLER" ? SELLER : side === "BUYER" ? BUYER : [...SELLER, ...BUYER.filter((b) => !SELLER.some((s) => s.title === b.title))];
  return items.map((item, position) => ({
    title: item.title,
    kind: item.kind,
    required: item.required,
    position,
    dueAt: contractDate && item.daysFromContract !== undefined ? new Date(contractDate.getTime() + item.daysFromContract * 86_400_000) : null,
  }));
}
