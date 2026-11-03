import type { Prisma } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";
import { deleteViewAction, saveViewAction } from "@/app/(app)/contacts/actions";
import { LockedFeature } from "@/components/LockedFeature";
import { Alert, Badge, EmptyState, Input, LinkButton, PageHeader, Select, buttonClass } from "@/components/ui";
import { requireSetupContext } from "@/lib/auth/context";
import { CONTACT_ROLES, CONTACT_STATUSES, LEAD_SOURCES } from "@/lib/crm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contacts");
  return { title: t("title") };
}

type Filters = { q?: string; status?: string; role?: string; tag?: string; source?: string };

export default async function ContactsPage({ searchParams }: { searchParams: Promise<Filters & { deleted?: string }> }) {
  const ctx = await requireSetupContext();
  if (!ctx.can("CRM")) return <LockedFeature feature="CRM" />;
  const t = await getTranslations("contacts");
  const tc = await getTranslations("common");
  const format = await getFormatter();
  const params = await searchParams;
  const f: Filters = { q: params.q?.trim(), status: params.status, role: params.role, tag: params.tag?.trim().toLowerCase(), source: params.source };

  const where: Prisma.ContactWhereInput = {
    ...(f.q
      ? {
          OR: [
            { firstName: { contains: f.q, mode: "insensitive" } },
            { lastName: { contains: f.q, mode: "insensitive" } },
            { email: { contains: f.q, mode: "insensitive" } },
            { phone: { contains: f.q } },
          ],
        }
      : {}),
    ...(f.status && (CONTACT_STATUSES as readonly string[]).includes(f.status) ? { status: f.status as (typeof CONTACT_STATUSES)[number] } : {}),
    ...(f.role ? { roles: { has: f.role } } : {}),
    ...(f.tag ? { tags: { has: f.tag } } : {}),
    ...(f.source && (LEAD_SOURCES as readonly string[]).includes(f.source) ? { source: f.source as (typeof LEAD_SOURCES)[number] } : {}),
  };
  const [contacts, views, total] = await Promise.all([
    ctx.db.contact.findMany({ where, orderBy: { createdAt: "desc" }, take: 200 }),
    ctx.db.savedView.findMany({ where: { userId: ctx.user.id }, orderBy: { createdAt: "asc" } }),
    ctx.db.contact.count(),
  ]);
  const filtered = Object.values(f).some(Boolean);
  const qs = (v: Filters) =>
    new URLSearchParams(Object.entries(v).filter(([, val]) => typeof val === "string" && val) as [string, string][]).toString();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("subtitle", { count: total })}
        actions={<LinkButton href="/contacts/new">＋ {t("addContact")}</LinkButton>}
      />
      {params.deleted ? <Alert tone="success">{t("deleted")}</Alert> : null}

      {views.length > 0 && (
        <nav aria-label={t("savedViews")} className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-semibold">{t("savedViews")}:</span>
          {views.map((v) => (
            <span key={v.id} className="inline-flex items-center gap-1 rounded-full border-2 border-slate-300 bg-white pl-4">
              <Link href={`/contacts?${qs(v.filters as Filters)}`} className="py-2 text-base font-semibold">{v.name}</Link>
              <form action={deleteViewAction}>
                <input type="hidden" name="id" value={v.id} />
                <button aria-label={t("deleteView", { name: v.name })} className="min-h-10 rounded-full px-3 text-lg hover:bg-slate-100">×</button>
              </form>
            </span>
          ))}
        </nav>
      )}

      <form method="get" className="grid gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4 md:grid-cols-[1fr_1fr_1fr_auto]">
        <label className="sr-only" htmlFor="q">{tc("search")}</label>
        <Input id="q" name="q" placeholder={t("searchPlaceholder")} defaultValue={f.q ?? ""} className="md:col-span-4" />
        <Select name="status" defaultValue={f.status ?? ""} aria-label={t("status")}>
          <option value="">{t("anyStatus")}</option>
          {CONTACT_STATUSES.map((s) => <option key={s} value={s}>{t(`statuses.${s}`)}</option>)}
        </Select>
        <Select name="role" defaultValue={f.role ?? ""} aria-label={t("role")}>
          <option value="">{t("anyRole")}</option>
          {CONTACT_ROLES.map((r) => <option key={r} value={r}>{t(`roles.${r}`)}</option>)}
        </Select>
        <Select name="source" defaultValue={f.source ?? ""} aria-label={t("source")}>
          <option value="">{t("anySource")}</option>
          {LEAD_SOURCES.map((s) => <option key={s} value={s}>{t(`sources.${s}`)}</option>)}
        </Select>
        <button className={buttonClass("primary", "lg")}>{tc("search")}</button>
        {f.tag ? <input type="hidden" name="tag" value={f.tag} /> : null}
      </form>

      {filtered && (
        <div className="flex flex-wrap items-center gap-3">
          {f.tag ? <Badge tone="brand">#{f.tag}</Badge> : null}
          <Link href="/contacts" className="text-lg font-semibold text-brand-800 underline">{t("clearFilters")}</Link>
          <form action={saveViewAction} className="flex flex-wrap items-center gap-2">
            {Object.entries(f).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
            <label className="sr-only" htmlFor="viewName">{t("viewName")}</label>
            <Input id="viewName" name="name" placeholder={t("viewName")} className="!min-h-12 max-w-56 !text-lg" required />
            <button className={buttonClass("secondary", "md")}>{t("saveView")}</button>
          </form>
        </div>
      )}

      {contacts.length === 0 ? (
        <EmptyState
          icon="👥"
          title={filtered ? t("noMatches") : t("emptyTitle")}
          description={filtered ? undefined : t("emptyBody")}
          action={!filtered ? <LinkButton href="/contacts/new" size="xl">＋ {t("addContact")}</LinkButton> : undefined}
        />
      ) : (
        <ul className="divide-y-2 divide-slate-100 rounded-2xl border-2 border-slate-200 bg-white">
          {contacts.map((c) => (
            <li key={c.id}>
              <Link href={`/contacts/${c.id}`} className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-slate-50">
                <span className="min-w-0">
                  <span className="block text-xl font-bold">{c.firstName} {c.lastName ?? ""}</span>
                  <span className="block truncate text-base text-slate-700">{[c.email, c.phone].filter(Boolean).join(" · ")}</span>
                </span>
                <span className="flex flex-wrap items-center gap-2">
                  <Badge tone={c.status === "NEW" ? "brand" : c.status === "ACTIVE" ? "green" : c.status === "DO_NOT_CONTACT" ? "red" : "slate"}>{t(`statuses.${c.status}`)}</Badge>
                  {c.roles.slice(0, 2).map((r) => <Badge key={r}>{t(`roles.${r}`)}</Badge>)}
                  {c.tags.slice(0, 3).map((tag) => <Badge key={tag} tone="amber">#{tag}</Badge>)}
                  <span className="text-base text-slate-700">{format.relativeTime(c.createdAt)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
