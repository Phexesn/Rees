import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { saveSetupStep } from "@/app/setup/actions";
import { Alert, Card, Checkbox, Field, Input, Select, Textarea, buttonClass } from "@/components/ui";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { requireContext } from "@/lib/auth/context";
import { contentLanguageLimit } from "@/lib/features";
import { CONTENT_LANGUAGES, UI_LOCALES } from "@/lib/languages";
import { PHONE_MODELS } from "@/modules/_shared/phones";
import { US_STATES } from "@/lib/us-states";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("setup");
  return { title: t("title") };
}

const TONES = ["warm", "professional", "luxury", "friendly", "straightforward"] as const;
const TOTAL = 5;

export default async function SetupPage({ searchParams }: { searchParams: Promise<{ step?: string; error?: string }> }) {
  const ctx = await requireContext();
  const t = await getTranslations("setup");
  const tc = await getTranslations("common");
  const locale = await getLocale();
  const params = await searchParams;
  const step = Math.min(TOTAL, Math.max(1, Number(params.step) || 1));
  const p = ctx.profile;
  const langLimit = contentLanguageLimit(ctx.tenant);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-lg font-semibold text-brand-800">{t("stepOf", { step, total: TOTAL })}</p>
        <div className="mt-2 h-4 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuemin={1} aria-valuemax={TOTAL} aria-valuenow={step}>
          <div className="h-full rounded-full bg-brand-700" style={{ width: `${(step / TOTAL) * 100}%` }} />
        </div>
      </div>
      {params.error ? <Alert tone="error">{t("error")}</Alert> : null}
      <Card>
        <form action={saveSetupStep} className="space-y-6">
          <input type="hidden" name="step" value={step} />
          <h1 className="text-3xl font-bold">{t(`step${step}.title`)}</h1>
          <p className="text-lg text-slate-700">{t(`step${step}.subtitle`)}</p>

          {step === 1 && (
            <>
              <Field label={t("step1.displayName")} htmlFor="displayName" hint={t("step1.displayNameHint")}>
                <Input id="displayName" name="displayName" defaultValue={p?.displayName ?? ctx.user.name} required />
              </Field>
              <Field label={t("step1.phone")} htmlFor="phone" optional optionalLabel={tc("optional")}>
                <Input id="phone" name="phone" type="tel" autoComplete="tel" defaultValue={p?.phone ?? ""} />
              </Field>
              <Field label={t("step1.brokerage")} htmlFor="brokerage" hint={t("step1.brokerageHint")} optional optionalLabel={tc("optional")}>
                <Input id="brokerage" name="brokerage" defaultValue={p?.brokerage ?? ""} />
              </Field>
              <div className="grid gap-6 sm:grid-cols-[1fr_12rem]">
                <Field label={t("step1.license")} htmlFor="licenseNumber" optional optionalLabel={tc("optional")}>
                  <Input id="licenseNumber" name="licenseNumber" defaultValue={p?.licenseNumber ?? ""} />
                </Field>
                <Field label={t("step1.state")} htmlFor="licenseState" optional optionalLabel={tc("optional")}>
                  <Select id="licenseState" name="licenseState" defaultValue={p?.licenseState ?? ""}>
                    <option value="">—</option>
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                </Field>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <Field label={t("step2.uiLanguage")} htmlFor="uiLocale" hint={t("step2.uiLanguageHint")}>
                <Select id="uiLocale" name="uiLocale" defaultValue={locale}>
                  {UI_LOCALES.map((code) => (
                    <option key={code} value={code}>{CONTENT_LANGUAGES.find((l) => l.code === code)!.native}</option>
                  ))}
                </Select>
              </Field>
              <Field label={t("step2.contentLanguage")} htmlFor="contentLanguage" hint={t("step2.contentLanguageHint")}>
                <Select id="contentLanguage" name="contentLanguage" defaultValue={p?.contentLanguage ?? locale}>
                  {CONTENT_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.native}</option>
                  ))}
                </Select>
              </Field>
              {langLimit > 1 ? (
                <fieldset className="space-y-3">
                  <legend className="text-lg font-semibold">{t("step2.extraLanguages", { count: langLimit - 1 })}</legend>
                  <p className="text-base text-slate-700">{t("step2.extraLanguagesHint")}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {CONTENT_LANGUAGES.map((l) => (
                      <Checkbox key={l.code} name="extraLanguages" value={l.code} label={l.native} defaultChecked={p?.extraLanguages.includes(l.code)} />
                    ))}
                  </div>
                </fieldset>
              ) : (
                <Alert tone="info">{t("step2.soloLimit")}</Alert>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <fieldset className="space-y-3">
                <legend className="text-lg font-semibold">{t("step3.tone")}</legend>
                <div className="grid gap-3">
                  {TONES.map((tone) => (
                    <label key={tone} className="flex cursor-pointer items-start gap-4 rounded-xl border-2 border-slate-200 bg-white p-4 has-[:checked]:border-brand-700 has-[:checked]:bg-brand-50">
                      <input type="radio" name="brandTone" value={tone} defaultChecked={(p?.brandTone ?? "warm") === tone} className="mt-1 size-7 accent-brand-700" />
                      <span>
                        <span className="block text-lg font-bold">{t(`step3.tones.${tone}.name`)}</span>
                        <span className="block text-lg italic text-slate-700">“{t(`step3.tones.${tone}.example`)}”</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <Field label={t("step3.voiceNotes")} htmlFor="brandVoiceNotes" hint={t("step3.voiceNotesHint")} optional optionalLabel={tc("optional")}>
                <Textarea id="brandVoiceNotes" name="brandVoiceNotes" defaultValue={p?.brandVoiceNotes ?? ""} />
              </Field>
              <Field label={t("step3.wordsToAvoid")} htmlFor="wordsToAvoid" hint={t("step3.wordsToAvoidHint")} optional optionalLabel={tc("optional")}>
                <Input id="wordsToAvoid" name="wordsToAvoid" defaultValue={p?.wordsToAvoid ?? ""} />
              </Field>
            </>
          )}

          {step === 4 && (
            <>
              <Field label={t("step4.phone")} htmlFor="phoneModel" hint={t("step4.phoneHint")}>
                <Select id="phoneModel" name="phoneModel" defaultValue={p?.phoneModel ?? ""}>
                  <option value="">{t("step4.phonePick")}</option>
                  {PHONE_MODELS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </Select>
              </Field>
              <Field label={t("step4.markets")} htmlFor="marketsServed" hint={t("step4.marketsHint")} optional optionalLabel={tc("optional")}>
                <Input id="marketsServed" name="marketsServed" defaultValue={p?.marketsServed ?? ""} />
              </Field>
            </>
          )}

          {step === 5 && (
            <ul className="space-y-3 text-lg">
              <li>✅ {t("step5.name", { name: p?.displayName ?? ctx.user.name })}</li>
              <li>✅ {t("step5.language", { language: CONTENT_LANGUAGES.find((l) => l.code === p?.contentLanguage)?.native ?? "English" })}</li>
              <li>✅ {t("step5.tone", { tone: t(`step3.tones.${p?.brandTone ?? "warm"}.name`) })}</li>
              <li>✅ {t("step5.phone", { phone: p?.phoneModel ?? t("step5.notSet") })}</li>
            </ul>
          )}

          <div className="flex flex-col-reverse gap-3 border-t-2 border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            {step > 1 ? (
              <Link href={`/setup?step=${step - 1}`} className={buttonClass("ghost", "lg")}>
                ← {tc("back")}
              </Link>
            ) : (
              <span />
            )}
            {step < TOTAL ? (
              <SubmitButton pendingText={tc("saving")} size="xl">
                {tc("saveAndContinue")} →
              </SubmitButton>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <SubmitButton name="next" value="dashboard" variant="secondary" pendingText={tc("saving")}>
                  {t("step5.goDashboard")}
                </SubmitButton>
                <SubmitButton name="next" value="listing" pendingText={tc("saving")} size="xl">
                  {t("step5.addListing")} →
                </SubmitButton>
              </div>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
