import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { openPortalAction, startCheckoutAction } from "@/app/(app)/settings/billing/actions";
import { Alert, Badge, Card, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { requireContext } from "@/lib/auth/context";
import { env } from "@/lib/env";
import { effectivePlan, PLAN_ORDER, PLANS, trialDaysLeft } from "@/lib/features";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("billing");
  return { title: t("title") };
}

const PLAN_FEATURES: Record<string, string[]> = {
  SOLO: ["marketing", "photoGuide", "coach", "oneLanguage", "tenListings", "emailSupport"],
  PRO: ["everythingSolo", "crm", "microsites", "cma", "transactions", "threeLanguages", "unlimitedListings", "chatSupport"],
  TEAM: ["everythingPro", "fiveSeats", "allLanguages", "whiteLabel", "teamDashboard", "prioritySupport"],
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string; error?: string; plan?: string }>;
}) {
  const ctx = await requireContext();
  const t = await getTranslations("billing");
  const params = await searchParams;
  const current = effectivePlan(ctx.tenant);
  const daysLeft = trialDaysLeft(ctx.tenant);
  const devMode = env.devBillingEnabled();

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} description={t("subtitle")} back={{ href: "/settings", label: t("backToSettings") }} />

      {params.success ? <Alert tone="success" title={t("successTitle")}>{t("successBody")}</Alert> : null}
      {params.canceled ? <Alert tone="info">{t("canceledBody")}</Alert> : null}
      {params.error ? <Alert tone="error">{t(`errors.${params.error === "owner" || params.error === "not_configured" ? params.error : "generic"}`)}</Alert> : null}
      {devMode ? <Alert tone="warning" title={t("devModeTitle")}>{t("devModeBody")}</Alert> : null}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-lg text-slate-700">{t("currentPlan")}</p>
            <p className="text-3xl font-bold">
              {current ? t(`plans.${current}.name`) : t("noPlan")}{" "}
              <Badge tone={ctx.tenant.subscriptionStatus === "ACTIVE" ? "green" : ctx.tenant.subscriptionStatus === "TRIALING" ? "brand" : "amber"}>
                {t(`status.${ctx.tenant.subscriptionStatus}`)}
              </Badge>
            </p>
            {daysLeft !== null ? <p className="mt-1 text-lg">{t("trialDaysLeft", { days: daysLeft })}</p> : null}
            {ctx.tenant.currentPeriodEnd ? (
              <p className="mt-1 text-lg text-slate-700">
                {t("renewsOn", { date: ctx.tenant.currentPeriodEnd.toLocaleDateString() })}
              </p>
            ) : null}
          </div>
          {ctx.tenant.stripeCustomerId && !devMode ? (
            <form action={openPortalAction}>
              <SubmitButton variant="secondary" pendingText={t("opening")}>
                {t("manageBilling")}
              </SubmitButton>
            </form>
          ) : null}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {PLAN_ORDER.map((plan) => {
          const isCurrent = current === plan && ctx.tenant.subscriptionStatus === "ACTIVE";
          const highlighted = params.plan === plan || (!params.plan && plan === "PRO");
          return (
            <Card key={plan} className={highlighted ? "border-brand-600 ring-4 ring-brand-100" : ""}>
              <div className="flex h-full flex-col gap-4">
                <div>
                  {plan === "PRO" ? <Badge tone="brand">{t("mostPopular")}</Badge> : null}
                  <h2 className="mt-2 text-2xl font-bold">{t(`plans.${plan}.name`)}</h2>
                  <p className="text-lg text-slate-700">{t(`plans.${plan}.tagline`)}</p>
                  <p className="mt-3 text-4xl font-bold">
                    ${PLANS[plan].priceMonthly}
                    <span className="text-lg font-normal text-slate-700"> {t("perMonth")}</span>
                  </p>
                </div>
                <ul className="flex-1 space-y-2">
                  {PLAN_FEATURES[plan].map((f) => (
                    <li key={f} className="flex gap-2 text-lg">
                      <span aria-hidden className="text-green-700">✓</span>
                      {t(`features.${f}`)}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <p className="rounded-xl bg-green-50 p-4 text-center text-lg font-semibold text-green-900">{t("yourPlan")}</p>
                ) : (
                  <form action={startCheckoutAction}>
                    <input type="hidden" name="plan" value={plan} />
                    <SubmitButton pendingText={t("opening")} className="w-full" variant={highlighted ? "primary" : "secondary"}>
                      {t("choosePlanButton", { plan: t(`plans.${plan}.name`) })}
                    </SubmitButton>
                  </form>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      <p className="text-base text-slate-700">{t("testCardNote")}</p>
    </div>
  );
}
