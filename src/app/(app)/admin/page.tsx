import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireContext } from "@/lib/auth/context";
import { systemDb } from "@/lib/db";
import { Card, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Admin" };

const usd = (n: number) => `$${n.toFixed(n < 1 ? 4 : 2)}`;

/**
 * Platform admin dashboard (ADMIN_EMAILS or User.isPlatformAdmin).
 * systemDb: intentionally cross-tenant — this is the cost/usage view across all customers.
 * Shown in English only (internal tool).
 */
export default async function AdminPage() {
  const ctx = await requireContext();
  if (!ctx.user.isPlatformAdmin) notFound();
  const db = systemDb();
  const since30 = new Date(Date.now() - 30 * 86_400_000);
  const since7 = new Date(Date.now() - 7 * 86_400_000);

  const [tenants, byPlan, gens30, gens7, failed30, costByTenant, topActions, recentFailures, signups30] = await Promise.all([
    db.tenant.count(),
    db.tenant.groupBy({ by: ["plan", "subscriptionStatus"], _count: { _all: true } }),
    db.generation.aggregate({ where: { createdAt: { gte: since30 } }, _count: { _all: true }, _sum: { costUsd: true, inputTokens: true, outputTokens: true }, _avg: { latencyMs: true } }),
    db.generation.count({ where: { createdAt: { gte: since7 } } }),
    db.generation.count({ where: { createdAt: { gte: since30 }, status: "FAILED" } }),
    db.generation.groupBy({ by: ["tenantId"], where: { createdAt: { gte: since30 } }, _sum: { costUsd: true }, _count: { _all: true }, orderBy: { _sum: { costUsd: "desc" } }, take: 15 }),
    db.auditLog.groupBy({ by: ["action"], where: { createdAt: { gte: since30 } }, _count: { _all: true }, orderBy: { _count: { action: "desc" } }, take: 20 }),
    db.generation.findMany({ where: { status: "FAILED" }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, moduleId: true, errorMessage: true, createdAt: true, tenantId: true } }),
    db.tenant.count({ where: { createdAt: { gte: since30 } } }),
  ]);
  const tenantNames = new Map(
    (await db.tenant.findMany({ where: { id: { in: costByTenant.map((c) => c.tenantId) } }, select: { id: true, name: true, plan: true } })).map((t) => [t.id, t]),
  );
  const totalCost = Number(gens30._sum.costUsd ?? 0);

  return (
    <div className="space-y-8">
      <PageHeader title="Platform admin" description="Usage and AI cost across all accounts (last 30 days unless noted)." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Accounts", tenants.toString()],
          ["New accounts (30d)", signups30.toString()],
          ["Generations (30d / 7d)", `${gens30._count._all} / ${gens7}`],
          ["AI cost (30d)", usd(totalCost)],
          ["Avg cost per generation", gens30._count._all ? usd(totalCost / gens30._count._all) : "—"],
          ["Tokens in / out", `${(gens30._sum.inputTokens ?? 0).toLocaleString()} / ${(gens30._sum.outputTokens ?? 0).toLocaleString()}`],
          ["Avg latency", gens30._avg.latencyMs ? `${(gens30._avg.latencyMs / 1000).toFixed(1)} s` : "—"],
          ["Failed generations", failed30.toString()],
        ].map(([label, value]) => (
          <Card key={label}>
            <p className="text-base text-slate-700">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </Card>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Accounts by plan</h2>
        <ul className="flex flex-wrap gap-3">
          {byPlan.map((p) => (
            <li key={`${p.plan}-${p.subscriptionStatus}`} className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-lg">
              {p.plan} · {p.subscriptionStatus}: <strong>{p._count._all}</strong>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">AI cost per account</h2>
        <table className="w-full rounded-2xl border-2 border-slate-200 bg-white text-left text-lg">
          <thead className="bg-slate-100"><tr><th className="p-3">Account</th><th className="p-3">Plan</th><th className="p-3">Generations</th><th className="p-3">Cost</th></tr></thead>
          <tbody>
            {costByTenant.map((c) => (
              <tr key={c.tenantId} className="border-t-2 border-slate-100">
                <td className="p-3">{tenantNames.get(c.tenantId)?.name ?? c.tenantId}</td>
                <td className="p-3">{tenantNames.get(c.tenantId)?.plan}</td>
                <td className="p-3">{c._count._all}</td>
                <td className="p-3 font-semibold">{usd(Number(c._sum.costUsd ?? 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Most-used actions</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {topActions.map((a) => (
            <li key={a.action} className="flex justify-between rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-lg">
              <span className="font-mono">{a.action}</span>
              <strong>{a._count._all}</strong>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Recent failures</h2>
        {recentFailures.length === 0 ? <p className="text-lg">None 🎉</p> : (
          <ul className="space-y-2">
            {recentFailures.map((f) => (
              <li key={f.id} className="rounded-xl border-2 border-red-200 bg-white p-3 text-base">
                <strong>{f.moduleId}</strong> · {f.createdAt.toISOString()} · {f.errorMessage}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
