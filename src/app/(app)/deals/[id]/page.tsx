import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";
import { addNoteAction } from "@/app/(app)/contacts/actions";
import {
  addChecklistAction,
  addChecklistItemAction,
  deleteDealAction,
  setChecklistDueAction,
  toggleChecklistItemAction,
  updateDealAction,
} from "@/app/(app)/deals/actions";
import { DealForm } from "@/app/(app)/deals/DealForm";
import { ActivityLog, NotesPanel } from "@/components/crm/ActivityLog";
import { TaskList } from "@/components/crm/TaskList";
import { LockedFeature } from "@/components/LockedFeature";
import { Alert, Badge, Card, Field, Input, LinkButton, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { requireSetupContext } from "@/lib/auth/context";
import { money } from "@/modules/_shared/variables";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("deals");
  return { title: t("title") };
}

export default async function DealPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; saved?: string }>;
}) {
  const ctx = await requireSetupContext();
  if (!ctx.can("CRM")) return <LockedFeature feature="CRM" />;
  const { id } = await params;
  const flags = await searchParams;
  const deal = await ctx.db.deal.findUnique({
    where: { id },
    include: {
      contact: true,
      property: true,
      tasks: { orderBy: [{ completedAt: "asc" }, { dueAt: "asc" }] },
      notes: { orderBy: { createdAt: "desc" } },
      activities: { orderBy: { occurredAt: "desc" }, take: 40 },
      checklist: { orderBy: { position: "asc" } },
    },
  });
  if (!deal) notFound();
  const t = await getTranslations("deals");
  const ts = await getTranslations("contacts.stages");
  const tp = await getTranslations("pipeline");
  const format = await getFormatter();
  const [contacts, properties] = await Promise.all([
    ctx.db.contact.findMany({ orderBy: { firstName: "asc" }, select: { id: true, firstName: true, lastName: true }, take: 500 }),
    ctx.db.property.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, address: true }, take: 200 }),
  ]);
  const now = new Date();
  const done = deal.checklist.filter((c) => c.completedAt).length;
  const nextDeadline = deal.checklist.filter((c) => !c.completedAt && c.dueAt).sort((a, b) => a.dueAt!.getTime() - b.dueAt!.getTime())[0];
  const commission = deal.value && deal.commissionPct ? Math.round((deal.value * deal.commissionPct) / 100) : null;

  return (
    <div className="space-y-10">
      <PageHeader
        title={deal.title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">{ts(deal.stage)}</Badge>
            <Badge>{tp(`sides.${deal.side}`)}</Badge>
            <Link href={`/contacts/${deal.contact.id}`} className="font-semibold text-brand-800 underline">{deal.contact.firstName} {deal.contact.lastName ?? ""}</Link>
            {deal.property ? <Link href={`/properties/${deal.property.id}`} className="font-semibold text-brand-800 underline">🏡 {deal.property.address}</Link> : null}
          </span>
        }
        back={{ href: "/pipeline", label: t("backToPipeline") }}
        actions={<LinkButton href={`/create/follow-up-coach?contactId=${deal.contactId}${deal.propertyId ? `&propertyId=${deal.propertyId}` : ""}`} variant="secondary">🧭 {t("coach")}</LinkButton>}
      />
      {flags.created ? <Alert tone="success">{t("created")}</Alert> : null}
      {flags.saved ? <Alert tone="success">{t("saved")}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><p className="text-base text-slate-700">{t("value")}</p><p className="text-2xl font-bold">{deal.value ? money(deal.value) : "—"}</p></Card>
        <Card><p className="text-base text-slate-700">{t("estCommission")}</p><p className="text-2xl font-bold">{commission ? money(commission) : "—"}</p></Card>
        <Card>
          <p className="text-base text-slate-700">{t("nextDeadline")}</p>
          <p className={`text-2xl font-bold ${nextDeadline && nextDeadline.dueAt! < now ? "text-red-700" : ""}`}>
            {nextDeadline ? format.dateTime(nextDeadline.dueAt!, { dateStyle: "medium" }) : "—"}
          </p>
          {nextDeadline ? <p className="text-base">{nextDeadline.title}</p> : null}
        </Card>
      </div>

      {ctx.can("TRANSACTIONS") ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">📑 {t("checklist")}</h2>
            {deal.checklist.length ? <p className="text-lg font-semibold">{t("checklistProgress", { done, total: deal.checklist.length })}</p> : null}
          </div>
          {deal.checklist.length === 0 ? (
            <Card className="flex flex-wrap items-center justify-between gap-4">
              <p className="max-w-xl text-lg">{t("checklistPitch")}</p>
              <form action={addChecklistAction}>
                <input type="hidden" name="dealId" value={id} />
                <SubmitButton pendingText={t("adding")}>{t("addChecklist")}</SubmitButton>
              </form>
            </Card>
          ) : (
            <>
              <div className="h-4 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-green-700" style={{ width: `${(done / deal.checklist.length) * 100}%` }} />
              </div>
              <ul className="space-y-2">
                {deal.checklist.map((item) => {
                  const overdue = !item.completedAt && item.dueAt && item.dueAt < now;
                  return (
                    <li key={item.id} className={`flex flex-wrap items-center gap-4 rounded-xl border-2 bg-white p-4 ${overdue ? "border-red-300" : "border-slate-200"}`}>
                      <form action={toggleChecklistItemAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <button
                          aria-pressed={Boolean(item.completedAt)}
                          aria-label={item.title}
                          className={`flex size-10 items-center justify-center rounded-lg border-2 text-xl ${item.completedAt ? "border-green-700 bg-green-700 text-white" : "border-slate-400 bg-white"}`}
                        >
                          {item.completedAt ? "✓" : ""}
                        </button>
                      </form>
                      <div className="min-w-0 flex-1">
                        <p className={`text-lg ${item.completedAt ? "text-slate-500 line-through" : "font-semibold"}`}>
                          {item.kind === "DOCUMENT" ? "📄 " : item.kind === "DEADLINE" ? "⏰ " : ""}{item.title}
                          {!item.required ? <span className="ml-2 text-base font-normal text-slate-600">({t("optionalItem")})</span> : null}
                        </p>
                        {overdue ? <p className="text-base font-semibold text-red-700">{t("overdue")}</p> : null}
                      </div>
                      <form action={setChecklistDueAction} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={item.id} />
                        <label className="sr-only" htmlFor={`due-${item.id}`}>{t("dueDate")}</label>
                        <Input id={`due-${item.id}`} name="dueAt" type="date" defaultValue={item.dueAt ? item.dueAt.toISOString().slice(0, 10) : ""} className="!min-h-11 w-44 !text-base" />
                        <button className="min-h-11 rounded-lg border-2 border-slate-300 px-3 text-base font-semibold hover:border-brand-600">{t("setDate")}</button>
                      </form>
                    </li>
                  );
                })}
              </ul>
              <form action={addChecklistItemAction} className="grid gap-4 rounded-2xl border-2 border-slate-200 bg-white p-5 md:grid-cols-[1fr_12rem_auto]">
                <input type="hidden" name="dealId" value={id} />
                <Field label={t("addItem")} htmlFor="itemTitle"><Input id="itemTitle" name="title" required /></Field>
                <Field label={t("dueDate")} htmlFor="itemDue" optional optionalLabel=""><Input id="itemDue" name="dueAt" type="date" /></Field>
                <div className="flex items-end"><SubmitButton pendingText={t("adding")} variant="secondary">{t("addItemButton")}</SubmitButton></div>
              </form>
              <p className="text-base text-slate-700">{t("checklistNote")}</p>
            </>
          )}
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">✅ {t("tasks")}</h2>
        <TaskList tasks={deal.tasks} back={`/deals/${id}`} dealId={id} contactId={deal.contactId} />
      </section>

      <ActivityLog activities={deal.activities} dealId={id} contactId={deal.contactId} />
      <NotesPanel notes={deal.notes} dealId={id} action={addNoteAction} />

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">✏️ {t("editTitle")}</h2>
        <DealForm
          action={updateDealAction}
          deal={deal}
          contacts={contacts.map((c) => ({ id: c.id, name: `${c.firstName} ${c.lastName ?? ""}`.trim() }))}
          properties={properties}
          canChecklist={ctx.can("TRANSACTIONS")}
        />
        <Card className="border-red-200">
          <form action={deleteDealAction} className="flex flex-wrap items-center justify-between gap-4">
            <input type="hidden" name="id" value={id} />
            <label className="flex items-center gap-3 text-lg">
              <input type="checkbox" required className="size-7 accent-red-700" />
              {t("deleteConfirm")}
            </label>
            <SubmitButton variant="danger" pendingText={t("deleting")}>{t("deleteButton")}</SubmitButton>
          </form>
        </Card>
      </section>
    </div>
  );
}
