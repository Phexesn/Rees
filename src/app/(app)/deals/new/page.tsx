import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createDealAction } from "@/app/(app)/deals/actions";
import { DealForm } from "@/app/(app)/deals/DealForm";
import { LockedFeature } from "@/components/LockedFeature";
import { EmptyState, LinkButton, PageHeader } from "@/components/ui";
import { requireSetupContext } from "@/lib/auth/context";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("deals");
  return { title: t("newTitle") };
}

export default async function NewDealPage({ searchParams }: { searchParams: Promise<{ contactId?: string; propertyId?: string }> }) {
  const ctx = await requireSetupContext();
  if (!ctx.can("CRM")) return <LockedFeature feature="CRM" />;
  const t = await getTranslations("deals");
  const defaults = await searchParams;
  const [contacts, properties] = await Promise.all([
    ctx.db.contact.findMany({ orderBy: { firstName: "asc" }, select: { id: true, firstName: true, lastName: true }, take: 500 }),
    ctx.db.property.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, address: true }, take: 200 }),
  ]);
  if (contacts.length === 0) {
    return (
      <EmptyState icon="👥" title={t("needContactTitle")} description={t("needContactBody")} action={<LinkButton href="/contacts/new">＋ {t("addContact")}</LinkButton>} />
    );
  }
  return (
    <div>
      <PageHeader title={t("newTitle")} description={t("newSubtitle")} back={{ href: "/pipeline", label: t("backToPipeline") }} />
      <DealForm
        action={createDealAction}
        contacts={contacts.map((c) => ({ id: c.id, name: `${c.firstName} ${c.lastName ?? ""}`.trim() }))}
        properties={properties}
        defaults={defaults}
        canChecklist={ctx.can("TRANSACTIONS")}
      />
    </div>
  );
}
