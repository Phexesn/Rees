"use server";

import type { Plan } from "@prisma/client";
import { redirect } from "next/navigation";
import { audit } from "@/lib/audit";
import { getStripe, priceIdFor } from "@/lib/billing";
import { requireContext } from "@/lib/auth/context";
import { env } from "@/lib/env";

function parsePlan(value: FormDataEntryValue | null): Plan | null {
  return value === "SOLO" || value === "PRO" || value === "TEAM" ? value : null;
}

export async function startCheckoutAction(formData: FormData): Promise<void> {
  const ctx = await requireContext();
  const plan = parsePlan(formData.get("plan"));
  if (!plan) redirect("/settings/billing?error=plan");
  if (ctx.user.role === "AGENT") redirect("/settings/billing?error=owner");

  const stripe = getStripe();
  if (!stripe) {
    if (env.devBillingEnabled()) {
      // Dev billing: switch plan instantly so every tier can be tested locally.
      await ctx.db.tenant.update({
        where: { id: ctx.tenant.id },
        data: { plan, subscriptionStatus: "ACTIVE", trialEndsAt: null },
      });
      await audit({ tenantId: ctx.tenant.id, userId: ctx.user.id, action: "billing:dev_set_plan", metadata: { plan } });
      redirect("/settings/billing?success=1");
    }
    redirect("/settings/billing?error=not_configured");
  }

  const price = priceIdFor(plan);
  if (!price) redirect("/settings/billing?error=not_configured");

  let customerId = ctx.tenant.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: ctx.user.email,
      name: ctx.profile?.displayName ?? ctx.user.name,
      metadata: { tenantId: ctx.tenant.id },
    });
    customerId = customer.id;
    await ctx.db.tenant.update({ where: { id: ctx.tenant.id }, data: { stripeCustomerId: customerId } });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: ctx.tenant.id,
    line_items: [{ price, quantity: 1 }],
    allow_promotion_codes: true,
    subscription_data: { metadata: { tenantId: ctx.tenant.id } },
    metadata: { tenantId: ctx.tenant.id, plan },
    success_url: `${env.appUrl()}/settings/billing?success=1`,
    cancel_url: `${env.appUrl()}/settings/billing?canceled=1`,
  });
  await audit({ tenantId: ctx.tenant.id, userId: ctx.user.id, action: "billing:checkout_started", metadata: { plan } });
  redirect(session.url ?? "/settings/billing?error=stripe");
}

export async function openPortalAction(): Promise<void> {
  const ctx = await requireContext();
  const stripe = getStripe();
  if (!stripe || !ctx.tenant.stripeCustomerId) redirect("/settings/billing");
  const portal = await stripe.billingPortal.sessions.create({
    customer: ctx.tenant.stripeCustomerId,
    return_url: `${env.appUrl()}/settings/billing`,
  });
  redirect(portal.url);
}
