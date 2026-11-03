"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { fieldErrorsFrom, formObject, type ActionState } from "@/lib/actions";
import { audit } from "@/lib/audit";
import { requireContext } from "@/lib/auth/context";
import { contentLanguageLimit } from "@/lib/features";
import { isContentLanguage } from "@/lib/languages";
import { PHONE_MODELS } from "@/modules/_shared/phones";

const ProfileSchema = z.object({
  displayName: z.string().min(1).max(100),
  email: z.email().max(200).optional(),
  phone: z.string().max(40).optional(),
  brokerage: z.string().max(120).optional(),
  brokeragePhone: z.string().max(40).optional(),
  licenseNumber: z.string().max(40).optional(),
  licenseState: z.string().max(2).optional(),
  mlsId: z.string().max(40).optional(),
  marketsServed: z.string().max(300).optional(),
  headshotUrl: z.url().max(1000).optional(),
  bio: z.string().max(1500).optional(),
  brandTone: z.enum(["warm", "professional", "luxury", "friendly", "straightforward"]),
  brandVoiceNotes: z.string().max(600).optional(),
  wordsToAvoid: z.string().max(400).optional(),
  signature: z.string().max(600).optional(),
  phoneModel: z.enum(PHONE_MODELS).optional(),
  contentLanguage: z.string().refine(isContentLanguage),
});

export async function saveProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await requireContext();
  const parsed = ProfileSchema.safeParse(formObject(formData));
  if (!parsed.success) return { error: "errors.fixFields", fieldErrors: fieldErrorsFrom(parsed.error) };
  const extras = formData
    .getAll("extraLanguages")
    .filter((v): v is string => typeof v === "string" && isContentLanguage(v) && v !== parsed.data.contentLanguage)
    .slice(0, Math.max(0, contentLanguageLimit(ctx.tenant) - 1));
  const d = parsed.data;
  await ctx.db.agentProfile.update({
    where: { userId: ctx.user.id },
    data: {
      displayName: d.displayName,
      email: d.email ?? null,
      phone: d.phone ?? null,
      brokerage: d.brokerage ?? null,
      brokeragePhone: d.brokeragePhone ?? null,
      licenseNumber: d.licenseNumber ?? null,
      licenseState: d.licenseState?.toUpperCase() ?? null,
      mlsId: d.mlsId ?? null,
      marketsServed: d.marketsServed ?? null,
      headshotUrl: d.headshotUrl ?? null,
      bio: d.bio ?? null,
      brandTone: d.brandTone,
      brandVoiceNotes: d.brandVoiceNotes ?? null,
      wordsToAvoid: d.wordsToAvoid ?? null,
      signature: d.signature ?? null,
      phoneModel: d.phoneModel ?? null,
      contentLanguage: d.contentLanguage,
      extraLanguages: extras,
    },
  });
  await audit({ tenantId: ctx.tenant.id, userId: ctx.user.id, action: "settings:profile" });
  revalidatePath("/settings");
  return { ok: true };
}

const BrandSchema = z.object({
  brandName: z.string().max(80).optional(),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  logoUrl: z.url().max(1000).optional(),
});

export async function saveBrandAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await requireContext();
  if (!ctx.can("WHITE_LABEL")) return { error: "locked.generic" };
  if (ctx.user.role === "AGENT") return { error: "billing.errors.owner" };
  const parsed = BrandSchema.safeParse(formObject(formData));
  if (!parsed.success) return { error: "errors.fixFields", fieldErrors: fieldErrorsFrom(parsed.error) };
  await ctx.db.tenant.update({
    where: { id: ctx.tenant.id },
    data: { brandName: parsed.data.brandName ?? null, brandColor: parsed.data.brandColor ?? null, logoUrl: parsed.data.logoUrl ?? null },
  });
  await audit({ tenantId: ctx.tenant.id, userId: ctx.user.id, action: "settings:brand" });
  revalidatePath("/settings");
  return { ok: true };
}
