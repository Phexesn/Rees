import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Alert, Badge, EmptyState, LinkButton, PageHeader } from "@/components/ui";
import { requireSetupContext } from "@/lib/auth/context";
import { money } from "@/modules/_shared/variables";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("properties");
  return { title: t("title") };
}

export default async function PropertiesPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const ctx = await requireSetupContext();
  const t = await getTranslations("properties");
  const tf = await getTranslations("properties.form");
  const { deleted } = await searchParams;
  const properties = await ctx.db.property.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { generations: true } }, microsite: { select: { published: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        actions={<LinkButton href="/properties/new">＋ {t("addListing")}</LinkButton>}
      />
      {deleted ? <Alert tone="success">{t("deleted")}</Alert> : null}
      {properties.length === 0 ? (
        <EmptyState
          icon="🏡"
          title={t("emptyTitle")}
          description={t("emptyBody")}
          action={<LinkButton href="/properties/new" size="xl">＋ {t("addFirstListing")}</LinkButton>}
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {properties.map((p) => (
            <li key={p.id}>
              <Link
                href={`/properties/${p.id}`}
                className="block rounded-2xl border-2 border-slate-200 bg-white p-5 hover:border-brand-600 hover:shadow-md"
              >
                <div className="flex gap-4">
                  {p.heroImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.heroImageUrl} alt="" className="size-24 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <div className="flex size-24 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-4xl" aria-hidden>
                      🏠
                    </div>
                  )}
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-xl font-bold">{p.address}</p>
                    <p className="text-lg text-slate-700">
                      {p.city}, {p.state} {p.zip}
                    </p>
                    <p className="text-lg">
                      {[money(p.price), p.beds ? t("bedsShort", { count: p.beds }) : null, p.baths ? t("bathsShort", { count: p.baths }) : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Badge tone={p.status === "ACTIVE" ? "green" : p.status === "SOLD" ? "slate" : "amber"}>{tf(`statuses.${p.status}`)}</Badge>
                      <Badge>{t("piecesCount", { count: p._count.generations })}</Badge>
                      {p.microsite?.published ? <Badge tone="brand">{t("pageLive")}</Badge> : null}
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
