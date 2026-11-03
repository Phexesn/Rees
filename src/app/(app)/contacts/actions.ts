"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { fieldErrorsFrom, formObject, type ActionState } from "@/lib/actions";
import { audit } from "@/lib/audit";
import { requireSetupContext, type AppContext } from "@/lib/auth/context";
import { ACTIVITY_TYPES, CONTACT_ROLES, CONTACT_STATUSES, LEAD_SOURCES } from "@/lib/crm";

async function crmContext(): Promise<AppContext> {
  const ctx = await requireSetupContext();
  if (!ctx.can("CRM")) redirect("/contacts");
  return ctx;
}

const ContactSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().max(80).optional(),
  email: z.email().max(200).optional(),
  phone: z.string().max(40).optional(),
  status: z.enum(CONTACT_STATUSES).default("NEW"),
  source: z.enum(LEAD_SOURCES).default("OTHER"),
  sourceDetail: z.string().max(200).optional(),
  preferredLanguage: z.string().max(10).optional(),
  tags: z.string().max(400).optional(),
  priceMin: z.coerce.number().int().min(0).optional(),
  priceMax: z.coerce.number().int().min(0).optional(),
  bedsMin: z.coerce.number().min(0).max(30).optional(),
  bathsMin: z.coerce.number().min(0).max(30).optional(),
  areas: z.string().max(300).optional(),
  mustHaves: z.string().max(600).optional(),
  timeline: z.string().max(100).optional(),
  lender: z.string().max(120).optional(),
});

function contactData(formData: FormData, parsed: z.infer<typeof ContactSchema>) {
  const roles = formData.getAll("roles").filter((r): r is string => typeof r === "string" && (CONTACT_ROLES as readonly string[]).includes(r));
  const propertyTypes = formData.getAll("propertyTypes").filter((r): r is string => typeof r === "string");
  return {
    firstName: parsed.firstName,
    lastName: parsed.lastName ?? null,
    email: parsed.email?.toLowerCase() ?? null,
    phone: parsed.phone ?? null,
    status: parsed.status,
    source: parsed.source,
    sourceDetail: parsed.sourceDetail ?? null,
    preferredLanguage: parsed.preferredLanguage ?? null,
    tags: (parsed.tags ?? "")
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 20),
    roles,
    propertyTypes,
    priceMin: parsed.priceMin ?? null,
    priceMax: parsed.priceMax ?? null,
    bedsMin: parsed.bedsMin ?? null,
    bathsMin: parsed.bathsMin ?? null,
    areas: parsed.areas ?? null,
    mustHaves: parsed.mustHaves ?? null,
    timeline: parsed.timeline ?? null,
    preApproved: formData.get("preApproved") === "on",
    lender: parsed.lender ?? null,
  };
}

export async function createContactAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await crmContext();
  const parsed = ContactSchema.safeParse(formObject(formData));
  if (!parsed.success) return { error: "errors.fixFields", fieldErrors: fieldErrorsFrom(parsed.error) };
  const contact = await ctx.db.contact.create({ data: { tenantId: ctx.tenant.id, ...contactData(formData, parsed.data) } });
  await audit({ tenantId: ctx.tenant.id, userId: ctx.user.id, action: "contact:create", entity: "contact", entityId: contact.id });
  redirect(`/contacts/${contact.id}?created=1`);
}

export async function updateContactAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await crmContext();
  const id = String(formData.get("id") ?? "");
  const parsed = ContactSchema.safeParse(formObject(formData));
  if (!parsed.success) return { error: "errors.fixFields", fieldErrors: fieldErrorsFrom(parsed.error) };
  const data = contactData(formData, parsed.data);
  const updated = await ctx.db.contact.updateMany({ where: { id }, data });
  if (!updated.count) return { error: "errors.notFound" };
  await audit({ tenantId: ctx.tenant.id, userId: ctx.user.id, action: "contact:update", entity: "contact", entityId: id });
  redirect(`/contacts/${id}?saved=1`);
}

export async function deleteContactAction(formData: FormData): Promise<void> {
  const ctx = await crmContext();
  const id = String(formData.get("id") ?? "");
  await ctx.db.contact.deleteMany({ where: { id } });
  await audit({ tenantId: ctx.tenant.id, userId: ctx.user.id, action: "contact:delete", entity: "contact", entityId: id });
  redirect("/contacts?deleted=1");
}

