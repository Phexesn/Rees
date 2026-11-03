"use server";

import type { DealStage } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { fieldErrorsFrom, formObject, type ActionState } from "@/lib/actions";
import { audit } from "@/lib/audit";
import { requireSetupContext, type AppContext } from "@/lib/auth/context";
import { checklistTemplate, DEAL_STAGES } from "@/lib/crm";

async function crmContext(): Promise<AppContext> {
  const ctx = await requireSetupContext();
  if (!ctx.can("CRM")) redirect("/pipeline");
  return ctx;
}

const DealSchema = z.object({
  title: z.string().min(1).max(160),
  contactId: z.string().min(1),
  propertyId: z.string().optional(),
  side: z.enum(["BUYER", "SELLER", "BOTH"]).default("BUYER"),
  stage: z.enum(DEAL_STAGES as [DealStage, ...DealStage[]]).default("NEW_LEAD"),
  value: z.coerce.number().int().min(0).optional(),
  commissionPct: z.coerce.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().optional(),
  contractDate: z.string().optional(),
  lostReason: z.string().max(300).optional(),
});

const toDate = (v?: string) => (v ? new Date(v) : null);

export async function createDealAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await crmContext();
  const parsed = DealSchema.safeParse(formObject(formData));
  if (!parsed.success) return { error: "errors.fixFields", fieldErrors: fieldErrorsFrom(parsed.error) };
  const d = parsed.data;
  const contact = await ctx.db.contact.findUnique({ where: { id: d.contactId } });
  if (!contact) return { error: "errors.notFound", fieldErrors: { contactId: "errors.required" } };
  const last = await ctx.db.deal.findFirst({ where: { stage: d.stage }, orderBy: { position: "desc" } });
  const deal = await ctx.db.deal.create({
    data: {
      tenantId: ctx.tenant.id,
      title: d.title,
      contactId: d.contactId,
      propertyId: d.propertyId || null,
      side: d.side,
      stage: d.stage,
      value: d.value ?? null,
      commissionPct: d.commissionPct ?? null,
      expectedCloseDate: toDate(d.expectedCloseDate),
      contractDate: toDate(d.contractDate),
      position: (last?.position ?? 0) + 1,
    },
  });
  if (ctx.can("TRANSACTIONS") && formData.get("withChecklist") === "on") {
    await ctx.db.checklistItem.createMany({
      data: checklistTemplate(d.side, deal.contractDate).map((item) => ({ tenantId: ctx.tenant.id, dealId: deal.id, ...item })),
    });
  }
  await audit({ tenantId: ctx.tenant.id, userId: ctx.user.id, action: "deal:create", entity: "deal", entityId: deal.id });
  redirect(`/deals/${deal.id}?created=1`);
}

export async function updateDealAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await crmContext();
  const id = String(formData.get("id") ?? "");
  const parsed = DealSchema.safeParse(formObject(formData));
  if (!parsed.success) return { error: "errors.fixFields", fieldErrors: fieldErrorsFrom(parsed.error) };
  const existing = await ctx.db.deal.findUnique({ where: { id } });
  if (!existing) return { error: "errors.notFound" };
  const d = parsed.data;
  await ctx.db.deal.update({
    where: { id },
    data: {
      title: d.title,
      contactId: d.contactId,
      propertyId: d.propertyId || null,
      side: d.side,
      stage: d.stage,
      value: d.value ?? null,
      commissionPct: d.commissionPct ?? null,
      expectedCloseDate: toDate(d.expectedCloseDate),
      contractDate: toDate(d.contractDate),
      lostReason: d.stage === "LOST" ? (d.lostReason ?? null) : null,
      closedAt: d.stage === "CLOSED" ? (existing.closedAt ?? new Date()) : null,
    },
  });
  if (existing.stage !== d.stage) await recordStageChange(ctx, id, existing.contactId, existing.stage, d.stage);
  await audit({ tenantId: ctx.tenant.id, userId: ctx.user.id, action: "deal:update", entity: "deal", entityId: id });
  redirect(`/deals/${id}?saved=1`);
}

async function recordStageChange(ctx: AppContext, dealId: string, contactId: string, from: DealStage, to: DealStage) {
  await ctx.db.activity.create({
    data: {
      tenantId: ctx.tenant.id,
      type: "STAGE_CHANGE",
      summary: `Moved from ${from.replace(/_/g, " ").toLowerCase()} to ${to.replace(/_/g, " ").toLowerCase()}`,
      dealId,
      contactId,
      userId: ctx.user.id,
    },
  });
  const contactStatus = to === "CLOSED" ? "PAST_CLIENT" : to === "ACTIVE" || to === "UNDER_CONTRACT" || to === "APPOINTMENT" ? "ACTIVE" : to === "NURTURE" ? "NURTURE" : null;
  if (contactStatus) {
    await ctx.db.contact.updateMany({ where: { id: contactId, status: { not: "DO_NOT_CONTACT" } }, data: { status: contactStatus } });
  }
  if (to === "CLOSED") {
    await ctx.db.contact.updateMany({ where: { id: contactId }, data: { roles: { push: "PAST_CLIENT" } } });
  }
}

