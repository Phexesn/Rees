import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TaskList } from "@/components/crm/TaskList";
import { LockedFeature } from "@/components/LockedFeature";
import { PageHeader } from "@/components/ui";
import { requireSetupContext } from "@/lib/auth/context";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("crm.tasks");
  return { title: t("pageTitle") };
}

export default async function TasksPage() {
  const ctx = await requireSetupContext();
  if (!ctx.can("CRM")) return <LockedFeature feature="CRM" />;
  const t = await getTranslations("crm.tasks");
  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  const include = { contact: { select: { id: true, firstName: true, lastName: true } }, deal: { select: { id: true, title: true } } };
  const [overdue, today, upcoming, noDate, done] = await Promise.all([
    ctx.db.task.findMany({ where: { completedAt: null, dueAt: { lt: new Date(now.toDateString()) } }, orderBy: { dueAt: "asc" }, include }),
    ctx.db.task.findMany({ where: { completedAt: null, dueAt: { gte: new Date(now.toDateString()), lte: endOfToday } }, orderBy: { dueAt: "asc" }, include }),
    ctx.db.task.findMany({ where: { completedAt: null, dueAt: { gt: endOfToday } }, orderBy: { dueAt: "asc" }, take: 50, include }),
    ctx.db.task.findMany({ where: { completedAt: null, dueAt: null }, orderBy: { createdAt: "desc" }, take: 50, include }),
    ctx.db.task.findMany({ where: { completedAt: { not: null } }, orderBy: { completedAt: "desc" }, take: 20, include }),
  ]);
  const groups = [
    { key: "overdue", tasks: overdue, icon: "⚠️" },
    { key: "today", tasks: today, icon: "📅" },
    { key: "upcoming", tasks: upcoming, icon: "🗓️" },
    { key: "noDate", tasks: noDate, icon: "📌" },
    { key: "done", tasks: done, icon: "✅" },
  ] as const;

  return (
    <div className="space-y-8">
      <PageHeader title={t("pageTitle")} description={t("pageSubtitle")} />
      <TaskList tasks={[]} back="/tasks" showForm />
      {groups.map((g) =>
        g.tasks.length ? (
          <section key={g.key} className="space-y-3">
            <h2 className="text-2xl font-bold">{g.icon} {t(`groups.${g.key}`)} <span className="text-lg font-normal text-slate-700">({g.tasks.length})</span></h2>
            <TaskList tasks={g.tasks} back="/tasks" showLinks showForm={false} />
          </section>
        ) : null,
      )}
      {groups.every((g) => g.tasks.length === 0) ? <p className="text-lg text-slate-700">{t("allClear")}</p> : null}
    </div>
  );
}
