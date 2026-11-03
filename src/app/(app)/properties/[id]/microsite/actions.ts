"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { fieldErrorsFrom, formObject, type ActionState } from "@/lib/actions";
import { audit } from "@/lib/audit";
import { requireSetupContext } from "@/lib/auth/context";
import { runGeneration } from "@/lib/generation/run";
import { isUiLocale } from "@/lib/languages";

function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${base || "listing"}-${randomBytes(3).toString("hex")}`;
}

export async function createMicrositeAction(formData: FormData): Promise<void> {
  const ctx = await requireSetupContext();
  if (!ctx.can("MICROSITES")) redirect("/settings/billing?plan=PRO");
  const propertyId = String(formData.get("propertyId") ?? "");
  const property = await ctx.db.property.findUnique({ where: { id: propertyId }, include: { microsite: true } });
  if (!property) redirect("/properties");
  if (!property.microsite) {
    const language = isUiLocale(ctx.profile?.contentLanguage) ? ctx.profile!.contentLanguage : "en";
    const site = await ctx.db.microsite.create({
      data: {
        tenantId: ctx.tenant.id,
        propertyId,
        slug: slugify(`${property.address} ${property.city}`),
        language,
        headline: property.address,
        intro: property.features ?? null,
      },
    });
    await audit({ tenantId: ctx.tenant.id, userId: ctx.user.id, action: "microsite:create", entity: "microsite", entityId: site.id });
  }
  redirect(`/properties/${propertyId}/microsite`);
}

export async function writeMicrositeCopyAction(formData: FormData): Promise<void> {
  const ctx = await requireSetupContext();
  const propertyId = String(formData.get("propertyId") ?? "");
  const site = await ctx.db.microsite.findUnique({ where: { propertyId } });
  if (!site) redirect(`/properties/${propertyId}/microsite`);
  const language = ctx.contentLanguages.includes(site.language) ? site.language : (ctx.contentLanguages[0] ?? "en");
  const { generations } = await runGeneration(ctx, { moduleId: "microsite-copy", propertyId, input: {}, languages: [language] });
  const output = generations[0]?.output as { headline: string; intro: string; highlights: string[]; body: string } | null;
  if (!output) redirect(`/properties/${propertyId}/microsite?error=ai`);
  await ctx.db.microsite.update({
    where: { id: site.id },
    data: { headline: output.headline, intro: output.intro, highlights: output.highlights, body: output.body },
  });
  redirect(`/properties/${propertyId}/microsite?written=1`);
}

const SiteSchema = z.object({
  headline: z.string().min(1).max(140),
  intro: z.string().max(800).optional(),
  highlights: z.string().max(1500).optional(),
  body: z.string().max(5000).optional(),
  language: z.string().refine(isUiLocale),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export async function saveMicrositeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await requireSetupContext();
  if (!ctx.can("MICROSITES")) return { error: "locked.generic" };
  const propertyId = String(formData.get("propertyId") ?? "");
  const parsed = SiteSchema.safeParse(formObject(formData));
  if (!parsed.success) return { error: "errors.fixFields", fieldErrors: fieldErrorsFrom(parsed.error) };
  const site = await ctx.db.microsite.findUnique({ where: { propertyId } });
  if (!site) return { error: "errors.notFound" };
  const published = formData.get("published") === "on";
  await ctx.db.microsite.update({
    where: { id: site.id },
    data: {
      headline: parsed.data.headline,
      intro: parsed.data.intro ?? null,
      highlights: (parsed.data.highlights ?? "")
        .split("\n")
        .map((h) => h.replace(/^[-•*]\s*/, "").trim())
        .filter(Boolean)
        .slice(0, 12),
      body: parsed.data.body ?? null,
      language: parsed.data.language,
      accentColor: parsed.data.accentColor,
      showPrice: formData.get("showPrice") === "on",
      published,
    },
  });
  await audit({
    tenantId: ctx.tenant.id,
    userId: ctx.user.id,
    action: published && !site.published ? "microsite:publish" : "microsite:update",
    entity: "microsite",
    entityId: site.id,
  });
  revalidatePath(`/l/${site.slug}`);
  revalidatePath(`/properties/${propertyId}`);
  return { ok: true, message: published ? "published" : "saved" };
}
