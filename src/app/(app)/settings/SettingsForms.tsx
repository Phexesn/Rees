"use client";

import type { AgentProfile, Tenant } from "@prisma/client";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { saveBrandAction, saveProfileAction } from "@/app/(app)/settings/actions";
import { Alert, Checkbox, Field, Input, Select, Textarea } from "@/components/ui";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialActionState } from "@/lib/actions";
import { CONTENT_LANGUAGES } from "@/lib/languages";
import { US_STATES } from "@/lib/us-states";
import { PHONE_MODELS } from "@/modules/_shared/phones";

const TONES = ["warm", "professional", "luxury", "friendly", "straightforward"] as const;
const section = "space-y-6 rounded-2xl border-2 border-slate-200 bg-white p-6";

export function ProfileForm({ profile, languageLimit }: { profile: AgentProfile; languageLimit: number }) {
  const t = useTranslations("settings");
  const ts = useTranslations("setup");
  const tc = useTranslations("common");
  const tr = useTranslations();
  const [state, action] = useActionState(saveProfileAction, initialActionState);
  const err = (f: string) => (state.fieldErrors?.[f] ? tr(state.fieldErrors[f]) : undefined);
  const opt = { optional: true, optionalLabel: tc("optional") };

  return (
    <form action={action} className="space-y-8">
      {state.ok ? <Alert tone="success">{t("saved")}</Alert> : null}
      {state.error ? <Alert tone="error">{tr(state.error)}</Alert> : null}

      <fieldset className={section}>
        <legend className="px-2 text-2xl font-bold">👤 {t("profileSection")}</legend>
        <Field label={ts("step1.displayName")} htmlFor="displayName" error={err("displayName")}>
          <Input id="displayName" name="displayName" defaultValue={profile.displayName} required />
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={t("publicEmail")} htmlFor="email" hint={t("publicEmailHint")} error={err("email")} {...opt}>
            <Input id="email" name="email" type="email" defaultValue={profile.email ?? ""} />
          </Field>
          <Field label={ts("step1.phone")} htmlFor="phone" {...opt}>
            <Input id="phone" name="phone" type="tel" defaultValue={profile.phone ?? ""} />
          </Field>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={ts("step1.brokerage")} htmlFor="brokerage" {...opt}>
            <Input id="brokerage" name="brokerage" defaultValue={profile.brokerage ?? ""} />
          </Field>
          <Field label={t("brokeragePhone")} htmlFor="brokeragePhone" {...opt}>
            <Input id="brokeragePhone" name="brokeragePhone" type="tel" defaultValue={profile.brokeragePhone ?? ""} />
          </Field>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <Field label={ts("step1.license")} htmlFor="licenseNumber" {...opt}>
            <Input id="licenseNumber" name="licenseNumber" defaultValue={profile.licenseNumber ?? ""} />
          </Field>
          <Field label={ts("step1.state")} htmlFor="licenseState" {...opt}>
            <Select id="licenseState" name="licenseState" defaultValue={profile.licenseState ?? ""}>
              <option value="">—</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label={t("mlsId")} htmlFor="mlsId" {...opt}>
            <Input id="mlsId" name="mlsId" defaultValue={profile.mlsId ?? ""} />
          </Field>
        </div>
        <Field label={ts("step4.markets")} htmlFor="marketsServed" {...opt}>
          <Input id="marketsServed" name="marketsServed" defaultValue={profile.marketsServed ?? ""} />
        </Field>
        <Field label={t("headshotUrl")} htmlFor="headshotUrl" hint={t("headshotUrlHint")} error={err("headshotUrl")} {...opt}>
          <Input id="headshotUrl" name="headshotUrl" type="url" defaultValue={profile.headshotUrl ?? ""} />
        </Field>
        <Field label={t("bio")} htmlFor="bio" hint={t("bioHint")} {...opt}>
          <Textarea id="bio" name="bio" defaultValue={profile.bio ?? ""} />
        </Field>
      </fieldset>

      <fieldset className={section}>
        <legend className="px-2 text-2xl font-bold">🎙️ {t("voiceSection")}</legend>
        <Field label={ts("step3.tone")} htmlFor="brandTone">
          <Select id="brandTone" name="brandTone" defaultValue={profile.brandTone}>
            {TONES.map((tone) => (
              <option key={tone} value={tone}>{ts(`step3.tones.${tone}.name`)}</option>
            ))}
          </Select>
        </Field>
        <Field label={ts("step3.voiceNotes")} htmlFor="brandVoiceNotes" hint={ts("step3.voiceNotesHint")} {...opt}>
          <Textarea id="brandVoiceNotes" name="brandVoiceNotes" defaultValue={profile.brandVoiceNotes ?? ""} />
        </Field>
        <Field label={ts("step3.wordsToAvoid")} htmlFor="wordsToAvoid" hint={ts("step3.wordsToAvoidHint")} {...opt}>
          <Input id="wordsToAvoid" name="wordsToAvoid" defaultValue={profile.wordsToAvoid ?? ""} />
        </Field>
        <Field label={t("signature")} htmlFor="signature" hint={t("signatureHint")} {...opt}>
          <Textarea id="signature" name="signature" defaultValue={profile.signature ?? ""} />
        </Field>
      </fieldset>

      <fieldset className={section}>
        <legend className="px-2 text-2xl font-bold">🌐 {t("languagesSection")}</legend>
        <Field label={ts("step2.contentLanguage")} htmlFor="contentLanguage" hint={ts("step2.contentLanguageHint")}>
          <Select id="contentLanguage" name="contentLanguage" defaultValue={profile.contentLanguage}>
            {CONTENT_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.native}</option>
            ))}
          </Select>
        </Field>
        {languageLimit > 1 ? (
          <div className="space-y-3">
            <p className="text-lg font-semibold">{ts("step2.extraLanguages", { count: languageLimit - 1 })}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {CONTENT_LANGUAGES.map((l) => (
                <Checkbox key={l.code} name="extraLanguages" value={l.code} label={l.native} defaultChecked={profile.extraLanguages.includes(l.code)} />
              ))}
            </div>
          </div>
        ) : (
          <Alert tone="info">{ts("step2.soloLimit")}</Alert>
        )}
        <Field label={ts("step4.phone")} htmlFor="phoneModel" hint={ts("step4.phoneHint")} {...opt}>
          <Select id="phoneModel" name="phoneModel" defaultValue={profile.phoneModel ?? ""}>
            <option value="">{ts("step4.phonePick")}</option>
            {PHONE_MODELS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </Select>
        </Field>
      </fieldset>

      <SubmitButton pendingText={tc("saving")} size="xl">{t("saveButton")}</SubmitButton>
    </form>
  );
}

