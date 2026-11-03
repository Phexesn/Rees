import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PipelineBoard, type BoardDeal } from "@/app/(app)/pipeline/PipelineBoard";
import { LockedFeature } from "@/components/LockedFeature";
import { Alert, EmptyState, LinkButton, PageHeader } from "@/components/ui";
import { requireSetupContext } from "@/lib/auth/context";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pipeline");
  return { title: t("title") };
}

export default async function PipelinePage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const ctx = await requireSetupContext();
  if (!ctx.can("CRM")) return <LockedFeature feature="CRM" />;
  const t = await getTranslations("pipeline");
  const { deleted } = await searchParams;
  const now = new Date();
  const deals = await ctx.db.deal.findMany({
    include: {
      contact: { select: { firstName: true, lastName: true } },
      property: { select: { address: true } },
      tasks: { where: { completedAt: null, dueAt: { lt: now } }, select: { id: true } },
      activities: { where: { type: "STAGE_CHANGE" }, orderBy: { occurredAt: "desc" }, take: 1, select: { occurredAt: true } },
    },
    orderBy: [{ stage: "asc" }, { position: "asc" }],
  });
  const board: BoardDeal[] = deals.map((d) => ({
    id: d.id,
    title: d.title,
    stage: d.stage,
    position: d.position,
    value: d.value,
    side: d.side,
    contactName: `${d.contact.firstName} ${d.contact.lastName ?? ""}`.trim(),
    address: d.property?.address ?? null,
    overdueTasks: d.tasks.length,
    daysInStage: Math.floor((now.getTime() - (d.activities[0]?.occurredAt ?? d.createdAt).getTime()) / 86_400_000),
  }));
  const active = board.filter((d) => d.stage !== "CLOSED" && d.stage !== "LOST");
  const pipelineValue = active.reduce((sum, d) => sum + (d.value ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("subtitle", { count: active.length, value: `$${pipelineValue.toLocaleString("en-US")}` })}
        actions={<LinkButton href="/deals/new">＋ {t("addDeal")}</LinkButton>}
      />
      {deleted ? <Alert tone="success">{t("deleted")}</Alert> : null}
      {board.length === 0 ? (
        <EmptyState icon="📋" title={t("emptyTitle")} description={t("emptyBody")} action={<LinkButton href="/deals/new" size="xl">＋ {t("addDeal")}</LinkButton>} />
      ) : (
        <>
          <p className="text-lg text-slate-700">{t("hint")}</p>
          <PipelineBoard deals={board} />
        </>
      )}
    </div>
  );
}
