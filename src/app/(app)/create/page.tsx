import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BatchList } from "@/components/BatchList";
import { PageHeader } from "@/components/ui";
import { requireSetupContext } from "@/lib/auth/context";
import { summarizeBatches } from "@/lib/generation/history";
import { listModuleMeta } from "@/modules";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("create");
  return { title: t("title") };
}

export default async function CreatePage() {
  const ctx = await requireSetupContext();
  const t = await getTranslations("create");
  const tm = await getTranslations("modules");
  const modules = listModuleMeta();
  const recent = await ctx.db.generation.findMany({
    orderBy: { createdAt: "desc" },
    take: 40,
    select: { id: true, batchId: true, moduleId: true, language: true, createdAt: true, status: true },
  });

  return (
    <div className="space-y-10">
      <PageHeader title={t("title")} description={t("subtitle")} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((m) => (
          <Link
            key={m.id}
            href={`/create/${m.id}`}
            className="flex min-h-36 flex-col gap-2 rounded-2xl border-2 border-slate-200 bg-white p-6 hover:border-brand-600 hover:shadow-md"
          >
            <span className="text-5xl" aria-hidden>{m.icon}</span>
            <span className="text-xl font-bold">
              {tm(`${m.id}.name`)} {!ctx.can(m.feature) ? <span aria-label={t("locked")}>🔒</span> : null}
            </span>
            <span className="text-base text-slate-700">{tm(`${m.id}.description`)}</span>
          </Link>
        ))}
      </div>
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">{t("recent")}</h2>
        <BatchList batches={summarizeBatches(recent).slice(0, 15)} />
      </section>
    </div>
  );
}
