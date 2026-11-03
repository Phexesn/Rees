"use server";

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireSetupContext } from "@/lib/auth/context";
import { outputToText, sendEmail } from "@/lib/email";
import { runGeneration } from "@/lib/generation/run";
import { audit } from "@/lib/audit";

export async function emailToSelfAction(formData: FormData): Promise<void> {
  const ctx = await requireSetupContext();
  const batchId = String(formData.get("batchId") ?? "");
  const rows = await ctx.db.generation.findMany({ where: { batchId }, orderBy: { language: "asc" } });
  if (!rows.length) redirect("/create");
  const tm = await getTranslations("modules");
  const property = rows[0].propertyId ? await ctx.db.property.findUnique({ where: { id: rows[0].propertyId } }) : null;
  const subject = `${tm(`${rows[0].moduleId}.name`)}${property ? ` — ${property.address}` : ""}`;
  const text = rows
    .filter((r) => r.output)
    .map((r) => `===== ${r.language.toUpperCase()} =====\n\n${outputToText(r.output)}`)
    .join("\n\n");
  const { sent } = await sendEmail({ to: ctx.profile?.email ?? ctx.user.email, subject, text });
  await audit({ tenantId: ctx.tenant.id, userId: ctx.user.id, action: "generation:email_self", entityId: batchId, metadata: { sent } });
  redirect(`/generations/${batchId}?emailed=${sent ? "1" : "0"}`);
}

export async function regenerateAction(formData: FormData): Promise<void> {
  const ctx = await requireSetupContext();
  const batchId = String(formData.get("batchId") ?? "");
  const rows = await ctx.db.generation.findMany({ where: { batchId } });
  if (!rows.length) redirect("/create");
  const first = rows[0];
  const result = await runGeneration(ctx, {
    moduleId: first.moduleId,
    propertyId: first.propertyId,
    contactId: first.contactId,
    input: (first.input ?? {}) as Record<string, unknown>,
    languages: rows.map((r) => r.language),
  });
  redirect(`/generations/${result.batchId}`);
}
