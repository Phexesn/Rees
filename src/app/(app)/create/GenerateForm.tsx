"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { generateAction } from "@/app/(app)/create/actions";
import { Alert, Checkbox, Field, Input, Select, Textarea } from "@/components/ui";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialActionState } from "@/lib/actions";
import type { ModuleMeta } from "@/modules/types";

type LanguageOption = { code: string; native: string; allowed: boolean };

export function GenerateForm({
  meta,
  propertyId,
  contacts,
  contactId,
  languages,
  primaryLanguage,
  languageLimit,
}: {
  meta: ModuleMeta;
  propertyId?: string;
  contacts?: { id: string; name: string }[];
  contactId?: string;
  languages: LanguageOption[];
  primaryLanguage: string;
  languageLimit: number;
}) {
  const t = useTranslations("create.form");
  const tr = useTranslations();
  const [state, action] = useActionState(generateAction, initialActionState);
  const label = (key: string) => (key.startsWith("raw:") ? key.slice(4) : tr(key));

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="moduleId" value={meta.id} />
      {propertyId ? <input type="hidden" name="propertyId" value={propertyId} /> : null}
      {state.error ? (
        <Alert tone="error" title={tr(state.error)}>
          {state.message}
        </Alert>
      ) : null}

      {meta.usesContact && contacts && contacts.length > 0 ? (
        <Field label={t("contact")} htmlFor="contactId" hint={t("contactHint")}>
          <Select id="contactId" name="contactId" defaultValue={contactId ?? ""}>
            <option value="">{t("noContact")}</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </Field>
      ) : null}

      {meta.options.map((field) => {
        const id = `opt-${field.name}`;
        if (field.type === "checkbox") {
          return (
            <Checkbox
              key={field.name}
              name={field.name}
              label={label(field.labelKey)}
              hint={field.hintKey ? label(field.hintKey) : undefined}
              defaultChecked={field.default}
            />
          );
        }
        if (field.type === "select") {
          return (
            <Field key={field.name} label={label(field.labelKey)} htmlFor={id} hint={field.hintKey ? label(field.hintKey) : undefined}>
              <Select id={id} name={field.name} defaultValue={field.default}>
                {field.options.map((o) => (
                  <option key={o.value} value={o.value}>{label(o.labelKey)}</option>
                ))}
              </Select>
            </Field>
          );
        }
        return (
          <Field key={field.name} label={label(field.labelKey)} htmlFor={id} hint={field.hintKey ? label(field.hintKey) : undefined} optional optionalLabel={tr("common.optional")}>
            {field.multiline ? (
              <Textarea id={id} name={field.name} defaultValue={field.default} placeholder={field.placeholderKey ? label(field.placeholderKey) : undefined} />
            ) : (
              <Input id={id} name={field.name} defaultValue={field.default} placeholder={field.placeholderKey ? label(field.placeholderKey) : undefined} />
            )}
          </Field>
        );
      })}

      <fieldset className="space-y-3 rounded-2xl border-2 border-slate-200 bg-white p-5">
        <legend className="px-2 text-xl font-bold">🌐 {t("languages")}</legend>
        <p className="text-base text-slate-700">{t("languagesHint", { count: languageLimit })}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {languages.map((l) => (
            <Checkbox
              key={l.code}
              name="languages"
              value={l.code}
              label={l.native}
              hint={l.allowed ? undefined : t("languageLocked")}
              disabled={!l.allowed}
              defaultChecked={l.code === primaryLanguage}
            />
          ))}
        </div>
      </fieldset>

      <div className="space-y-3">
        <SubmitButton pendingText={t("writing")} size="xl" className="w-full sm:w-auto">
          ✨ {t("generateButton")}
        </SubmitButton>
        <p className="text-base text-slate-700">{t("timeNote")}</p>
      </div>
    </form>
  );
}
