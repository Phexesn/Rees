import "server-only";
import type { Plan, SubscriptionStatus } from "@prisma/client";
import Stripe from "stripe";
import { env } from "@/lib/env";
import { log } from "@/lib/log";

let stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = env.stripeSecret();
  if (!key) return null;
  stripe ??= new Stripe(key);
  return stripe;
}

export function priceIdFor(plan: Plan): string | undefined {
  return env.stripePrice(plan);
}

export function planForPriceId(priceId: string | undefined | null): Plan | null {
  if (!priceId) return null;
  for (const plan of ["SOLO", "PRO", "TEAM"] as const) {
    if (env.stripePrice(plan) === priceId) return plan;
  }
  log("warn", "stripe_unknown_price", { priceId });
  return null;
}

export function statusFromStripe(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "trialing":
      return "TRIALING";
    case "past_due":
    case "unpaid":
      return "PAST_DUE";
    case "canceled":
    case "incomplete_expired":
      return "CANCELED";
    default:
      return "NONE";
  }
}

/** Fields to write on the tenant from a Stripe subscription object. */
export function tenantBillingFromSubscription(sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  const plan = planForPriceId(item?.price.id);
  const periodEnd = item?.current_period_end;
  return {
    ...(plan ? { plan } : {}),
    subscriptionStatus: statusFromStripe(sub.status),
    stripeSubscriptionId: sub.id,
    stripeCustomerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
  };
}
