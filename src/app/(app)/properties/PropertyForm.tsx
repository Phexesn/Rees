"use client";

import type { Property } from "@prisma/client";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Alert, Field, Input, Select, Textarea } from "@/components/ui";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialActionState, type ActionState } from "@/lib/actions";
import { US_STATES } from "@/lib/us-states";
import { PHONE_MODELS } from "@/modules/_shared/phones";

const PROPERTY_TYPES = ["single_family", "condo", "townhouse", "multi_family", "manufactured", "land", "other"];
const STATUSES = ["COMING_SOON", "ACTIVE", "PENDING", "SOLD", "OFF_MARKET"];
const FACINGS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

function toLocalInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function PropertyForm({
  action,
  property,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  property?: Property;
}) {
  const t = useTranslations("properties.form");
  const tc = useTranslations("common");
  const tr = useTranslations();
  const [state, formAction] = useActionState(action, initialActionState);
  const err = (f: string) => (state.fieldErrors?.[f] ? tr(state.fieldErrors[f]) : undefined);
  const opt = { optional: true, optionalLabel: tc("optional") };

  const section = "space-y-6 rounded-2xl border-2 border-slate-200 bg-white p-6";
  return (
    <form action={formAction} className="space-y-8" noValidate>
      {property ? <input type="hidden" name="id" value={property.id} /> : null}
      {state.error ? <Alert tone="error">{tr(state.error)}</Alert> : null}

      <fieldset className={section}>
        <legend className="px-2 text-2xl font-bold">📍 {t("addressSection")}</legend>
        <Field label={t("address")} htmlFor="address" error={err("address")}>
          <Input id="address" name="address" autoComplete="street-address" defaultValue={property?.address} required />
        </Field>
        <div className="grid gap-6 sm:grid-cols-[1fr_1fr]">
          <Field label={t("unit")} htmlFor="unit" {...opt}>
            <Input id="unit" name="unit" defaultValue={property?.unit ?? ""} />
          </Field>
          <Field label={t("city")} htmlFor="city" error={err("city")}>
            <Input id="city" name="city" defaultValue={property?.city} required />
          </Field>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={t("state")} htmlFor="state" error={err("state")}>
            <Select id="state" name="state" defaultValue={property?.state ?? ""} required>
              <option value="">—</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label={t("zip")} htmlFor="zip" error={err("zip")}>
            <Input id="zip" name="zip" inputMode="numeric" autoComplete="postal-code" defaultValue={property?.zip} required />
          </Field>
        </div>
      </fieldset>

      <fieldset className={section}>
        <legend className="px-2 text-2xl font-bold">🏠 {t("basicsSection")}</legend>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={t("status")} htmlFor="status">
            <Select id="status" name="status" defaultValue={property?.status ?? "ACTIVE"}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{t(`statuses.${s}`)}</option>
              ))}
            </Select>
          </Field>
          <Field label={t("propertyType")} htmlFor="propertyType">
            <Select id="propertyType" name="propertyType" defaultValue={property?.propertyType ?? "single_family"}>
              {PROPERTY_TYPES.map((s) => (
                <option key={s} value={s}>{t(`types.${s}`)}</option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <Field label={t("price")} htmlFor="price" error={err("price")} {...opt}>
            <Input id="price" name="price" inputMode="numeric" placeholder="450000" defaultValue={property?.price ?? ""} />
          </Field>
          <Field label={t("beds")} htmlFor="beds" error={err("beds")} {...opt}>
            <Input id="beds" name="beds" inputMode="decimal" defaultValue={property?.beds ?? ""} />
          </Field>
          <Field label={t("baths")} htmlFor="baths" hint={t("bathsHint")} error={err("baths")} {...opt}>
            <Input id="baths" name="baths" inputMode="decimal" defaultValue={property?.baths ?? ""} />
          </Field>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <Field label={t("sqft")} htmlFor="sqft" error={err("sqft")} {...opt}>
            <Input id="sqft" name="sqft" inputMode="numeric" defaultValue={property?.sqft ?? ""} />
          </Field>
          <Field label={t("lotSize")} htmlFor="lotSize" {...opt}>
            <Input id="lotSize" name="lotSize" placeholder="0.25 acre" defaultValue={property?.lotSize ?? ""} />
          </Field>
          <Field label={t("yearBuilt")} htmlFor="yearBuilt" error={err("yearBuilt")} {...opt}>
            <Input id="yearBuilt" name="yearBuilt" inputMode="numeric" defaultValue={property?.yearBuilt ?? ""} />
          </Field>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <Field label={t("stories")} htmlFor="stories" {...opt}>
            <Input id="stories" name="stories" inputMode="numeric" defaultValue={property?.stories ?? ""} />
          </Field>
          <Field label={t("garage")} htmlFor="garage" {...opt}>
            <Input id="garage" name="garage" placeholder={t("garagePlaceholder")} defaultValue={property?.garage ?? ""} />
          </Field>
          <Field label={t("hoaFee")} htmlFor="hoaFee" {...opt}>
            <Input id="hoaFee" name="hoaFee" inputMode="numeric" defaultValue={property?.hoaFee ?? ""} />
          </Field>
        </div>
      </fieldset>

      <fieldset className={section}>
        <legend className="px-2 text-2xl font-bold">✨ {t("detailsSection")}</legend>
        <p className="text-lg text-slate-700">{t("detailsIntro")}</p>
        <Field label={t("features")} htmlFor="features" hint={t("featuresHint")} {...opt}>
          <Textarea id="features" name="features" placeholder={t("featuresPlaceholder")} defaultValue={property?.features ?? ""} />
        </Field>
        <Field label={t("upgrades")} htmlFor="upgrades" hint={t("upgradesHint")} {...opt}>
          <Textarea id="upgrades" name="upgrades" placeholder={t("upgradesPlaceholder")} defaultValue={property?.upgrades ?? ""} />
        </Field>
        <Field label={t("outdoor")} htmlFor="outdoor" {...opt}>
          <Textarea id="outdoor" name="outdoor" placeholder={t("outdoorPlaceholder")} defaultValue={property?.outdoor ?? ""} />
        </Field>
        <Field label={t("neighborhood")} htmlFor="neighborhood" hint={t("neighborhoodHint")} {...opt}>
          <Textarea id="neighborhood" name="neighborhood" placeholder={t("neighborhoodPlaceholder")} defaultValue={property?.neighborhood ?? ""} />
        </Field>
      </fieldset>

      <fieldset className={section}>
        <legend className="px-2 text-2xl font-bold">📷 {t("photoSection")}</legend>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={t("facing")} htmlFor="facing" hint={t("facingHint")} {...opt}>
            <Select id="facing" name="facing" defaultValue={property?.facing ?? ""}>
              <option value="">{t("facingUnknown")}</option>
              {FACINGS.map((f) => (
                <option key={f} value={f}>{t(`facings.${f}`)}</option>
              ))}
            </Select>
          </Field>
          <Field label={t("phoneModel")} htmlFor="phoneModel" hint={t("phoneModelHint")} {...opt}>
            <Select id="phoneModel" name="phoneModel" defaultValue={property?.phoneModel ?? ""}>
              <option value="">{t("phoneModelDefault")}</option>
              {PHONE_MODELS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label={t("heroImageUrl")} htmlFor="heroImageUrl" hint={t("heroImageUrlHint")} error={err("heroImageUrl")} {...opt}>
          <Input id="heroImageUrl" name="heroImageUrl" type="url" inputMode="url" defaultValue={property?.heroImageUrl ?? ""} />
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={t("openHouseAt")} htmlFor="openHouseAt" {...opt}>
            <Input id="openHouseAt" name="openHouseAt" type="datetime-local" defaultValue={toLocalInput(property?.openHouseAt)} />
          </Field>
          <Field label={t("openHouseEnd")} htmlFor="openHouseEnd" {...opt}>
            <Input id="openHouseEnd" name="openHouseEnd" type="datetime-local" defaultValue={toLocalInput(property?.openHouseEnd)} />
          </Field>
        </div>
      </fieldset>

      <fieldset className={section}>
        <legend className="px-2 text-2xl font-bold">🔒 {t("privateSection")}</legend>
        <Field label={t("soldPrice")} htmlFor="soldPrice" {...opt}>
          <Input id="soldPrice" name="soldPrice" inputMode="numeric" defaultValue={property?.soldPrice ?? ""} />
        </Field>
        <Field label={t("privateNotes")} htmlFor="privateNotes" hint={t("privateNotesHint")} {...opt}>
          <Textarea id="privateNotes" name="privateNotes" defaultValue={property?.privateNotes ?? ""} />
        </Field>
      </fieldset>

      <div className="sticky bottom-0 z-10 -mx-4 border-t-2 border-slate-200 bg-white/95 px-4 py-4 backdrop-blur">
        <SubmitButton pendingText={tc("saving")} size="xl" className="w-full sm:w-auto">
          {property ? t("saveChanges") : t("saveListing")}
        </SubmitButton>
      </div>
    </form>
  );
}
