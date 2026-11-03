import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LeadForm } from "@/app/l/[slug]/LeadForm";
import { leadFormLabels, textOn } from "@/app/l/[slug]/labels";
import { systemDb } from "@/lib/db";
import { isUiLocale } from "@/lib/languages";
import { findPublishedMicrosite } from "@/lib/leads";
import { money } from "@/modules/_shared/variables";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const found = await findPublishedMicrosite(slug);
  if (!found) return { title: "Listing" };
  const { site } = found;
  return {
    title: { absolute: `${site.headline} — ${site.property.city}, ${site.property.state}` },
    description: site.intro ?? undefined,
    openGraph: site.property.heroImageUrl ? { images: [site.property.heroImageUrl] } : undefined,
  };
}

export default async function PublicListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await findPublishedMicrosite(slug);
  if (!found) notFound();
  const { site, profile, tenant } = found;
  const p = site.property;
  const locale = isUiLocale(site.language) ? site.language : "en";
  const t = await getTranslations({ locale, namespace: "publicPage" });
  const agentName = profile?.displayName ?? "";
  const labels = await leadFormLabels(site.language, agentName);
  const accent = site.accentColor;

  // systemDb: public page view counter (no session).
  await systemDb().microsite.update({ where: { id: site.id }, data: { views: { increment: 1 } } });

  const facts = [
    p.beds ? t("beds", { count: p.beds }) : null,
    p.baths ? t("baths", { count: p.baths }) : null,
    p.sqft ? t("sqft", { count: p.sqft }) : null,
    p.yearBuilt ? t("built", { year: p.yearBuilt }) : null,
  ].filter(Boolean);

  return (
    <div lang={locale} className="min-h-screen bg-white">
      <header className="border-b-2 border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <p className="text-xl font-bold">{tenant?.brandName || profile?.brokerage || agentName}</p>
          {profile?.phone ? (
            <a href={`tel:${profile.phone.replace(/[^\d+]/g, "")}`} className="inline-flex min-h-12 items-center rounded-xl px-4 text-lg font-bold" style={{ backgroundColor: accent, color: textOn(accent) }}>
              📞 {profile.phone}
            </a>
          ) : null}
        </div>
      </header>

      {p.heroImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.heroImageUrl} alt={t("photoAlt", { address: p.address })} className="h-72 w-full object-cover md:h-[28rem]" />
      ) : (
        <div className="h-3" style={{ backgroundColor: accent }} />
      )}

      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1fr_26rem]">
        <article className="space-y-8">
          <div>
            <p className="text-lg font-semibold text-slate-700">
              {p.address}
              {p.unit ? `, ${p.unit}` : ""}, {p.city}, {p.state} {p.zip}
            </p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">{site.headline}</h1>
            {site.showPrice && p.price ? <p className="mt-3 text-3xl font-bold" style={{ color: accent === "#ffffff" ? "#0f172a" : accent }}>{money(p.price)}</p> : null}
            {facts.length ? <p className="mt-2 text-xl text-slate-800">{facts.join(" · ")}</p> : null}
          </div>

          {p.openHouseAt ? (
            <div className="rounded-2xl border-2 p-5 text-lg" style={{ borderColor: accent }}>
              <p className="font-bold">🏠 {t("openHouse")}</p>
              <p>
                {p.openHouseAt.toLocaleString(locale, { dateStyle: "full", timeStyle: "short" })}
                {p.openHouseEnd ? ` – ${p.openHouseEnd.toLocaleTimeString(locale, { timeStyle: "short" })}` : ""}
              </p>
            </div>
          ) : null}

          {site.intro ? <p className="text-xl leading-relaxed text-slate-900">{site.intro}</p> : null}

          {site.highlights.length ? (
            <section>
              <h2 className="text-2xl font-bold">{t("highlights")}</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {site.highlights.map((h, i) => (
                  <li key={i} className="flex gap-3 rounded-xl bg-slate-50 p-4 text-lg">
                    <span aria-hidden style={{ color: accent === "#ffffff" ? "#0f172a" : accent }}>✓</span>
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {site.body ? (
            <section>
              <h2 className="text-2xl font-bold">{t("aboutHome")}</h2>
              <div className="mt-4 space-y-4 text-lg leading-relaxed text-slate-900">
                {site.body.split(/\n{2,}/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </section>
          ) : null}
        </article>

        <aside className="space-y-6">
          <div className="rounded-2xl border-2 border-slate-200 p-6 shadow-sm lg:sticky lg:top-6">
            <LeadForm slug={site.slug} labels={labels} accent={accent} />
          </div>
          <div className="flex gap-4 rounded-2xl bg-slate-50 p-5">
            {profile?.headshotUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.headshotUrl} alt={agentName} className="size-20 shrink-0 rounded-full object-cover" />
            ) : null}
            <div className="space-y-1 text-lg">
              <p className="text-xl font-bold">{agentName}</p>
              {profile?.brokerage ? <p>{profile.brokerage}</p> : null}
              {profile?.licenseNumber ? (
                <p className="text-base text-slate-700">{t("license", { state: profile.licenseState ?? "", number: profile.licenseNumber })}</p>
              ) : null}
              {profile?.phone ? <p>{profile.phone}</p> : null}
              {profile?.email ? <p className="break-all">{profile.email}</p> : null}
              {profile?.bio ? <p className="pt-2 text-base text-slate-800">{profile.bio}</p> : null}
            </div>
          </div>
        </aside>
      </main>

      <footer className="border-t-2 border-slate-200">
        <div className="mx-auto max-w-6xl space-y-2 px-4 py-8 text-base text-slate-700">
          <p className="font-semibold">⚖️ {t("equalHousing")}</p>
          <p>{t("disclaimer")}</p>
          {profile?.brokerage ? <p>{t("listedBy", { agent: agentName, brokerage: profile.brokerage })}</p> : null}
        </div>
      </footer>
    </div>
  );
}
