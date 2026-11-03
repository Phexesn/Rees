import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { getStripe, tenantBillingFromSubscription } from "@/lib/billing";
import { systemDb } from "@/lib/db";
import { env } from "@/lib/env";
import { log } from "@/lib/log";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

/**
 * Stripe → tenant subscription sync. Idempotent (StripeEvent table).
 * systemDb: webhooks arrive without a user session; the tenant is looked up
 * from Stripe metadata / customer id.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = env.stripeWebhookSecret();
  if (!stripe || !secret) return NextResponse.json({ error: "billing not configured" }, { status: 503 });

  const signature = request.headers.get("stripe-signature");
  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature ?? "", secret);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const db = systemDb();
  const seen = await db.stripeEvent.findUnique({ where: { id: event.id } });
  if (seen) return NextResponse.json({ received: true, duplicate: true });

  const findTenant = async (tenantId: string | null | undefined, customerId: string | null | undefined) => {
    if (tenantId) return db.tenant.findUnique({ where: { id: tenantId } });
    if (customerId) return db.tenant.findUnique({ where: { stripeCustomerId: customerId } });
    return null;
  };

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const tenant = await findTenant(
          session.client_reference_id ?? session.metadata?.tenantId,
          typeof session.customer === "string" ? session.customer : session.customer?.id,
        );
        if (tenant && session.subscription) {
          const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          await db.tenant.update({ where: { id: tenant.id }, data: tenantBillingFromSubscription(sub) });
          await audit({ tenantId: tenant.id, action: "billing:subscribed", metadata: { subscription: sub.id } });
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const tenant = await findTenant(
          sub.metadata?.tenantId,
          typeof sub.customer === "string" ? sub.customer : sub.customer.id,
        );
        if (tenant) {
          await db.tenant.update({ where: { id: tenant.id }, data: tenantBillingFromSubscription(sub) });
          await audit({ tenantId: tenant.id, action: `billing:${event.type.split(".").pop()}`, metadata: { status: sub.status } });
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const tenant = await findTenant(null, typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id);
        if (tenant) {
          await db.tenant.update({ where: { id: tenant.id }, data: { subscriptionStatus: "PAST_DUE" } });
          await audit({ tenantId: tenant.id, action: "billing:payment_failed" });
        }
        break;
      }
      default:
        break;
    }
    await db.stripeEvent.create({ data: { id: event.id, type: event.type } });
  } catch (error) {
    log("error", "stripe_webhook_failed", { type: event.type, error: String(error) });
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
