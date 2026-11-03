"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { formObject } from "@/lib/actions";
import { audit } from "@/lib/audit";
import { requireContext } from "@/lib/auth/context";
import { contentLanguageLimit } from "@/lib/features";
import { isContentLanguage, isUiLocale } from "@/lib/languages";
import { PHONE_MODELS } from "@/modules/_shared/phones";
import { LOCALE_COOKIE } from "@/i18n/request";

const TONES = ["warm", "professional", "luxury", "friendly", "straightforward"] as const;

const Step1 = z.object({
  displayName: z.string().min(1).max(100),
  phone: z.string().max(40).optional(),
  brokerage: z.string().max(120).optional(),
  licenseNumber: z.string().max(40).optional(),
  licenseState: z.string().max(2).optional(),
});
const Step3 = z.object({
  brandTone: z.enum(TONES),
  brandVoiceNotes: z.string().max(600).optional(),
  wordsToAvoid: z.string().max(400).optional(),
});
const Step4 = z.object({
  phoneModel: z.enum(PHONE_MODELS).optional(),
  marketsServed: z.string().max(300).optional(),
});

export async function saveSetupStep(formData: FormData): Promise<void> {
  const ctx = await requireContext();
  const step = Number(formData.get("step"));
  const data = formObject(formData);
  const profileWhere = { userId: ctx.user.id };

  if (step === 1) {
    const parsed = Step1.safeParse(data);
    if (!parsed.success) redirect("/setup?step=1&error=1");
    await ctx.db.agentProfile.update({
      where: profileWhere,
      data: {
        displayName: parsed.data.displayName,
        phone: parsed.data.phone ?? null,
        brokerage: parsed.data.brokerage ?? null,
        licenseNumber: parsed.data.licenseNumber ?? null,
        licenseState: parsed.data.licenseState?.toUpperCase() ?? null,
      },
    });
  } else if (step === 2) {
    const uiLocale = data.uiLocale;
    const primary = data.contentLanguage;
    const extras = formData.getAll("extraLanguages").filter((v): v is string => typeof v === "string" && isContentLanguage(v));
    const limit = contentLanguageLimit(ctx.tenant);
    if (!primary || !isContentLanguage(primary)) redirect("/setup?step=2&error=1");
    if (isUiLocale(uiLocale)) {
      await ctx.db.user.update({ where: { id: ctx.user.id }, data: { locale: uiLocale } });
      (await cookies()).set(LOCALE_COOKIE, uiLocale, { path: "/", maxAge: 31_536_000, sameSite: "lax" });
    }
    await ctx.db.agentProfile.update({
      where: profileWhere,
      data: {
        contentLanguage: primary,
        extraLanguages: extras.filter((l) => l !== primary).slice(0, Math.max(0, limit - 1)),
      },
    });
  } else if (step === 3) {
    const parsed = Step3.safeParse(data);
    if (!parsed.success) redirect("/setup?step=3&error=1");
    await ctx.db.agentProfile.update({
      where: profileWhere,
      data: {
        brandTone: parsed.data.brandTone,
        brandVoiceNotes: parsed.data.brandVoiceNotes ?? null,
        wordsToAvoid: parsed.data.wordsToAvoid ?? null,
      },
    });
  } else if (step === 4) {
    const parsed = Step4.safeParse(data);
    if (!parsed.success) redirect("/setup?step=4&error=1");
    await ctx.db.agentProfile.update({
      where: profileWhere,
      data: { phoneModel: parsed.data.phoneModel ?? null, marketsServed: parsed.data.marketsServed ?? null },
    });
  } else if (step === 5) {
    await ctx.db.agentProfile.update({ where: profileWhere, data: { setupCompletedAt: new Date() } });
    await audit({ tenantId: ctx.tenant.id, userId: ctx.user.id, action: "setup:completed" });
    redirect(formData.get("next") === "listing" ? "/properties/new" : "/dashboard");
  }
  redirect(`/setup?step=${step + 1}`);
}
