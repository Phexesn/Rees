import { getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui";
import { minPlanFor, PLANS, type Feature } from "@/lib/features";

/** Shown instead of a feature the tenant's plan does not include — never a crash or a blank page. */
export async function LockedFeature({ feature }: { feature: Feature }) {
  const t = await getTranslations("locked");
  const tp = await getTranslations("billing.plans");
  const plan = minPlanFor(feature);
  return (
    <div className="rounded-2xl border-2 border-brand-200 bg-brand-50 p-8 text-center md:p-12">
      <p className="text-5xl" aria-hidden>🔒</p>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">{t(`features.${feature}.title`)}</h1>
      <p className="mx-auto mt-3 max-w-2xl text-xl text-slate-800">{t(`features.${feature}.pitch`)}</p>
      <p className="mt-6 text-lg font-semibold text-slate-900">
        {t("includedIn", { plan: tp(`${plan}.name`), price: PLANS[plan].priceMonthly })}
      </p>
      <div className="mt-6 flex justify-center">
        <LinkButton href={`/settings/billing?plan=${plan}`} size="xl">
          {t("upgradeButton", { plan: tp(`${plan}.name`) })}
        </LinkButton>
      </div>
    </div>
  );
}
