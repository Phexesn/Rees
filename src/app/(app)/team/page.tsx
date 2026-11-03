import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TeammateForm } from "@/app/(app)/team/TeammateForm";
import { LockedFeature } from "@/components/LockedFeature";
import { Badge, PageHeader } from "@/components/ui";
import { requireSetupContext } from "@/lib/auth/context";
import { effectivePlan, PLANS } from "@/lib/features";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("team");
  return { title: t("title") };
}

export default async function TeamPage() {
  const ctx = await requireSetupContext();
  if (!ctx.can("TEAM_DASHBOARD")) return <LockedFeature feature="TEAM_DASHBOARD" />;
  const t = await getTranslations("team");
  const since = new Date(Date.now() - 30 * 86_400_000);
  const [users, generations, contacts, closed, logins] = await Promise.all([
    ctx.db.user.findMany({ orderBy: { createdAt: "asc" } }),
    ctx.db.generation.groupBy({ by: ["userId"], where: { createdAt: { gte: since } }, _count: { _all: true } }),
    ctx.db.auditLog.groupBy({ by: ["userId"], where: { action: "contact:create", createdAt: { gte: since } }, _count: { _all: true } }),
    ctx.db.auditLog.groupBy({ by: ["userId"], where: { action: "deal:stage", createdAt: { gte: since }, metadata: { path: ["to"], equals: "CLOSED" } }, _count: { _all: true } }),
    ctx.db.auditLog.groupBy({ by: ["userId"], where: { action: "auth:login" }, _max: { createdAt: true } }),
  ]);
  const plan = effectivePlan(ctx.tenant);
  const seats = plan ? PLANS[plan].seats : 1;
  const count = (rows: { userId: string | null; _count: { _all: number } }[], id: string) => rows.find((r) => r.userId === id)?._count._all ?? 0;

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} description={t("subtitle", { used: users.length, seats })} />
      <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white">
        <table className="w-full min-w-[40rem] text-left text-lg">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4">{t("member")}</th>
              <th className="p-4">{t("content30")}</th>
              <th className="p-4">{t("contacts30")}</th>
              <th className="p-4">{t("closed30")}</th>
              <th className="p-4">{t("lastSignIn")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t-2 border-slate-100">
                <td className="p-4">
                  <p className="font-bold">{u.name}</p>
                  <p className="text-base text-slate-700">{u.email} <Badge>{t(`roles.${u.role}`)}</Badge></p>
                </td>
                <td className="p-4 text-2xl font-bold">{count(generations, u.id)}</td>
                <td className="p-4 text-2xl font-bold">{count(contacts, u.id)}</td>
                <td className="p-4 text-2xl font-bold">{count(closed, u.id)}</td>
                <td className="p-4 text-base">{logins.find((l) => l.userId === u.id)?._max.createdAt?.toLocaleDateString() ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {ctx.user.role !== "AGENT" && users.length < seats ? <TeammateForm /> : null}
    </div>
  );
}
