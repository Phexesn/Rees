import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";
import { addNoteAction } from "@/app/(app)/contacts/actions";
import { BatchList } from "@/components/BatchList";
import { ActivityLog, NotesPanel } from "@/components/crm/ActivityLog";
import { TaskList } from "@/components/crm/TaskList";
import { LockedFeature } from "@/components/LockedFeature";
import { Alert, Badge, Card, LinkButton, PageHeader } from "@/components/ui";
import { requireSetupContext } from "@/lib/auth/context";
import { env } from "@/lib/env";
import { summarizeBatches } from "@/lib/generation/history";
import { languageInfo } from "@/lib/languages";
import { hasBuyerPreferences, listingsForBuyerWhere } from "@/lib/matching";
import { money } from "@/modules/_shared/variables";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const ctx = await requireSetupContext();
  const { id } = await params;
  const c = await ctx.db.contact.findUnique({ where: { id }, select: { firstName: true, lastName: true } });
  return { title: c ? `${c.firstName} ${c.lastName ?? ""}`.trim() : "Contact" };
}

export default async function ContactPage({
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
  const contact = await ctx.db.contact.findUnique({
    where: { id },
    include: {
      deals: { include: { property: { select: { address: true } } }, orderBy: { updatedAt: "desc" } },
      tasks: { orderBy: [{ completedAt: "asc" }, { dueAt: "asc" }], take: 20 },
      notes: { orderBy: { createdAt: "desc" }, take: 30 },
      activities: { orderBy: { occurredAt: "desc" }, take: 30 },
      generations: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, batchId: true, moduleId: true, language: true, createdAt: true, status: true },
      },
    },
  });
  if (!contact) notFound();
  const matches = hasBuyerPreferences(contact)
    ? await ctx.db.property.findMany({ where: listingsForBuyerWhere(contact), include: { microsite: { select: { slug: true, published: true } } }, take: 6 })
    : [];
  const t = await getTranslations("contacts");
  const tf = await getTranslations("contacts.form");
  const format = await getFormatter();
  const phone = contact.phone?.replace(/[^\d+]/g, "");
  const latestDealProperty = contact.deals.find((d) => d.propertyId)?.propertyId;
  const coachHref = `/create/follow-up-coach?contactId=${contact.id}${latestDealProperty ? `&propertyId=${latestDealProperty}` : ""}`;
  const doNotContact = contact.status === "DO_NOT_CONTACT";

  const prefs = [
    contact.priceMin || contact.priceMax ? `${money(contact.priceMin) || "?"} – ${money(contact.priceMax) || "?"}` : null,
    contact.bedsMin ? `${contact.bedsMin}+ ${tf("bedsShort")}` : null,
    contact.bathsMin ? `${contact.bathsMin}+ ${tf("bathsShort")}` : null,
    contact.areas,
    contact.timeline,
  ].filter(Boolean);

  return (
    <div className="space-y-10">
      <PageHeader
        title={`${contact.firstName} ${contact.lastName ?? ""}`}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={contact.status === "NEW" ? "brand" : contact.status === "ACTIVE" ? "green" : doNotContact ? "red" : "slate"}>{t(`statuses.${contact.status}`)}</Badge>
            {contact.roles.map((r) => <Badge key={r}>{t(`roles.${r}`)}</Badge>)}
            {contact.tags.map((tag) => (
              <Link key={tag} href={`/contacts?tag=${encodeURIComponent(tag)}`}><Badge tone="amber">#{tag}</Badge></Link>
            ))}
          </span>
        }
        back={{ href: "/contacts", label: t("backToContacts") }}
        actions={<LinkButton href={`/contacts/${id}/edit`} variant="secondary">✏️ {t("edit")}</LinkButton>}
      />
      {flags.created ? <Alert tone="success">{t("created")}</Alert> : null}
      {flags.saved ? <Alert tone="success">{t("saved")}</Alert> : null}
      {doNotContact ? <Alert tone="error" title={t("doNotContactTitle")}>{t("doNotContactBody")}</Alert> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Card className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {phone && !doNotContact ? (
              <>
                <a href={`tel:${phone}`} className="inline-flex min-h-14 items-center gap-2 rounded-xl bg-green-700 px-5 text-lg font-bold text-white hover:bg-green-800">📞 {t("call")}</a>
                <a href={`sms:${phone}`} className="inline-flex min-h-14 items-center gap-2 rounded-xl border-2 border-green-700 bg-white px-5 text-lg font-bold text-green-900 hover:bg-green-50">💬 {t("text")}</a>
              </>
            ) : null}
            {contact.email && !doNotContact ? (
              <a href={`mailto:${contact.email}`} className="inline-flex min-h-14 items-center gap-2 rounded-xl border-2 border-brand-700 bg-white px-5 text-lg font-bold text-brand-800 hover:bg-brand-50">✉️ {t("email")}</a>
            ) : null}
            {!doNotContact ? <LinkButton href={coachHref}>🧭 {t("coachButton")}</LinkButton> : null}
          </div>
          <dl className="grid gap-x-6 gap-y-2 text-lg sm:grid-cols-[10rem_1fr]">
            {contact.phone ? <><dt className="font-semibold text-slate-700">{tf("phone")}</dt><dd>{contact.phone}</dd></> : null}
            {contact.email ? <><dt className="font-semibold text-slate-700">{tf("email")}</dt><dd className="break-all">{contact.email}</dd></> : null}
            <dt className="font-semibold text-slate-700">{t("source")}</dt>
            <dd>{t(`sources.${contact.source}`)}{contact.sourceDetail ? ` — ${contact.sourceDetail}` : ""}</dd>
            {contact.preferredLanguage ? <><dt className="font-semibold text-slate-700">{tf("language")}</dt><dd>{languageInfo(contact.preferredLanguage).native}</dd></> : null}
            {prefs.length ? <><dt className="font-semibold text-slate-700">{tf("lookingFor")}</dt><dd>{prefs.join(" · ")}</dd></> : null}
            {contact.mustHaves ? <><dt className="font-semibold text-slate-700">{tf("mustHaves")}</dt><dd>{contact.mustHaves}</dd></> : null}
            {contact.preApproved ? <><dt className="font-semibold text-slate-700">{tf("preApproved")}</dt><dd>✅ {contact.lender ?? ""}</dd></> : null}
            <dt className="font-semibold text-slate-700">{t("added")}</dt>
            <dd>{format.dateTime(contact.createdAt, { dateStyle: "medium" })}</dd>
            {contact.lastContactedAt ? <><dt className="font-semibold text-slate-700">{t("lastContacted")}</dt><dd>{format.relativeTime(contact.lastContactedAt)}</dd></> : null}
          </dl>
        </Card>
        <Card className="space-y-2 text-base">
          <p className="text-lg font-bold">⚖️ {t("consentTitle")}</p>
          <p>{contact.emailOptIn ? "✅" : "⬜"} {t("consentEmail")}</p>
          <p>{contact.smsConsent ? "✅" : "⬜"} {t("consentSms")}</p>
          {contact.consentAt ? (
            <p className="text-slate-700">{t("consentGiven", { date: format.dateTime(contact.consentAt, { dateStyle: "medium" }), source: contact.consentSource ?? "" })}</p>
          ) : (
            <p className="text-slate-700">{t("consentNone")}</p>
          )}
        </Card>
      </div>

      {matches.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">🏡 {t("matchingListings")}</h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {matches.map((m) => {
              const link = m.microsite?.published ? `${env.appUrl()}/l/${m.microsite.slug}` : null;
              return (
                <li key={m.id} className="rounded-xl border-2 border-green-200 bg-white p-4">
                  <Link href={`/properties/${m.id}`} className="text-lg font-bold hover:underline">{m.address}, {m.city}</Link>
                  <p className="text-base text-slate-700">{[money(m.price), m.beds ? `${m.beds} ${tf("bedsShort")}` : null, m.baths ? `${m.baths} ${tf("bathsShort")}` : null].filter(Boolean).join(" · ")}</p>
                  {link && contact.email && !doNotContact ? (
                    <a
                      href={`mailto:${contact.email}?subject=${encodeURIComponent(m.address)}&body=${encodeURIComponent(`${t("shareListingBody", { name: contact.firstName })}\n\n${link}`)}`}
                      className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg border-2 border-brand-700 px-3 text-base font-semibold text-brand-800 hover:bg-brand-50"
                    >
                      ✉️ {t("shareListing")}
                    </a>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">📋 {t("deals")}</h2>
          <LinkButton href={`/deals/new?contactId=${id}`} variant="secondary" size="md">＋ {t("addDeal")}</LinkButton>
        </div>
        {contact.deals.length === 0 ? (
          <p className="text-lg text-slate-700">{t("noDeals")}</p>
        ) : (
          <ul className="space-y-2">
            {contact.deals.map((d) => (
              <li key={d.id}>
                <Link href={`/deals/${d.id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-slate-200 bg-white p-4 hover:border-brand-600">
                  <span className="text-lg font-semibold">{d.title}</span>
                  <span className="flex items-center gap-2 text-base text-slate-700">
                    <Badge tone="brand">{t(`stages.${d.stage}`)}</Badge>
                    {d.property?.address}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">✅ {t("tasks")}</h2>
        <TaskList tasks={contact.tasks} back={`/contacts/${id}`} contactId={id} />
      </section>

      <ActivityLog activities={contact.activities} contactId={id} />
      <NotesPanel notes={contact.notes} contactId={id} action={addNoteAction} />

      {contact.generations.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">🧭 {t("coachHistory")}</h2>
          <BatchList batches={summarizeBatches(contact.generations)} />
        </section>
      )}
    </div>
  );
}