export function BrandForm({ tenant }: { tenant: Tenant }) {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const tr = useTranslations();
  const [state, action] = useActionState(saveBrandAction, initialActionState);
  const err = (f: string) => (state.fieldErrors?.[f] ? tr(state.fieldErrors[f]) : undefined);
  const opt = { optional: true, optionalLabel: tc("optional") };
  return (
    <form action={action} className={section}>
      <h2 className="text-2xl font-bold">🏷️ {t("whiteLabelSection")}</h2>
      <p className="text-lg text-slate-700">{t("whiteLabelIntro")}</p>
      {state.ok ? <Alert tone="success">{t("saved")}</Alert> : null}
      {state.error ? <Alert tone="error">{tr(state.error)}</Alert> : null}
      <Field label={t("brandName")} htmlFor="brandName" {...opt}>
        <Input id="brandName" name="brandName" defaultValue={tenant.brandName ?? ""} />
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={t("brandColor")} htmlFor="brandColor" hint={t("brandColorHint")} error={err("brandColor")} {...opt}>
          <Input id="brandColor" name="brandColor" placeholder="#1d4ed8" defaultValue={tenant.brandColor ?? ""} />
        </Field>
        <Field label={t("logoUrl")} htmlFor="logoUrl" error={err("logoUrl")} {...opt}>
          <Input id="logoUrl" name="logoUrl" type="url" defaultValue={tenant.logoUrl ?? ""} />
        </Field>
      </div>
      <SubmitButton pendingText={tc("saving")}>{t("saveBrand")}</SubmitButton>
    </form>
  );
}
