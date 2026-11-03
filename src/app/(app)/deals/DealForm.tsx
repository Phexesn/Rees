"use client";

import type { Deal } from "@prisma/client";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Alert, Checkbox, Field, Input, Select, Textarea } from "@/components/ui";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialActionState, type ActionState } from "@/lib/actions";
import { DEAL_STAGES } from "@/lib/crm";

const toDateInput = (d: Date | null | undefined) => (d ? new Date(d).toISOString().slice(0, 10) : "");

export function DealForm({
  action,
  deal,
  contacts,
  properties,
  defaults,
  canChecklist,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  deal?: Deal;
  contacts: { id: string; name: string }[];
  properties: { id: string; address: string }[];
  defaults?: { contactId?: string; propertyId?: string };
  canChecklist: boolean;
}) {
  const t = useTranslations("deals.form");
  const tp = useTranslations("pipeline");
  const ts = useTranslations("contacts.stages");
  const tc = useTranslations("common");
  const tr = useTranslations();
  const [state, formAction] = useActionState(action, initialActionState);
  const err = (f: string) => (state.fieldErrors?.[f] ? tr(state.fieldErrors[f]) : undefined);
  const opt = { optional: true, optionalLabel: tc("optional") };

  return (
    <form action={formAction} className="space-y-6 rounded-2xl border-2 border-slate-200 bg-white p-6" noValidate>
      {deal ? <input type="hidden" name="id" value={deal.id} /> : null}
      {state.error ? <Alert tone="error">{tr(state.error)}</Alert> : null}
      <Field label={t("title")} htmlFor="title" hint={t("titleHint")} error={err("title")}>
        <Input id="title" name="title" defaultValue={deal?.title ?? ""} required />
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={t("contact")} htmlFor="contactId" error={err("contactId")}>
          <Select id="contactId" name="contactId" defaultValue={deal?.contactId ?? defaults?.contactId ?? ""} required>
            <option value="">{t("pickContact")}</option>
            {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>
        <Field label={t("property")} htmlFor="propertyId" {...opt}>
          <Select id="propertyId" name="propertyId" defaultValue={deal?.propertyId ?? defaults?.propertyId ?? ""}>
            <option value="">{t("noProperty")}</option>
            {properties.map((p) => <option key={p.id} value={p.id}>{p.address}</option>)}
          </Select>
        </Field>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={t("side")} htmlFor="side">
          <Select id="side" name="side" defaultValue={deal?.side ?? "BUYER"}>
            {(["BUYER", "SELLER", "BOTH"] as const).map((s) => <option key={s} value={s}>{tp(`sides.${s}`)}</option>)}
          </Select>
        </Field>
        <Field label={t("stage")} htmlFor="stage">
          <Select id="stage" name="stage" defaultValue={deal?.stage ?? "NEW_LEAD"}>
            {DEAL_STAGES.map((s) => <option key={s} value={s}>{ts(s)}</option>)}
          </Select>
        </Field>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={t("value")} htmlFor="value" hint={t("valueHint")} {...opt}>
          <Input id="value" name="value" inputMode="numeric" defaultValue={deal?.value ?? ""} />
        </Field>
        <Field label={t("commission")} htmlFor="commissionPct" {...opt}>
          <Input id="commissionPct" name="commissionPct" inputMode="decimal" placeholder="2.5" defaultValue={deal?.commissionPct ?? ""} />
        </Field>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={t("contractDate")} htmlFor="contractDate" hint={t("contractDateHint")} {...opt}>
          <Input id="contractDate" name="contractDate" type="date" defaultValue={toDateInput(deal?.contractDate)} />
        </Field>
        <Field label={t("expectedClose")} htmlFor="expectedCloseDate" {...opt}>
          <Input id="expectedCloseDate" name="expectedCloseDate" type="date" defaultValue={toDateInput(deal?.expectedCloseDate)} />
        </Field>
      </div>
      {deal ? (
        <Field label={t("lostReason")} htmlFor="lostReason" hint={t("lostReasonHint")} {...opt}>
          <Textarea id="lostReason" name="lostReason" defaultValue={deal.lostReason ?? ""} className="min-h-20" />
        </Field>
      ) : canChecklist ? (
        <Checkbox name="withChecklist" label={t("withChecklist")} hint={t("withChecklistHint")} defaultChecked />
      ) : null}
      <SubmitButton pendingText={tc("saving")} size="xl">{deal ? t("saveChanges") : t("saveDeal")}</SubmitButton>
    </form>
  );
}
