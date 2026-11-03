"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { addTeammateAction } from "@/app/(app)/team/actions";
import { Alert, Field, Input } from "@/components/ui";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialActionState } from "@/lib/actions";

export function TeammateForm() {
  const t = useTranslations("team");
  const tr = useTranslations();
  const [state, action] = useActionState(addTeammateAction, initialActionState);
  return (
    <form action={action} className="space-y-5 rounded-2xl border-2 border-slate-200 bg-white p-6">
      <h2 className="text-2xl font-bold">＋ {t("addTitle")}</h2>
      {state.ok ? (
        <Alert tone="success" title={t("addedTitle")}>
          {t("addedBody")} <code className="rounded bg-white px-2 py-1 font-mono text-lg">{state.message}</code>
        </Alert>
      ) : null}
      {state.error ? <Alert tone="error">{tr(state.error)}</Alert> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("name")} htmlFor="tm-name"><Input id="tm-name" name="name" required /></Field>
        <Field label={t("email")} htmlFor="tm-email"><Input id="tm-email" name="email" type="email" required /></Field>
      </div>
      <SubmitButton pendingText={t("adding")}>{t("addButton")}</SubmitButton>
    </form>
  );
}
