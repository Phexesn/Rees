import type { Metadata } from "next";
import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";
import { LockedFeature } from "@/components/LockedFeature";
import { EmptyState, LinkButton, PageHeader } from "@/components/ui";
import { requireSetupContext } from "@/lib/auth/context";
import type { CmaResult } from "@/lib/cma";
import { money } from "@/modules/_shared/variables";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("cma");
  return { title: t("title") };
}

export default async function CmaListPage() {
  const ctx = await requireSetupContext();
  if (!ctx.can("CMA")) return <LockedFeature feature="CMA" />;
  const t = await getTranslations("cma");
  const format = await getFormatter();
  const cmas = await ctx.db.cma.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("subtitle")} actions={<LinkButton href="/cma/new">＋ {t("newTitle")}</LinkButton>} />
      {cmas.length === 0 ? (
        <EmptyState icon="📊" title={t("emptyTitle")} description={t("emptyBody")} action={<LinkButton href="/cma/new" size="xl">＋ {t("newTitle")}</LinkButton>} />
      ) : (
        <ul className="divide-y-2 divide-slate-100 rounded-2xl border-2 border-slate-200 bg-white">
          {cmas.map((c) => {
            const range = (c.result as unknown as CmaResult).suggestedListRange;
            return (
              <li key={c.id}>
                <Link href={`/cma/${c.id}`} className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-slate-50">
                  <span className="text-xl font-bold">{c.title}</span>
                  <span className="text-lg text-slate-700">
                    {range ? `${money(range.low)} – ${money(range.high)} · ` : ""}
                    {format.dateTime(c.createdAt, { dateStyle: "medium" })}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
