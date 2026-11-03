"use server";

import type { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/lib/actions";
import { audit } from "@/lib/audit";
import { requireSetupContext } from "@/lib/auth/context";
import { CompSchema, computeCma, describeCma, SettingsSchema, SubjectSchema } from "@/lib/cma";
import { runGeneration } from "@/lib/generation/run";
import { log } from "@/lib/log";

const PayloadSchema = z.object({
  title: z.string().min(1).max(160),
  propertyId: z.string().optional(),
  language: z.string().min(2).max(10),
  audience: z.enum(["seller", "buyer"]).default("seller"),
  subject: SubjectSchema,
  comps: z.array(CompSchema).min(1).max(10),
  settings: SettingsSchema,
});

export async function createCmaAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await requireSetupContext();
  if (!ctx.can("CMA")) return { error: "locked.generic" };
  let payload: unknown;
  try {
    payload = JSON.parse(String(formData.get("payload") ?? "{}"));
  } catch {
    return { error: "errors.generic" };
  }
  const parsed = PayloadSchema.safeParse(payload);
  if (!parsed.success) {
    log("warn", "cma_invalid_payload", { issues: parsed.error.issues.slice(0, 5).map((i) => i.path.join(".")) });
    return { error: "cma.errors.invalid" };
  }
  const d = parsed.data;
  if (!ctx.contentLanguages.includes(d.language)) return { error: "create.errors.language_not_allowed" };

  const result = computeCma(d.subject, d.comps, d.settings);
  const cma = await ctx.db.cma.create({
    data: {
      tenantId: ctx.tenant.id,
      propertyId: d.propertyId || null,
      title: d.title,
      subject: d.subject as Prisma.InputJsonValue,
      comps: d.comps as Prisma.InputJsonValue,
      settings: d.settings as Prisma.InputJsonValue,
      result: result as unknown as Prisma.InputJsonValue,
      language: d.language,
    },
  });
  await audit({ tenantId: ctx.tenant.id, userId: ctx.user.id, action: "cma:create", entity: "cma", entityId: cma.id });

  try {
    const { generations } = await runGeneration(ctx, {
      moduleId: "cma-narrative",
      propertyId: d.propertyId || null,
      input: { analysis: describeCma(d.subject, result), audience: d.audience },
      languages: [d.language],
    });
    const narrative = generations[0]?.output;
    if (narrative) await ctx.db.cma.update({ where: { id: cma.id }, data: { narrative: narrative as Prisma.InputJsonValue } });
  } catch (error) {
    log("warn", "cma_narrative_failed", { cmaId: cma.id, error: String(error) });
  }
  redirect(`/cma/${cma.id}`);
}

export async function rewriteNarrativeAction(formData: FormData): Promise<void> {
  const ctx = await requireSetupContext();
  if (!ctx.can("CMA")) redirect("/cma");
  const id = String(formData.get("id") ?? "");
  const cma = await ctx.db.cma.findUnique({ where: { id } });
  if (!cma) redirect("/cma");
  const subject = SubjectSchema.parse(cma.subject);
  const comps = z.array(CompSchema).parse(cma.comps);
  const settings = SettingsSchema.parse(cma.settings);
  const result = computeCma(subject, comps, settings);
  const { generations } = await runGeneration(ctx, {
    moduleId: "cma-narrative",
    propertyId: cma.propertyId,
    input: { analysis: describeCma(subject, result), audience: "seller" },
    languages: [ctx.contentLanguages.includes(cma.language) ? cma.language : (ctx.contentLanguages[0] ?? "en")],
  });
  const narrative = generations[0]?.output;
  if (narrative) await ctx.db.cma.update({ where: { id }, data: { narrative: narrative as Prisma.InputJsonValue } });
  redirect(`/cma/${id}?rewritten=1`);
}

export async function deleteCmaAction(formData: FormData): Promise<void> {
  const ctx = await requireSetupContext();
  const id = String(formData.get("id") ?? "");
  await ctx.db.cma.deleteMany({ where: { id } });
  await audit({ tenantId: ctx.tenant.id, userId: ctx.user.id, action: "cma:delete", entity: "cma", entityId: id });
  redirect("/cma");
}
