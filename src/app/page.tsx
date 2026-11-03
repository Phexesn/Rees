import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import { LinkButton } from "@/components/ui";
import { getContext } from "@/lib/auth/context";
import { PLAN_ORDER, PLANS } from "@/lib/features";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("landing");
  return { title: { absolute: t("metaTitle") }, description: t("metaDescription") };
}

const FEATURES = [
  { key: "mls", icon: "🏡" },
  { key: "social", icon: "📣" },
  { key: "reels", icon: "🎬" },
  { key: "email", icon: "✉️" },
  { key: "coach", icon: "🧭" },
  { key: "pages", icon: "🌐" },
  { key: "crm", icon: "👥" },
  { key: "cma", icon: "📊" },
  { key: "checklists", icon: "✅" },
] as const;

const FAQ = ["computers", "accuracy", "posting", "privacy", "cancel", "languages"] as const;
const COMING = ["mls", "esign", "sending", "showings"] as const;
const PLAN_POINTS: Record<string, string[]> = {
  SOLO: ["marketing", "photoGuide", "coach", "oneLanguage", "tenListings"],
  PRO: ["everythingSolo", "crm", "microsites", "cma", "threeLanguages", "unlimitedListings"],
  TEAM: ["everythingPro", "fiveSeats", "allLanguages", "whiteLabel", "teamDashboard"],
};

export default async function LandingPage() {
  if (await getContext()) redirect("/dashboard");
  const t = await getTranslations("landing");
  const tb = await getTranslations("billing");

  return (
    <div className="bg-white">
      <header className="border-b-2 border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <Logo />
          <div className="flex flex-wrap items-center gap-4">
            <div className="hidden md:block"><LanguageSwitcher /></div>
            <div className="md:hidden"><LanguageSwitcher compact /></div>
            <LinkButton href="/login" variant="ghost">{t("signIn")}</LinkButton>
          </div>
        </div>
      </header>

      <main>
        <section className="bg-gradient-to-b from-brand-50 to-white">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
            <p className="text-lg font-bold uppercase tracking-wide text-brand-800">{t("eyebrow")}</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-bold leading-tight text-slate-900 md:text-5xl">{t("heroTitle")}</h1>
            <p className="mt-6 max-w-3xl text-xl text-slate-800 md:text-2xl">{t("heroBody")}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <LinkButton href="/signup" size="xl">{t("ctaTrial")}</LinkButton>
              <LinkButton href="#how" size="xl" variant="secondary">{t("ctaHow")}</LinkButton>
            </div>
            <p className="mt-4 text-lg text-slate-700">{t("ctaNote")}</p>
          </div>
        </section>

        <section className="border-y-2 border-amber-200 bg-amber-50">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="text-6xl" aria-hidden>📷</p>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">{t("photoTitle")}</h2>
              <p className="mt-4 text-xl text-slate-800">{t("photoBody")}</p>
            </div>
            <ul className="space-y-3">
              {(["settings", "light", "shots", "editing", "video"] as const).map((k) => (
                <li key={k} className="flex gap-3 rounded-xl bg-white p-4 text-lg shadow-sm">
                  <span aria-hidden className="text-green-700">✓</span>
                  {t(`photoPoints.${k}`)}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl scroll-mt-8 px-4 py-16">
          <h2 className="text-3xl font-bold md:text-4xl">{t("howTitle")}</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {(["one", "two", "three"] as const).map((k, i) => (
              <li key={k} className="rounded-2xl border-2 border-slate-200 p-6">
                <span className="flex size-12 items-center justify-center rounded-full bg-brand-700 text-2xl font-bold text-white">{i + 1}</span>
                <h3 className="mt-4 text-2xl font-bold">{t(`how.${k}.title`)}</h3>
                <p className="mt-2 text-lg text-slate-800">{t(`how.${k}.body`)}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-3xl font-bold md:text-4xl">{t("featuresTitle")}</h2>
            <p className="mt-3 max-w-3xl text-xl text-slate-800">{t("featuresBody")}</p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.key} className="rounded-2xl border-2 border-slate-200 bg-white p-6">
                  <p className="text-4xl" aria-hidden>{f.icon}</p>
                  <h3 className="mt-3 text-xl font-bold">{t(`features.${f.key}.title`)}</h3>
                  <p className="mt-2 text-lg text-slate-800">{t(`features.${f.key}.body`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-3">
          {(["fairHousing", "languages", "easy"] as const).map((k) => (
            <div key={k} className="rounded-2xl border-2 border-brand-200 bg-brand-50 p-6">
              <p className="text-4xl" aria-hidden>{k === "fairHousing" ? "🛡️" : k === "languages" ? "🌐" : "👓"}</p>
              <h3 className="mt-3 text-2xl font-bold">{t(`trust.${k}.title`)}</h3>
              <p className="mt-2 text-lg text-slate-800">{t(`trust.${k}.body`)}</p>
            </div>
          ))}
        </section>

        <section id="pricing" className="bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-3xl font-bold md:text-4xl">{t("pricingTitle")}</h2>
            <p className="mt-3 text-xl text-slate-800">{t("pricingBody")}</p>
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {PLAN_ORDER.map((plan) => (
                <div key={plan} className={`flex flex-col rounded-2xl border-2 bg-white p-6 ${plan === "PRO" ? "border-brand-600 ring-4 ring-brand-100" : "border-slate-200"}`}>
                  <h3 className="text-2xl font-bold">{tb(`plans.${plan}.name`)}</h3>
                  <p className="text-lg text-slate-700">{tb(`plans.${plan}.tagline`)}</p>
                  <p className="mt-4 text-5xl font-bold">${PLANS[plan].priceMonthly}<span className="text-lg font-normal text-slate-700"> {tb("perMonth")}</span></p>
                  <ul className="mt-6 flex-1 space-y-2">
                    {PLAN_POINTS[plan].map((f) => (
                      <li key={f} className="flex gap-2 text-lg"><span aria-hidden className="text-green-700">✓</span>{tb(`features.${f}`)}</li>
                    ))}
                  </ul>
                  <LinkButton href="/signup" className="mt-6" variant={plan === "PRO" ? "primary" : "secondary"}>{t("ctaTrialShort")}</LinkButton>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-16">
          <h2 className="text-3xl font-bold md:text-4xl">{t("faqTitle")}</h2>
          <div className="mt-6 space-y-3">
            {FAQ.map((k) => (
              <details key={k} className="group rounded-2xl border-2 border-slate-200 p-5">
                <summary className="cursor-pointer list-none text-xl font-bold">
                  <span aria-hidden className="mr-2 inline-block transition group-open:rotate-90">▶</span>
                  {t(`faq.${k}.q`)}
                </summary>
                <p className="mt-3 text-lg text-slate-800">{t(`faq.${k}.a`)}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <h2 className="text-2xl font-bold">{t("comingTitle")}</h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {COMING.map((k) => (
                <li key={k} className="rounded-full border-2 border-slate-300 bg-white px-4 py-2 text-lg">{t(`coming.${k}`)}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-brand-900 text-white">
          <div className="mx-auto max-w-6xl px-4 py-16 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">{t("finalTitle")}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-brand-100">{t("finalBody")}</p>
            <LinkButton href="/signup" size="xl" variant="secondary" className="mt-8">{t("ctaTrial")}</LinkButton>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-base text-slate-700">
          <p>© {new Date().getFullYear()} RealtyBoost</p>
          <p>{t("footerNote")}</p>
        </div>
      </footer>
    </div>
  );
}
