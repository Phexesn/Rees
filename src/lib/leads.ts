import "server-only";
import type { LeadSource, Microsite, Property } from "@prisma/client";
import { audit } from "@/lib/audit";
import { tenantDb, systemDb } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { env } from "@/lib/env";

export type LeadInput = {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  interest: string;
  message?: string;
  emailOptIn: boolean;
  smsConsent: boolean;
  consentText: string;
  workingWithAgent?: boolean;
  language: string;
};

/** Follow-up reminders created for every new lead (the "drip" is a reminder plan the agent works). */
const FOLLOW_UP_PLAN = [
  { inHours: 0.25, key: "call" },
  { inHours: 24, key: "text" },
  { inHours: 72, key: "email" },
  { inHours: 168, key: "checkin" },
] as const;

const TASK_TITLES: Record<(typeof FOLLOW_UP_PLAN)[number]["key"], (name: string, address: string) => string> = {
  call: (n, a) => `Call ${n} — new lead from ${a} (use Follow-Up Coach)`,
  text: (n) => `Text ${n} if you haven't connected yet`,
  email: (n) => `Email ${n} a helpful follow-up`,
  checkin: (n) => `Check in with ${n} — one week since they reached out`,
};

/**
 * Records a lead from a public page into the listing owner's CRM:
 * contact (deduplicated by email/phone), activity, deal, follow-up tasks,
 * and an email alert to the agent.
 */
export async function captureLead(
  microsite: Microsite & { property: Property },
  input: LeadInput,
  source: LeadSource,
): Promise<{ contactId: string }> {
  const tenantId = microsite.tenantId;
  const db = tenantDb(tenantId);
  const now = new Date();
  const consent = input.emailOptIn || input.smsConsent;

  const existing =
    input.email || input.phone
      ? await db.contact.findFirst({
          where: { OR: [input.email ? { email: input.email } : {}, input.phone ? { phone: input.phone } : {}].filter((c) => Object.keys(c).length) },
        })
      : null;

  const contact = existing
    ? await db.contact.update({
        where: { id: existing.id },
        data: {
          emailOptIn: existing.emailOptIn || input.emailOptIn,
          smsConsent: existing.smsConsent || input.smsConsent,
          ...(consent ? { consentAt: now, consentSource: `${source} ${microsite.slug}`, consentText: input.consentText } : {}),
        },
      })
    : await db.contact.create({
        data: {
          tenantId,
          firstName: input.firstName,
          lastName: input.lastName ?? null,
          email: input.email ?? null,
          phone: input.phone ?? null,
          roles: ["BUYER"],
          status: "NEW",
          source,
          sourceDetail: microsite.property.address,
          preferredLanguage: input.language,
          emailOptIn: input.emailOptIn,
          smsConsent: input.smsConsent,
          consentAt: consent ? now : null,
          consentSource: consent ? `${source} ${microsite.slug}` : null,
          consentText: consent ? input.consentText : null,
          tags: input.workingWithAgent ? ["has-agent"] : [],
        },
      });

  await db.activity.create({
    data: {
      tenantId,
      type: "LEAD",
      direction: "INBOUND",
      contactId: contact.id,
      summary: `${source === "OPEN_HOUSE" ? "Signed in at the open house" : "Asked about"} ${microsite.property.address}: ${input.interest}${
        input.message ? ` — "${input.message}"` : ""
      }`,
      metadata: { interest: input.interest, workingWithAgent: input.workingWithAgent ?? null, micrositeId: microsite.id },
    },
  });

  const openDeal = await db.deal.findFirst({
    where: { contactId: contact.id, propertyId: microsite.propertyId, stage: { notIn: ["CLOSED", "LOST"] } },
  });
  const deal =
    openDeal ??
    (await db.deal.create({
      data: {
        tenantId,
        title: `${input.firstName} — ${microsite.property.address}`,
        contactId: contact.id,
        propertyId: microsite.propertyId,
        side: "BUYER",
        stage: "NEW_LEAD",
        value: microsite.property.price,
      },
    }));

  const owner = await db.user.findFirst({ where: { role: "OWNER" }, orderBy: { createdAt: "asc" } });
  await db.task.createMany({
    data: FOLLOW_UP_PLAN.map((step, i) => ({
      tenantId,
      title: TASK_TITLES[step.key](input.firstName, microsite.property.address),
      dueAt: new Date(now.getTime() + step.inHours * 3_600_000),
      priority: i === 0 ? 1 : 2,
      contactId: contact.id,
      dealId: deal.id,
      assignedToId: owner?.id ?? null,
    })),
  });

  await audit({
    tenantId,
    action: "lead:captured",
    entity: "contact",
    entityId: contact.id,
    metadata: { source, micrositeId: microsite.id, duplicate: Boolean(existing) },
  });

  // Alert the agent. systemDb is not needed: profile lookup stays tenant-scoped.
  const profile = owner ? await db.agentProfile.findUnique({ where: { userId: owner.id } }) : null;
  const to = profile?.email ?? owner?.email;
  if (to) {
    await sendEmail({
      to,
      subject: `New lead: ${input.firstName} — ${microsite.property.address}`,
      text: [
        `${input.firstName} ${input.lastName ?? ""} reached out about ${microsite.property.address}.`,
        `Interest: ${input.interest}`,
        input.message ? `Message: ${input.message}` : "",
        input.email ? `Email: ${input.email}` : "",
        input.phone ? `Phone: ${input.phone}` : "",
        "",
        `Open their contact card: ${env.appUrl()}/contacts/${contact.id}`,
        `Get a call script: ${env.appUrl()}/create/follow-up-coach?contactId=${contact.id}&propertyId=${microsite.propertyId}`,
      ]
        .filter(Boolean)
        .join("\n"),
      replyTo: input.email,
    });
  }
  return { contactId: contact.id };
}

/** Public lookup by slug. systemDb: visitors have no session; the tenant comes from the page. */
export async function findPublishedMicrosite(slug: string) {
  const site = await systemDb().microsite.findUnique({ where: { slug }, include: { property: true } });
  if (!site || !site.published) return null;
  const profile = await systemDb().agentProfile.findFirst({
    where: { tenantId: site.tenantId, user: { role: "OWNER" } },
  });
  const tenant = await systemDb().tenant.findUnique({ where: { id: site.tenantId } });
  return { site, profile, tenant };
}

/** Best-effort in-memory rate limit for public forms (per server instance). */
const hits = new Map<string, number[]>();
export function rateLimited(key: string, max = 5, windowMs = 10 * 60_000): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > max;
}