export async function addNoteAction(formData: FormData): Promise<void> {
  const ctx = await crmContext();
  const body = String(formData.get("body") ?? "").trim().slice(0, 4000);
  const contactId = (formData.get("contactId") as string) || null;
  const dealId = (formData.get("dealId") as string) || null;
  if (body) {
    const note = await ctx.db.note.create({ data: { tenantId: ctx.tenant.id, body, contactId, dealId, authorId: ctx.user.id } });
    await audit({ tenantId: ctx.tenant.id, userId: ctx.user.id, action: "note:create", entity: "note", entityId: note.id });
  }
  revalidatePath(contactId ? `/contacts/${contactId}` : `/deals/${dealId}`);
}

const ActivitySchema = z.object({
  type: z.enum(ACTIVITY_TYPES),
  direction: z.enum(["INBOUND", "OUTBOUND", "NONE"]).default("OUTBOUND"),
  summary: z.string().min(1).max(2000),
  occurredAt: z.string().optional(),
});

export async function logActivityAction(formData: FormData): Promise<void> {
  const ctx = await crmContext();
  const contactId = (formData.get("contactId") as string) || null;
  const dealId = (formData.get("dealId") as string) || null;
  const parsed = ActivitySchema.safeParse(formObject(formData));
  if (parsed.success) {
    const occurredAt = parsed.data.occurredAt ? new Date(parsed.data.occurredAt) : new Date();
    const activity = await ctx.db.activity.create({
      data: {
        tenantId: ctx.tenant.id,
        type: parsed.data.type,
        direction: parsed.data.direction,
        summary: parsed.data.summary,
        occurredAt,
        contactId,
        dealId,
        userId: ctx.user.id,
      },
    });
    if (contactId && parsed.data.direction === "OUTBOUND") {
      await ctx.db.contact.updateMany({
        where: { id: contactId, status: "NEW" },
        data: { status: "NURTURE" },
      });
      await ctx.db.contact.updateMany({ where: { id: contactId }, data: { lastContactedAt: occurredAt } });
    }
    await audit({ tenantId: ctx.tenant.id, userId: ctx.user.id, action: "activity:create", entity: "activity", entityId: activity.id });
  }
  revalidatePath(contactId ? `/contacts/${contactId}` : `/deals/${dealId}`);
}

export async function addTaskAction(formData: FormData): Promise<void> {
  const ctx = await crmContext();
  const title = String(formData.get("title") ?? "").trim().slice(0, 200);
  const due = formData.get("dueAt");
  const contactId = (formData.get("contactId") as string) || null;
  const dealId = (formData.get("dealId") as string) || null;
  if (title) {
    const task = await ctx.db.task.create({
      data: {
        tenantId: ctx.tenant.id,
        title,
        dueAt: typeof due === "string" && due ? new Date(due) : null,
        contactId,
        dealId,
        assignedToId: ctx.user.id,
      },
    });
    await audit({ tenantId: ctx.tenant.id, userId: ctx.user.id, action: "task:create", entity: "task", entityId: task.id });
  }
  const back = formData.get("back");
  revalidatePath(typeof back === "string" ? back : "/tasks");
}

export async function toggleTaskAction(formData: FormData): Promise<void> {
  const ctx = await crmContext();
  const id = String(formData.get("id") ?? "");
  const task = await ctx.db.task.findUnique({ where: { id } });
  if (task) {
    await ctx.db.task.update({ where: { id }, data: { completedAt: task.completedAt ? null : new Date() } });
    await audit({ tenantId: ctx.tenant.id, userId: ctx.user.id, action: task.completedAt ? "task:reopen" : "task:complete", entity: "task", entityId: id });
  }
  const back = formData.get("back");
  revalidatePath(typeof back === "string" ? back : "/tasks");
}

export async function saveViewAction(formData: FormData): Promise<void> {
  const ctx = await crmContext();
  const name = String(formData.get("name") ?? "").trim().slice(0, 60);
  const filters: Prisma.InputJsonObject = {
    q: String(formData.get("q") ?? ""),
    status: String(formData.get("status") ?? ""),
    role: String(formData.get("role") ?? ""),
    tag: String(formData.get("tag") ?? ""),
    source: String(formData.get("source") ?? ""),
  };
  if (name) {
    await ctx.db.savedView.create({ data: { tenantId: ctx.tenant.id, userId: ctx.user.id, name, filters } });
    await audit({ tenantId: ctx.tenant.id, userId: ctx.user.id, action: "view:create" });
  }
  revalidatePath("/contacts");
}

export async function deleteViewAction(formData: FormData): Promise<void> {
  const ctx = await crmContext();
  await ctx.db.savedView.deleteMany({ where: { id: String(formData.get("id") ?? ""), userId: ctx.user.id } });
  revalidatePath("/contacts");
}
