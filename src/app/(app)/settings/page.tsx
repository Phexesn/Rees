import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BrandForm, ProfileForm } from "@/app/(app)/settings/SettingsForms";
import { Card, LinkButton, PageHeader } from "@/components/ui";
import { requireSetupContext } from "@/lib/auth/context";
import { contentLanguageLimit, effectivePlan } from "@/lib/features";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("settings");
  return { title: t("title") };
}

export default async function SettingsPage() {
  const ctx = await requireSetupContext();
  const t = await getTranslations("settings");
  const tb = await getTranslations("billing");
  const plan = effectivePlan(ctx.tenant);
  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} description={t("subtitle")} />
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-lg text-slate-700">{tb("currentPlan")}</p>
          <p className="text-2xl font-bold">{plan ? tb(`plans.${plan}.name`) : tb("noPlan")}</p>
          <p className="text-base text-slate-700">{ctx.user.email}</p>
        </div>
        <LinkButton href="/settings/billing" variant="secondary">💳 {t("billingLink")}</LinkButton>
      </Card>
      {ctx.profile ? <ProfileForm profile={ctx.profile} languageLimit={contentLanguageLimit(ctx.tenant)} /> : null}
      {ctx.can("WHITE_LABEL") ? <BrandForm tenant={ctx.tenant} /> : null}
    </div>
  );
}
