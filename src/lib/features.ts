import type { Plan, SubscriptionStatus } from "@prisma/client";

/**
 * Single source of truth for pricing tiers and feature gating.
 * UI and server both call these helpers; never compare plan names inline.
 */

export const PLAN_ORDER: Plan[] = ["SOLO", "PRO", "TEAM"];

export const PLANS: Record<
  Plan,
  { priceMonthly: number; contentLanguages: number; listingsPerMonth: number | null; seats: number }
> = {
  SOLO: { priceMonthly: 29, contentLanguages: 1, listingsPerMonth: 10, seats: 1 },
  PRO: { priceMonthly: 79, contentLanguages: 3, listingsPerMonth: null, seats: 1 },
  TEAM: { priceMonthly: 199, contentLanguages: 8, listingsPerMonth: null, seats: 5 },
};

export type Feature =
  | "MARKETING"
  | "PHOTO_GUIDE"
  | "FOLLOW_UP_COACH"
  | "CRM"
  | "MICROSITES"
  | "CMA"
  | "TRANSACTIONS"
  | "TEAM_DASHBOARD"
  | "LEAD_ROUTING"
  | "WHITE_LABEL";

const FEATURE_MIN_PLAN: Record<Feature, Plan> = {
  MARKETING: "SOLO",
  PHOTO_GUIDE: "SOLO",
  FOLLOW_UP_COACH: "SOLO",
  CRM: "PRO",
  MICROSITES: "PRO",
  CMA: "PRO",
  TRANSACTIONS: "PRO",
  TEAM_DASHBOARD: "TEAM",
  LEAD_ROUTING: "TEAM",
  WHITE_LABEL: "TEAM",
};

export type BillingState = {
  plan: Plan;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: Date | null;
};

export const TRIAL_DAYS = 14;

/** The plan the tenant can use right now, or null if they need to (re)subscribe. */
export function effectivePlan(t: BillingState, now = new Date()): Plan | null {
  if (t.subscriptionStatus === "ACTIVE" || t.subscriptionStatus === "PAST_DUE") return t.plan;
  if (t.subscriptionStatus === "TRIALING") {
    if (!t.trialEndsAt || t.trialEndsAt > now) return t.plan;
  }
  return null;
}

export function planAtLeast(plan: Plan | null, min: Plan): boolean {
  if (!plan) return false;
  return PLAN_ORDER.indexOf(plan) >= PLAN_ORDER.indexOf(min);
}

export function hasFeature(t: BillingState, feature: Feature): boolean {
  return planAtLeast(effectivePlan(t), FEATURE_MIN_PLAN[feature]);
}

export function minPlanFor(feature: Feature): Plan {
  return FEATURE_MIN_PLAN[feature];
}

export function trialDaysLeft(t: BillingState, now = new Date()): number | null {
  if (t.subscriptionStatus !== "TRIALING" || !t.trialEndsAt) return null;
  return Math.max(0, Math.ceil((t.trialEndsAt.getTime() - now.getTime()) / 86_400_000));
}

/** `FeatureFlag.CRM_ENABLED(tenant)` style checks, as specified in the brief. */
export const FeatureFlag = {
  MARKETING_ENABLED: (t: BillingState) => hasFeature(t, "MARKETING"),
  PHOTO_GUIDE_ENABLED: (t: BillingState) => hasFeature(t, "PHOTO_GUIDE"),
  FOLLOW_UP_COACH_ENABLED: (t: BillingState) => hasFeature(t, "FOLLOW_UP_COACH"),
  CRM_ENABLED: (t: BillingState) => hasFeature(t, "CRM"),
  MICROSITES_ENABLED: (t: BillingState) => hasFeature(t, "MICROSITES"),
  CMA_ENABLED: (t: BillingState) => hasFeature(t, "CMA"),
  TRANSACTIONS_ENABLED: (t: BillingState) => hasFeature(t, "TRANSACTIONS"),
  TEAM_DASHBOARD_ENABLED: (t: BillingState) => hasFeature(t, "TEAM_DASHBOARD"),
  LEAD_ROUTING_ENABLED: (t: BillingState) => hasFeature(t, "LEAD_ROUTING"),
  WHITE_LABEL_ENABLED: (t: BillingState) => hasFeature(t, "WHITE_LABEL"),
} as const;

export class FeatureLockedError extends Error {
  constructor(
    public feature: Feature,
    public requiredPlan: Plan,
  ) {
    super(`Feature ${feature} requires the ${requiredPlan} plan`);
    this.name = "FeatureLockedError";
  }
}

export function assertFeature(t: BillingState, feature: Feature) {
  if (!hasFeature(t, feature)) throw new FeatureLockedError(feature, FEATURE_MIN_PLAN[feature]);
}

/** How many content languages this tenant may generate in. */
export function contentLanguageLimit(t: BillingState): number {
  const plan = effectivePlan(t);
  return plan ? PLANS[plan].contentLanguages : 0;
}
