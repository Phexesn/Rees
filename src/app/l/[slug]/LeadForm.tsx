"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitLeadAction, type LeadFormState } from "@/app/l/[slug]/actions";

function textOn(hex: string): string {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  const lum = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    .map((c) => c / 255)
    .map((s) => (s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2] > 0.4 ? "#0f172a" : "#ffffff";
}

export type LeadFormLabels = {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  contactHint: string;
  interest: string;
  interests: { value: string; label: string }[];
  message: string;
  emailOptIn: string;
  smsConsent: string;
  workingWithAgent: string;
  yes: string;
  no: string;
  submit: string;
  sending: string;
  thanksTitle: string;
  thanksBody: string;
  nextVisitor: string;
  errors: Record<NonNullable<LeadFormState["error"]>, string>;
  optional: string;
};

const input =
  "block min-h-14 w-full rounded-xl border-2 border-slate-400 bg-white px-4 text-xl text-slate-900 focus:outline-none focus:ring-4 aria-[invalid=true]:border-red-600";

export function LeadForm({
  slug,
  labels,
  accent,
  kiosk = false,
}: {
  slug: string;
  labels: LeadFormLabels;
  accent: string;
  kiosk?: boolean;
}) {
  const [state, action, pending] = useActionState(submitLeadAction, {} as LeadFormState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && kiosk) {
      const timer = setTimeout(() => window.location.reload(), 6000);
      return () => clearTimeout(timer);
    }
  }, [state.ok, kiosk]);

  if (state.ok) {
    return (
      <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-8 text-center" role="status">
        <p className="text-5xl" aria-hidden>🎉</p>
        <p className="mt-3 text-2xl font-bold text-green-950">{labels.thanksTitle}</p>
        <p className="mt-2 text-lg text-green-950">{labels.thanksBody}</p>
        {kiosk ? <p className="mt-4 text-base text-slate-700">{labels.nextVisitor}</p> : null}
      </div>
    );
  }

  const invalid = (f: string) => Boolean(state.fieldErrors?.[f]);
  return (
    <form ref={formRef} action={action} className="space-y-5" noValidate>
      <h2 className="text-2xl font-bold">{labels.title}</h2>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="source" value={kiosk ? "OPEN_HOUSE" : "MICROSITE"} />
      <input type="hidden" name="consentText" value={labels.smsConsent} />
      <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {state.error ? (
        <p role="alert" className="rounded-xl border-2 border-red-300 bg-red-50 p-4 text-lg font-semibold text-red-900">
          {labels.errors[state.error]}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="block text-lg font-semibold">{labels.firstName}</span>
          <input name="firstName" autoComplete="given-name" required className={input} aria-invalid={invalid("firstName")} />
        </label>
        <label className="block space-y-2">
          <span className="block text-lg font-semibold">
            {labels.lastName} <span className="font-normal text-slate-700">({labels.optional})</span>
          </span>
          <input name="lastName" autoComplete="family-name" className={input} />
        </label>
      </div>
      <p className="text-base text-slate-700">{labels.contactHint}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="block text-lg font-semibold">{labels.email}</span>
          <input name="email" type="email" autoComplete="email" inputMode="email" className={input} aria-invalid={invalid("email")} />
        </label>
        <label className="block space-y-2">
          <span className="block text-lg font-semibold">{labels.phone}</span>
          <input name="phone" type="tel" autoComplete="tel" inputMode="tel" className={input} aria-invalid={invalid("phone")} />
        </label>
      </div>
      {!kiosk ? (
        <>
          <label className="block space-y-2">
            <span className="block text-lg font-semibold">{labels.interest}</span>
            <select name="interest" className={`${input} cursor-pointer`}>
              {labels.interests.map((i) => (
                <option key={i.value} value={i.value}>{i.label}</option>
              ))}
            </select>
          </label>
          <label className="block space-y-2">
            <span className="block text-lg font-semibold">
              {labels.message} <span className="font-normal text-slate-700">({labels.optional})</span>
            </span>
            <textarea name="message" rows={3} className={`${input} py-3`} />
          </label>
        </>
      ) : (
        <fieldset className="space-y-2">
          <legend className="text-lg font-semibold">{labels.workingWithAgent}</legend>
          <input type="hidden" name="interest" value="Open house visit" />
          <div className="flex gap-3">
            {(["yes", "no"] as const).map((v) => (
              <label key={v} className="flex min-h-14 flex-1 cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-slate-300 text-lg font-semibold has-[:checked]:border-slate-900 has-[:checked]:bg-slate-100">
                <input type="radio" name="workingWithAgent" value={v} className="size-6" />
                {v === "yes" ? labels.yes : labels.no}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <label className="flex cursor-pointer items-start gap-3 text-base text-slate-800">
        <input type="checkbox" name="emailOptIn" className="mt-1 size-6 shrink-0" />
        <span>{labels.emailOptIn}</span>
      </label>
      <label className="flex cursor-pointer items-start gap-3 text-base text-slate-800">
        <input type="checkbox" name="smsConsent" className="mt-1 size-6 shrink-0" />
        <span>{labels.smsConsent}</span>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="min-h-16 w-full rounded-xl px-6 text-xl font-bold disabled:opacity-60"
        style={{ backgroundColor: accent, color: textOn(accent) }}
      >
        {pending ? labels.sending : labels.submit}
      </button>
    </form>
  );
}
