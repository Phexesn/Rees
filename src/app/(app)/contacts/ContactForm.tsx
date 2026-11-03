"use client";

import type { Contact } from "@prisma/client";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Alert, Checkbox, Field, Input, Select, Textarea } from "@/components/ui";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialActionState, type ActionState } from "@/lib/actions";
import { CONTACT_ROLES, CONTACT_STATUSES, LEAD_SOURCES } from "@/lib/crm";
import { CONTENT_LANGUAGES } from "@/lib/languages";

const PROPERTY_TYPES = ["single_family", "condo", "townhouse", "multi_family", "land"];
const section = "space-y-6 rounded-2xl border-2 border-slate-200 bg-white p-6";

export function ContactForm({
  action,
  contact,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  contact?: Contact;
}) {
  const t = useTranslations("contacts");
  const tf = useTranslations("contacts.form");
  const tp = useTranslations("properties.form");
  const tc = useTranslations("common");
  const tr = useTranslations();
  const [state, formAction] = useActionState(action, initialActionState);
  const err = (f: string) => (state.fieldErrors?.[f] ? tr(state.fieldErrors[f]) : undefined);
  const opt = { optional: true, optionalLabel: tc("optional") };

  return (
    <form action={formAction} className="space-y-8" noValidate>
      {contact ? <input type="hidden" name="id" value={contact.id} /> : null}
      {state.error ? <Alert tone="error">{tr(state.error)}</Alert> : null}

      <fieldset className={section}>
        <legend className="px-2 text-2xl font-bold">👤 {tf("who")}</legend>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={tf("firstName")} htmlFor="firstName" error={err("firstName")}>
            <Input id="firstName" name="firstName" defaultValue={contact?.firstName} required />
          </Field>
          <Field label={tf("lastName")} htmlFor="lastName" {...opt}>
            <Input id="lastName" name="lastName" defaultValue={contact?.lastName ?? ""} />
          </Field>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={tf("email")} htmlFor="email" error={err("email")} {...opt}>
            <Input id="email" name="email" type="email" defaultValue={contact?.email ?? ""} />
          </Field>
          <Field label={tf("phone")} htmlFor="phone" {...opt}>
            <Input id="phone" name="phone" type="tel" defaultValue={contact?.phone ?? ""} />
          </Field>
        </div>
        <fieldset className="space-y-3">
          <legend className="text-lg font-semibold">{tf("roles")}</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {CONTACT_ROLES.map((r) => (
              <Checkbox key={r} name="roles" value={r} label={t(`roles.${r}`)} defaultChecked={contact ? contact.roles.includes(r) : r === "BUYER"} />
            ))}
          </div>
        </fieldset>
        <div className="grid gap-6 sm:grid-cols-3">
          <Field label={t("status")} htmlFor="status">
            <Select id="status" name="status" defaultValue={contact?.status ?? "NEW"}>
              {CONTACT_STATUSES.map((s) => <option key={s} value={s}>{t(`statuses.${s}`)}</option>)}
            </Select>
          </Field>
          <Field label={t("source")} htmlFor="source">
            <Select id="source" name="source" defaultValue={contact?.source ?? "OTHER"}>
              {LEAD_SOURCES.map((s) => <option key={s} value={s}>{t(`sources.${s}`)}</option>)}
            </Select>
          </Field>
          <Field label={tf("language")} htmlFor="preferredLanguage" {...opt}>
            <Select id="preferredLanguage" name="preferredLanguage" defaultValue={contact?.preferredLanguage ?? ""}>
              <option value="">—</option>
              {CONTENT_LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.native}</option>)}
            </Select>
          </Field>
        </div>
        <Field label={tf("sourceDetail")} htmlFor="sourceDetail" hint={tf("sourceDetailHint")} {...opt}>
          <Input id="sourceDetail" name="sourceDetail" defaultValue={contact?.sourceDetail ?? ""} />
        </Field>
        <Field label={tf("tags")} htmlFor="tags" hint={tf("tagsHint")} {...opt}>
          <Input id="tags" name="tags" defaultValue={contact?.tags.join(", ") ?? ""} />
        </Field>
      </fieldset>

      <fieldset className={section}>
        <legend className="px-2 text-2xl font-bold">🏠 {tf("lookingFor")}</legend>
        <p className="text-lg text-slate-700">{tf("lookingForHint")}</p>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={tf("priceMin")} htmlFor="priceMin" {...opt}>
            <Input id="priceMin" name="priceMin" inputMode="numeric" defaultValue={contact?.priceMin ?? ""} />
          </Field>
          <Field label={tf("priceMax")} htmlFor="priceMax" {...opt}>
            <Input id="priceMax" name="priceMax" inputMode="numeric" defaultValue={contact?.priceMax ?? ""} />
          </Field>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <Field label={tf("bedsMin")} htmlFor="bedsMin" {...opt}>
            <Input id="bedsMin" name="bedsMin" inputMode="decimal" defaultValue={contact?.bedsMin ?? ""} />
          </Field>
          <Field label={tf("bathsMin")} htmlFor="bathsMin" {...opt}>
            <Input id="bathsMin" name="bathsMin" inputMode="decimal" defaultValue={contact?.bathsMin ?? ""} />
          </Field>
          <Field label={tf("timeline")} htmlFor="timeline" {...opt}>
            <Input id="timeline" name="timeline" placeholder={tf("timelinePlaceholder")} defaultValue={contact?.timeline ?? ""} />
          </Field>
        </div>
        <fieldset className="space-y-3">
          <legend className="text-lg font-semibold">{tf("propertyTypes")}</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {PROPERTY_TYPES.map((pt) => (
              <Checkbox key={pt} name="propertyTypes" value={pt} label={tp(`types.${pt}`)} defaultChecked={contact?.propertyTypes.includes(pt)} />
            ))}
          </div>
        </fieldset>
        <Field label={tf("areas")} htmlFor="areas" {...opt}>
          <Input id="areas" name="areas" defaultValue={contact?.areas ?? ""} />
        </Field>
        <Field label={tf("mustHaves")} htmlFor="mustHaves" {...opt}>
          <Textarea id="mustHaves" name="mustHaves" defaultValue={contact?.mustHaves ?? ""} />
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Checkbox name="preApproved" label={tf("preApproved")} defaultChecked={contact?.preApproved} />
          <Field label={tf("lender")} htmlFor="lender" {...opt}>
            <Input id="lender" name="lender" defaultValue={contact?.lender ?? ""} />
          </Field>
        </div>
      </fieldset>

      <SubmitButton pendingText={tc("saving")} size="xl">{contact ? tf("saveChanges") : tf("saveContact")}</SubmitButton>
    </form>
  );
}
