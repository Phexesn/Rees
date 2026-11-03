import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LeadForm } from "@/app/l/[slug]/LeadForm";
import { leadFormLabels } from "@/app/l/[slug]/labels";
import { isUiLocale } from "@/lib/languages";
import { findPublishedMicrosite } from "@/lib/leads";

export const metadata: Metadata = { title: "Open house sign-in", robots: { index: false } };

/** Tablet-friendly sign-in screen for open houses. Resets itself after each visitor. */
export default async function OpenHouseKiosk({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await findPublishedMicrosite(slug);
  if (!found) notFound();
  const { site, profile } = found;
  const locale = isUiLocale(site.language) ? site.language : "en";
  const t = await getTranslations({ locale, namespace: "publicPage" });
  const labels = await leadFormLabels(site.language, profile?.displayName ?? "", true);
  return (
    <div lang={locale} className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="text-center">
          <p className="text-5xl" aria-hidden>👋</p>
          <h1 className="mt-3 text-4xl font-bold">{t("kioskWelcome")}</h1>
          <p className="mt-2 text-2xl text-slate-800">{site.property.address}</p>
          <p className="mt-1 text-lg text-slate-700">{profile?.displayName}{profile?.brokerage ? ` · ${profile.brokerage}` : ""}</p>
        </div>
        <div className="rounded-3xl border-2 border-slate-200 bg-white p-8 shadow-sm">
          <LeadForm slug={site.slug} labels={labels} accent={site.accentColor} kiosk />
        </div>
        <p className="text-center text-base text-slate-700">⚖️ {t("equalHousing")}</p>
      </div>
    </div>
  );
}
