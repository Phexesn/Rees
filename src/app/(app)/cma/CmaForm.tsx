"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { createCmaAction } from "@/app/(app)/cma/actions";
import { Alert, Field, Input, Select } from "@/components/ui";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialActionState } from "@/lib/actions";

type Home = {
  address: string;
  beds: string;
  baths: string;
  sqft: string;
  yearBuilt: string;
  garageSpaces: string;
  pool: boolean;
  condition: string;
};
type CompRow = Home & { status: "sold" | "pending" | "active"; price: string; date: string; distanceMiles: string; notes: string };

const blankComp = (): CompRow => ({
  address: "", beds: "", baths: "", sqft: "", yearBuilt: "", garageSpaces: "0", pool: false, condition: "3",
  status: "sold", price: "", date: "", distanceMiles: "", notes: "",
});

const num = (v: string) => (v.trim() === "" ? undefined : Number(v.replace(/[$,\s]/g, "")));

export function CmaForm({
  initialSubject,
  propertyId,
  defaultTitle,
  languages,
}: {
  initialSubject: Partial<Home>;
  propertyId?: string;
  defaultTitle: string;
  languages: { code: string; native: string }[];
}) {
  const t = useTranslations("cma.form");
  const tr = useTranslations();
  const [state, action] = useActionState(createCmaAction, initialActionState);
  const [subject, setSubject] = useState<Home>({
    address: "", beds: "", baths: "", sqft: "", yearBuilt: "", garageSpaces: "0", pool: false, condition: "3",
    ...initialSubject,
  });
  const [comps, setComps] = useState<CompRow[]>([blankComp(), blankComp(), blankComp()]);
  const [settings, setSettings] = useState({ sqftRate: "", perBedroom: "10000", perBathroom: "7500", perGarageSpace: "5000", pool: "15000", conditionPct: "3" });
  const [title, setTitle] = useState(defaultTitle);
  const [language, setLanguage] = useState(languages[0]?.code ?? "en");
  const [audience, setAudience] = useState("seller");

  const toHome = (h: Home) => ({
    address: h.address,
    beds: num(h.beds) ?? 0,
    baths: num(h.baths) ?? 0,
    sqft: num(h.sqft),
    yearBuilt: num(h.yearBuilt),
    garageSpaces: num(h.garageSpaces) ?? 0,
    pool: h.pool,
    condition: num(h.condition) ?? 3,
  });
  const filled = comps.filter((c) => c.address.trim() && c.price.trim() && c.sqft.trim());
  const payload = JSON.stringify({
    title,
    propertyId,
    language,
    audience,
    subject: toHome(subject),
    comps: filled.map((c) => ({
      ...toHome(c),
      status: c.status,
      price: num(c.price),
      date: c.date || undefined,
      distanceMiles: num(c.distanceMiles),
      notes: c.notes || undefined,
    })),
    settings: Object.fromEntries(Object.entries(settings).filter(([, v]) => v.trim() !== "").map(([k, v]) => [k, num(v)])),
  });

  const homeFields = (h: Home, update: (patch: Partial<Home>) => void, prefix: string) => (
    <div className="grid gap-4 sm:grid-cols-4">
      <Field label={t("beds")} htmlFor={`${prefix}-beds`}><Input id={`${prefix}-beds`} inputMode="decimal" value={h.beds} onChange={(e) => update({ beds: e.target.value })} /></Field>
      <Field label={t("baths")} htmlFor={`${prefix}-baths`}><Input id={`${prefix}-baths`} inputMode="decimal" value={h.baths} onChange={(e) => update({ baths: e.target.value })} /></Field>
      <Field label={t("sqft")} htmlFor={`${prefix}-sqft`}><Input id={`${prefix}-sqft`} inputMode="numeric" value={h.sqft} onChange={(e) => update({ sqft: e.target.value })} /></Field>
      <Field label={t("yearBuilt")} htmlFor={`${prefix}-year`}><Input id={`${prefix}-year`} inputMode="numeric" value={h.yearBuilt} onChange={(e) => update({ yearBuilt: e.target.value })} /></Field>
      <Field label={t("garage")} htmlFor={`${prefix}-garage`}><Input id={`${prefix}-garage`} inputMode="numeric" value={h.garageSpaces} onChange={(e) => update({ garageSpaces: e.target.value })} /></Field>
      <Field label={t("condition")} htmlFor={`${prefix}-condition`}>
        <Select id={`${prefix}-condition`} value={h.condition} onChange={(e) => update({ condition: e.target.value })}>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{t(`conditions.${n}`)}</option>)}
        </Select>
      </Field>
      <label className="flex items-center gap-3 self-end pb-3 text-lg font-semibold">
        <input type="checkbox" className="size-7 accent-brand-700" checked={h.pool} onChange={(e) => update({ pool: e.target.checked })} />
        {t("pool")}
      </label>
    </div>
  );

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="payload" value={payload} />
      {state.error ? <Alert tone="error">{tr(state.error)}</Alert> : null}

      <section className="space-y-4 rounded-2xl border-2 border-slate-200 bg-white p-6">
        <h2 className="text-2xl font-bold">🏠 {t("subjectTitle")}</h2>
        <Field label={t("reportTitle")} htmlFor="cma-title"><Input id="cma-title" value={title} onChange={(e) => setTitle(e.target.value)} required /></Field>
        <Field label={t("address")} htmlFor="s-address"><Input id="s-address" value={subject.address} onChange={(e) => setSubject({ ...subject, address: e.target.value })} required /></Field>
        {homeFields(subject, (patch) => setSubject({ ...subject, ...patch }), "s")}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">🏘️ {t("compsTitle")}</h2>
          <p className="text-lg text-slate-700">{t("compsHint")}</p>
        </div>
        {comps.map((c, i) => {
          const update = (patch: Partial<CompRow>) => setComps(comps.map((row, j) => (j === i ? { ...row, ...patch } : row)));
          return (
            <fieldset key={i} className="space-y-4 rounded-2xl border-2 border-slate-200 bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <legend className="text-xl font-bold">{t("compNumber", { number: i + 1 })}</legend>
                {comps.length > 1 ? (
                  <button type="button" onClick={() => setComps(comps.filter((_, j) => j !== i))} className="min-h-11 rounded-lg border-2 border-red-300 px-4 text-base font-semibold text-red-800 hover:bg-red-50">
                    {t("removeComp")}
                  </button>
                ) : null}
              </div>
              <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
                <Field label={t("address")} htmlFor={`c${i}-address`}><Input id={`c${i}-address`} value={c.address} onChange={(e) => update({ address: e.target.value })} /></Field>
                <Field label={t("status")} htmlFor={`c${i}-status`}>
                  <Select id={`c${i}-status`} value={c.status} onChange={(e) => update({ status: e.target.value as CompRow["status"] })}>
                    {(["sold", "pending", "active"] as const).map((s) => <option key={s} value={s}>{t(`statuses.${s}`)}</option>)}
                  </Select>
                </Field>
                <Field label={c.status === "sold" ? t("soldPrice") : t("listPrice")} htmlFor={`c${i}-price`}>
                  <Input id={`c${i}-price`} inputMode="numeric" value={c.price} onChange={(e) => update({ price: e.target.value })} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("date")} htmlFor={`c${i}-date`}><Input id={`c${i}-date`} type="date" value={c.date} onChange={(e) => update({ date: e.target.value })} /></Field>
                <Field label={t("distance")} htmlFor={`c${i}-dist`}><Input id={`c${i}-dist`} inputMode="decimal" value={c.distanceMiles} onChange={(e) => update({ distanceMiles: e.target.value })} /></Field>
              </div>
              {homeFields(c, (patch) => update(patch), `c${i}`)}
              <Field label={t("notes")} htmlFor={`c${i}-notes`}><Input id={`c${i}-notes`} value={c.notes} placeholder={t("notesPlaceholder")} onChange={(e) => update({ notes: e.target.value })} /></Field>
            </fieldset>
          );
        })}
        {comps.length < 8 ? (
          <button type="button" onClick={() => setComps([...comps, blankComp()])} className="min-h-14 w-full rounded-2xl border-2 border-dashed border-brand-600 bg-white text-lg font-semibold text-brand-800 hover:bg-brand-50">
            ＋ {t("addComp")}
          </button>
        ) : null}
      </section>

      <details className="rounded-2xl border-2 border-slate-200 bg-white p-6">
        <summary className="cursor-pointer text-xl font-bold">⚙️ {t("adjustmentsTitle")}</summary>
        <p className="mt-3 text-lg text-slate-700">{t("adjustmentsHint")}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {(Object.keys(settings) as (keyof typeof settings)[]).map((key) => (
            <Field key={key} label={t(`settings.${key}`)} htmlFor={`set-${key}`} hint={key === "sqftRate" ? t("sqftRateHint") : undefined}>
              <Input id={`set-${key}`} inputMode="decimal" value={settings[key]} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} />
            </Field>
          ))}
        </div>
      </details>

      <section className="grid gap-4 rounded-2xl border-2 border-slate-200 bg-white p-6 sm:grid-cols-2">
        <Field label={t("language")} htmlFor="cma-language">
          <Select id="cma-language" value={language} onChange={(e) => setLanguage(e.target.value)}>
            {languages.map((l) => <option key={l.code} value={l.code}>{l.native}</option>)}
          </Select>
        </Field>
        <Field label={t("audience")} htmlFor="cma-audience">
          <Select id="cma-audience" value={audience} onChange={(e) => setAudience(e.target.value)}>
            <option value="seller">{t("audiences.seller")}</option>
            <option value="buyer">{t("audiences.buyer")}</option>
          </Select>
        </Field>
      </section>

      <div className="space-y-2">
        <SubmitButton pendingText={t("working")} size="xl" disabled={filled.length === 0 || !subject.sqft || !subject.address}>
          📊 {t("submit")}
        </SubmitButton>
        <p className="text-base text-slate-700">{t("submitHint", { count: filled.length })}</p>
      </div>
    </form>
  );
}
