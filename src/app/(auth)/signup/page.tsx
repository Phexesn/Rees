import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SignupForm } from "@/app/(auth)/AuthForms";
import { Card } from "@/components/ui";
import { getContext } from "@/lib/auth/context";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("signUpTitle") };
}

export default async function SignupPage() {
  if (await getContext()) redirect("/dashboard");
  const t = await getTranslations("auth");
  return (
    <Card>
      <h1 className="mb-2 text-3xl font-bold">{t("signUpTitle")}</h1>
      <p className="mb-8 text-lg text-slate-700">{t("signUpSubtitle")}</p>
      <SignupForm />
    </Card>
  );
}
