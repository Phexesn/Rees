import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { BatchList } from "@/components/BatchList";
import { Alert, Badge, Card, LinkButton, PageHeader } from "@/components/ui";
import { requireSetupContext } from "@/lib/auth/context";
import { env } from "@/lib/env";
import { summarizeBatches } from "@/lib/generation/history";
import { listModuleMeta } from "@/modules";
import { money } from "@/modules/_shared/variables";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const ctx = await requireSetupContext();
  const { id } = await params;
  const p = await ctx.db.property.findUnique({ where: { id }, select: { address: true } });
  return { title: p?.address ?? "Listing" };
}

export default async function PropertyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; saved?: string }>;
}) {
  const ctx = await requireSetupContext();
  const { id } = await params;
  const flags = await searchParams;
  const property = await ctx.db.property.findUnique({ where: { id }, include: { microsite: true } });
  if (!property) notFound();
  const [generations, deals, cmas] = await Promise.all([
    ctx.db.generation.findMany({
      where: { propertyId: id },
      orderBy: { createdAt: "desc" },
      take: 60,
      select: { id: true, batchId: true, moduleId: true, language: true, createdAt: true, status: true },
    }),
    ctx.can("CRM") ? ctx.db.deal.findMany({ where: { propertyId: id }, include: { contact: true } }) : Promise.resolve([]),
    ctx.can("CMA") ? ctx.db.cma.findMany({ where: { propertyId: id }, orderBy: { createdAt: "desc" } }) : Promise.resolve([]),
  ]);
  const t = await getTranslations("properties");
  const tf = await getTranslations("properties.form");
  const tm = await getTranslations("modules");
  const modules = listModuleMeta();

  const facts = [
    money(property.price),
    property.beds ? t("bedsShort", { count: property.beds }) : null,
    property.baths ? t("bathsShort", { count: property.baths }) : null,
    property.sqft ? t("sqftShort", { count: property.sqft }) : null,
    property.yearBuilt ? t("builtIn", { year: property.yearBuilt }) : null,
  ].filter(Boolean);

  return (
    <div className="space-y-10">
      <PageHeader
        title={property.address}
        description={
          <span>
            {property.city}, {property.state} {property.zip} · <Badge tone="green">{tf(`statuses.${property.status}`)}</Badge>
          </span>
        }
        back={{ href: "/properties", label: t("backToListings") }}
        actions={<LinkButton href={`/properties/${id}/edit`} variant="secondary">✏️ {t("editDetails")}</LinkButton>}
      />
      {flags.created ? <Alert tone="success" title={t("createdTitle")}>{t("createdBody")}</Alert> : null}
      {flags.saved ? <Alert tone="success">{t("saved")}</Alert> : null}

      <Card>
        <div className="flex flex-col gap-6 md:flex-row">
          {property.heroImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={property.heroImageUrl} alt="" className="h-48 w-full rounded-xl object-cover md:w-72" />
          ) : null}
          <div className="space-y-3 text-lg">
            <p className="text-2xl font-bold">{facts.join(" · ")}</p>
            {property.features ? <p><span className="font-semibold">{tf("features")}:</span> {property.features}</p> : null}
            {property.upgrades ? <p><span className="font-semibold">{tf("upgrades")}:</span> {property.upgrades}</p> : null}
            {!property.features && !property.upgrades ? (
              <Alert tone="warning">{t("addDetailsTip")}</Alert>
            ) : null}
          </div>
        </div>
      </Card>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">{t("createForListing")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {modules.map((m) => {
            const locked = !ctx.can(m.feature);
            return (
              <Link
                key={m.id}
                href={`/create/${m.id}?propertyId=${id}`}
                className="flex min-h-28 items-start gap-4 rounded-2xl border-2 border-slate-200 bg-white p-5 hover:border-brand-600 hover:shadow-md"
              >
                <span className="text-4xl" aria-hidden>{m.icon}</span>
                <span>
                  <span className="block text-xl font-bold">
                    {tm(`${m.id}.name`)} {locked ? <span aria-label={t("locked")}>🔒</span> : null}
                  </span>
                  <span className="block text-base text-slate-700">{tm(`${m.id}.description`)}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">🌐 {t("micrositeTitle")}</h2>
        <Card>
          {property.microsite ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1 text-lg">
                <p>
                  {property.microsite.published ? <Badge tone="green">{t("pageLive")}</Badge> : <Badge tone="amber">{t("pageDraft")}</Badge>}{" "}
                  {t("pageViews", { count: property.microsite.views })}
                </p>
                {property.microsite.published ? (
                  <p className="break-all font-mono text-base">{`${env.appUrl()}/l/${property.microsite.slug}`}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3">
                {property.microsite.published ? (
                  <>
                    <LinkButton href={`/l/${property.microsite.slug}`} variant="secondary" target="_blank">
                      {t("viewPage")} ↗
                    </LinkButton>
                    <LinkButton href={`/l/${property.microsite.slug}/open-house`} variant="secondary" target="_blank">
                      {t("openHouseKiosk")} ↗
                    </LinkButton>
                  </>
                ) : null}
                <LinkButton href={`/properties/${id}/microsite`}>{t("editPage")}</LinkButton>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="max-w-xl text-lg text-slate-800">{t("micrositePitch")}</p>
              <LinkButton href={`/properties/${id}/microsite`}>
                {ctx.can("MICROSITES") ? t("createPage") : `🔒 ${t("createPage")}`}
              </LinkButton>
            </div>
          )}
        </Card>
      </section>

      {ctx.can("CRM") && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">📋 {t("dealsTitle")}</h2>
            <LinkButton href={`/deals/new?propertyId=${id}`} variant="secondary" size="md">＋ {t("addDeal")}</LinkButton>
          </div>
          {deals.length ? (
            <ul className="space-y-2">
              {deals.map((d) => (
                <li key={d.id}>
                  <Link href={`/deals/${d.id}`} className="block rounded-xl border-2 border-slate-200 bg-white p-4 text-lg hover:border-brand-600">
                    {d.title} · {d.contact.firstName} {d.contact.lastName ?? ""}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-lg text-slate-700">{t("noDeals")}</p>
          )}
        </section>
      )}

      {ctx.can("CMA") && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">📊 {t("cmaTitle")}</h2>
            <LinkButton href={`/cma/new?propertyId=${id}`} variant="secondary" size="md">＋ {t("newCma")}</LinkButton>
          </div>
          {cmas.length ? (
            <ul className="space-y-2">
              {cmas.map((c) => (
                <li key={c.id}>
                  <Link href={`/cma/${c.id}`} className="block rounded-xl border-2 border-slate-200 bg-white p-4 text-lg hover:border-brand-600">
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">🗂️ {t("historyTitle")}</h2>
        <BatchList batches={summarizeBatches(generations)} />
      </section>
    </div>
  );
}
