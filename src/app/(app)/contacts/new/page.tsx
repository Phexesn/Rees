import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createContactAction } from "@/app/(app)/contacts/actions";
import { ContactForm } from "@/app/(app)/contacts/ContactForm";
import { LockedFeature } from "@/components/LockedFeature";
import { PageHeader } from "@/components/ui";
import { requireSetupContext } from "@/lib/auth/context";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contacts");
  return { title: t("addContact") };
}

export default async function NewContactPage() {
  const ctx = await requireSetupContext();
  if (!ctx.can("CRM")) return <LockedFeature feature="CRM" />;
  const t = await getTranslations("contacts");
  return (
    <div>
      <PageHeader title={t("addContact")} back={{ href: "/contacts", label: t("backToContacts") }} />
      <ContactForm action={createContactAction} />
    </div>
  );
}
