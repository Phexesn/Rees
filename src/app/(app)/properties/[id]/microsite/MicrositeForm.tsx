"use client";

import type { Microsite } from "@prisma/client";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { saveMicrositeAction } from "@/app/(app)/properties/[id]/microsite/actions";
import { Alert, Checkbox, Field, Input, Select, Textarea } from "@/components/ui";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialActionState } from "@/lib/actions";
import { CONTENT_LANGUAGES, UI_LOCALES } from "@/lib/languages";

export function MicrositeForm({ site, propertyId }: { site: Microsite; propertyId: string }) {
  const t = useTranslations("microsite");
  const tc = useTranslations("common");
  const tr = useTranslations();
  const [state, action] = useActionState(saveMicrositeAction, initialActionState);
  const err = (f: string) => (state.fieldErrors?.[f] ? tr(state.fieldErrors[f]) : undefined);
  const opt = { optional: true, optionalLabel: tc("optional") };
  return (
    <form action={action} className="space-y-6 rounded-2xl border-2 border-slate-200 bg-white p-6">
      <input type="hidden" name="propertyId" value={propertyId} />
      {state.ok ? <Alert tone="success">{state.message === "published" ? t("publishedNow") : t("saved")}</Alert> : null}
      {state.error ? <Alert tone="error">{tr(state.error)}</Alert> : null}
      <Field label={t("headline")} htmlFor="headline" error={err("headline")}>
        <Input id="headline" name="headline" defaultValue={site.headline} required />
      </Field>
      <Field label={t("introLabel")} htmlFor="intro" {...opt}>
        <Textarea id="intro" name="intro" defaultValue={site.intro ?? ""} />
      </Field>
      <Field label={t("highlights")} htmlFor="highlights" hint={t("highlightsHint")} {...opt}>
        <Textarea id="highlights" name="highlights" defaultValue={site.highlights.join("\n")} className="min-h-40" />
      </Field>
      <Field label={t("body")} htmlFor="body" {...opt}>
        <Textarea id="body" name="body" defaultValue={site.body ?? ""} className="min-h-48" />
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={t("language")} htmlFor="language" hint={t("languageHint")}>
          <Select id="language" name="language" defaultValue={site.language}>
            {UI_LOCALES.map((code) => (
              <option key={code} value={code}>{CONTENT_LANGUAGES.find((l) => l.code === code)!.native}</option>
            ))}
          </Select>
        </Field>
        <Field label={t("accentColor")} htmlFor="accentColor" error={err("accentColor")}>
          <Input id="accentColor" name="accentColor" type="color" defaultValue={site.accentColor} className="h-14 cursor-pointer p-1" />
        </Field>
      </div>
      <Checkbox name="showPrice" label={t("showPrice")} defaultChecked={site.showPrice} />
      <Checkbox name="published" label={t("published")} hint={t("publishedHint")} defaultChecked={site.published} />
      <SubmitButton pendingText={tc("saving")} size="xl">{t("saveButton")}</SubmitButton>
    </form>
  );
}
