import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Card, LinkButton, PageHeader } from "@/components/ui";
import { requireContext } from "@/lib/auth/context";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("help");
  return { title: t("title") };
}

const STEPS = ["listing", "create", "copy", "page", "leads"] as const;
const TOPICS = ["photos", "languages", "fairHousing", "coach", "pipeline", "cma", "install", "privacy", "billing"] as const;

export default async function HelpPage() {
  await requireContext();
  const t = await getTranslations("help");
  return (
    <div className="space-y-10">
      <PageHeader title={t("title")} description={t("subtitle")} />

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">🚀 {t("startTitle")}</h2>
        <ol className="space-y-3">
          {STEPS.map((step, i) => (
            <li key={step} className="flex gap-4 rounded-2xl border-2 border-slate-200 bg-white p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xl font-bold text-white">{i + 1}</span>
              <div>
                <p className="text-xl font-bold">{t(`steps.${step}.title`)}</p>
                <p className="text-lg text-slate-800">{t(`steps.${step}.body`)}</p>
              </div>
            </li>
          ))}
        </ol>
        <LinkButton href="/properties/new" size="xl">{t("startButton")}</LinkButton>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">❓ {t("topicsTitle")}</h2>
        {TOPICS.map((topic) => (
          <details key={topic} className="group rounded-2xl border-2 border-slate-200 bg-white p-5">
            <summary className="cursor-pointer list-none text-xl font-bold">
              <span aria-hidden className="mr-2 inline-block transition group-open:rotate-90">▶</span>
              {t(`topics.${topic}.q`)}
            </summary>
            <p className="mt-3 whitespace-pre-line text-lg leading-relaxed text-slate-800">{t(`topics.${topic}.a`)}</p>
          </details>
        ))}
      </section>

      <Card>
        <h2 className="text-2xl font-bold">💬 {t("contactTitle")}</h2>
        <p className="mt-2 text-lg">{t("contactBody")}</p>
        <p className="mt-2 text-lg font-semibold">support@realtyboost.app</p>
      </Card>
    </div>
  );
}
