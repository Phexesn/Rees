import type { Metadata } from "next";
import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";
import { BatchList } from "@/components/BatchList";
import { Card, LinkButton } from "@/components/ui";
import { requireSetupContext } from "@/lib/auth/context";
import { effectivePlan, PLANS } from "@/lib/features";
import { summarizeBatches } from "@/lib/generation/history";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard");
  return { title: t("title") };
}

export default async function DashboardPage() {
  const ctx = await requireSetupContext();
  const t = await getTranslations("dashboard");
  const format = await getFormatter();
  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const crm = ctx.can("CRM");

  const [recent, listingsThisMonth, tasks, newLeads, activeDeals] = await Promise.all([
    ctx.db.generation.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, batchId: true, moduleId: true, language: true, createdAt: true, status: true },
    }),
    ctx.db.property.count({ where: { createdAt: { gte: monthStart } } }),
    crm
      ? ctx.db.task.findMany({
          where: { completedAt: null, dueAt: { lte: endOfToday } },
          orderBy: { dueAt: "asc" },
          take: 8,
          include: { contact: { select: { firstName: true, lastName: true } } },
        })
      : Promise.resolve([]),
    crm
      ? ctx.db.contact.findMany({ where: { status: "NEW" }, orderBy: { createdAt: "desc" }, take: 5 })
      : Promise.resolve([]),
    crm ? ctx.db.deal.count({ where: { stage: { notIn: ["CLOSED", "LOST"] } } }) : Promise.resolve(0),
  ]);

  const plan = effectivePlan(ctx.tenant);
  const limit = plan ? PLANS[plan].listingsPerMonth : null;
  const firstName = (ctx.profile?.displayName ?? ctx.user.name).split(" ")[0];
  const hour = now.getHours();
  const greeting = hour < 12 ? t("morning", { name: firstName }) : hour < 18 ? t("afternoon", { name: firstName }) : t("evening", { name: firstName });

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold md:text-4xl">{greeting}</h1>
        <p className="text-xl text-slate-700">{t("subtitle")}</p>
      </header>

      <section aria-labelledby="quick" className="space-y-4">
        <h2 id="quick" className="sr-only">{t("quickActions")}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { href: "/properties/new", icon: "🏡", title: t("addListing"), body: t("addListingBody") },
            { href: "/create", icon: "✨", title: t("createContent"), body: t("createContentBody") },
            { href: "/create/follow-up-coach", icon: "🧭", title: t("coachMe"), body: t("coachMeBody") },
          ].map((a) => (
            <Link key={a.href} href={a.href} className="flex min-h-36 flex-col gap-2 rounded-2xl border-2 border-brand-200 bg-white p-6 hover:border-brand-600 hover:shadow-md">
              <span className="text-5xl" aria-hidden>{a.icon}</span>
              <span className="text-xl font-bold">{a.title}</span>
              <span className="text-base text-slate-700">{a.body}</span>
            </Link>
          ))}
        </div>
      </section>

      {limit !== null ? (
        <Card>
          <p className="text-lg">
            {t("listingUsage", { used: listingsThisMonth, limit })}{" "}
            <Link href="/settings/billing?plan=PRO" className="font-semibold text-brand-800 underline">{t("unlimitedUpgrade")}</Link>
          </p>
          <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-brand-700" style={{ width: `${Math.min(100, (listingsThisMonth / limit) * 100)}%` }} />
          </div>
        </Card>
      ) : null}

      {crm ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold">✅ {t("todayTasks")}</h2>
              <Link href="/tasks" className="text-lg font-semibold text-brand-800 underline">{t("seeAll")}</Link>
            </div>
            {tasks.length === 0 ? (
              <Card><p className="text-lg text-slate-700">{t("noTasks")}</p></Card>
            ) : (
              <ul className="space-y-2">
                {tasks.map((task) => (
                  <li key={task.id} className="rounded-xl border-2 border-slate-200 bg-white p-4">
                    <p className="text-lg font-semibold">{task.title}</p>
                    <p className={`text-base ${task.dueAt && task.dueAt < now ? "font-semibold text-red-700" : "text-slate-700"}`}>
                      {task.dueAt ? format.relativeTime(task.dueAt, now) : ""}
                      {task.contact ? ` · ${task.contact.firstName} ${task.contact.lastName ?? ""}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold">🔔 {t("newLeads")}</h2>
              <Link href="/contacts?status=NEW" className="text-lg font-semibold text-brand-800 underline">{t("seeAll")}</Link>
            </div>
            {newLeads.length === 0 ? (
              <Card><p className="text-lg text-slate-700">{t("noLeads")}</p></Card>
            ) : (
              <ul className="space-y-2">
                {newLeads.map((c) => (
                  <li key={c.id}>
                    <Link href={`/contacts/${c.id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-slate-200 bg-white p-4 hover:border-brand-600">
                      <span className="text-lg font-semibold">{c.firstName} {c.lastName ?? ""}</span>
                      <span className="text-base text-slate-700">{format.relativeTime(c.createdAt, now)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-lg">{t("activeDeals", { count: activeDeals })} · <Link href="/pipeline" className="font-semibold text-brand-800 underline">{t("openPipeline")}</Link></p>
          </section>
        </div>
      ) : (
        <Card className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-2xl text-lg">{t("crmPitch")}</p>
          <LinkButton href="/settings/billing?plan=PRO" variant="secondary">{t("seePro")}</LinkButton>
        </Card>
      )}

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">🗂️ {t("recentContent")}</h2>
        <BatchList batches={summarizeBatches(recent).slice(0, 8)} />
      </section>
    </div>
  );
}
