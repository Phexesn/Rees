"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { loginAction, signupAction } from "@/app/(auth)/actions";
import { Alert, Field, Input } from "@/components/ui";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialActionState } from "@/lib/actions";

export function LoginForm({ next }: { next?: string }) {
  const t = useTranslations("auth");
  const tr = useTranslations();
  const [state, action] = useActionState(loginAction, initialActionState);
  return (
    <form action={action} className="space-y-6" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {state.error ? <Alert tone="error">{tr(state.error)}</Alert> : null}
      <Field label={t("email")} htmlFor="email" error={state.fieldErrors?.email && tr(state.fieldErrors.email)}>
        <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={!!state.fieldErrors?.email} />
      </Field>
      <Field label={t("password")} htmlFor="password" error={state.fieldErrors?.password && tr(state.fieldErrors.password)}>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <SubmitButton pendingText={t("signingIn")} size="xl" className="w-full">
        {t("signInButton")}
      </SubmitButton>
      <p className="text-center text-lg">
        {t("noAccount")}{" "}
        <Link href="/signup" className="font-semibold text-brand-800 underline">
          {t("startTrial")}
        </Link>
      </p>
    </form>
  );
}

export function SignupForm() {
  const t = useTranslations("auth");
  const tr = useTranslations();
  const locale = useLocale();
  const [state, action] = useActionState(signupAction, initialActionState);
  const err = (field: string) => (state.fieldErrors?.[field] ? tr(state.fieldErrors[field]) : undefined);
  return (
    <form action={action} className="space-y-6" noValidate>
      <input type="hidden" name="locale" value={locale} />
      {state.error ? <Alert tone="error">{tr(state.error)}</Alert> : null}
      <Field label={t("name")} htmlFor="name" hint={t("nameHint")} error={err("name")}>
        <Input id="name" name="name" autoComplete="name" required aria-invalid={!!err("name")} />
      </Field>
      <Field label={t("email")} htmlFor="email" error={err("email")}>
        <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={!!err("email")} />
      </Field>
      <Field label={t("password")} htmlFor="password" hint={t("passwordHint")} error={err("password")}>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required aria-invalid={!!err("password")} />
      </Field>
      <SubmitButton pendingText={t("creatingAccount")} size="xl" className="w-full">
        {t("createAccountButton")}
      </SubmitButton>
      <p className="text-center text-base text-slate-700">{t("trialNote")}</p>
      <p className="text-center text-lg">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-semibold text-brand-800 underline">
          {t("signIn")}
        </Link>
      </p>
    </form>
  );
}