/** Called by the kanban board (drag/drop or "Move to" menu). */
export async function moveDealAction(formData: FormData): Promise<void> {
  const ctx = await crmContext();
  const id = String(formData.get("id") ?? "");
  const stage = String(formData.get("stage") ?? "") as DealStage;
  const position = Number(formData.get("position") ?? 0);
  if (!DEAL_STAGES.includes(stage)) return;
  const deal = await ctx.db.deal.findUnique({ where: { id } });
  if (!deal) return;
  await ctx.db.deal.update({
    where: { id },
    data: {
      stage,
      position,
      closedAt: stage === "CLOSED" ? (deal.closedAt ?? new Date()) : null,
    },
  });
  if (deal.stage !== stage) {
    await recordStageChange(ctx, id, deal.contactId, deal.stage, stage);
    await audit({ tenantId: ctx.tenant.id, userId: ctx.user.id, action: "deal:stage", entity: "deal", entityId: id, metadata: { from: deal.stage, to: stage } });
  }
  revalidatePath("/pipeline");
}

export async function deleteDealAction(formData: FormData): Promise<void> {
  const ctx = await crmContext();
  const id = String(formData.get("id") ?? "");
  await ctx.db.deal.deleteMany({ where: { id } });
  await audit({ tenantId: ctx.tenant.id, userId: ctx.user.id, action: "deal:delete", entity: "deal", entityId: id });
  redirect("/pipeline?deleted=1");
}

export async function addChecklistAction(formData: FormData): Promise<void> {
  const ctx = await crmContext();
  if (!ctx.can("TRANSACTIONS")) return;
  const dealId = String(formData.get("dealId") ?? "");
  const deal = await ctx.db.deal.findUnique({ where: { id: dealId } });
  if (!deal) return;
  const existing = await ctx.db.checklistItem.count({ where: { dealId } });
  if (existing === 0) {
    await ctx.db.checklistItem.createMany({
      data: checklistTemplate(deal.side, deal.contractDate).map((item) => ({ tenantId: ctx.tenant.id, dealId, ...item })),
    });
    await audit({ tenantId: ctx.tenant.id, userId: ctx.user.id, action: "checklist:create", entity: "deal", entityId: dealId });
  }
  revalidatePath(`/deals/${dealId}`);
}

export async function addChecklistItemAction(formData: FormData): Promise<void> {
  const ctx = await crmContext();
  if (!ctx.can("TRANSACTIONS")) return;
  const dealId = String(formData.get("dealId") ?? "");
  const title = String(formData.get("title") ?? "").trim().slice(0, 200);
  const due = formData.get("dueAt");
  if (title) {
    const last = await ctx.db.checklistItem.findFirst({ where: { dealId }, orderBy: { position: "desc" } });
    await ctx.db.checklistItem.create({
      data: {
        tenantId: ctx.tenant.id,
        dealId,
        title,
        kind: typeof due === "string" && due ? "DEADLINE" : "TASK",
        dueAt: typeof due === "string" && due ? new Date(due) : null,
        position: (last?.position ?? 0) + 1,
      },
    });
  }
  revalidatePath(`/deals/${dealId}`);
}

export async function toggleChecklistItemAction(formData: FormData): Promise<void> {
  const ctx = await crmContext();
  const id = String(formData.get("id") ?? "");
  const item = await ctx.db.checklistItem.findUnique({ where: { id } });
  if (item) {
    await ctx.db.checklistItem.update({ where: { id }, data: { completedAt: item.completedAt ? null : new Date() } });
    revalidatePath(`/deals/${item.dealId}`);
  }
}

export async function setChecklistDueAction(formData: FormData): Promise<void> {
  const ctx = await crmContext();
  const id = String(formData.get("id") ?? "");
  const due = formData.get("dueAt");
  const item = await ctx.db.checklistItem.findUnique({ where: { id } });
  if (item) {
    await ctx.db.checklistItem.update({ where: { id }, data: { dueAt: typeof due === "string" && due ? new Date(due) : null } });
    revalidatePath(`/deals/${item.dealId}`);
  }
}
