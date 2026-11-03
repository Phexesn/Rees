import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { deleteContactAction, updateContactAction } from "@/app/(app)/contacts/actions";
import { ContactForm } from "@/app/(app)/contacts/ContactForm";
import { LockedFeature } from "@/components/LockedFeature";
import { Card, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { requireSetupContext } from "@/lib/auth/context";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contacts");
  return { title: t("editTitle") };
}

export default async function EditContactPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireSetupContext();
  if (!ctx.can("CRM")) return <LockedFeature feature="CRM" />;
  const { id } = await params;
  const contact = await ctx.db.contact.findUnique({ where: { id } });
  if (!contact) notFound();
  const t = await getTranslations("contacts");
  return (
    <div className="space-y-10">
      <PageHeader title={t("editTitle")} description={`${contact.firstName} ${contact.lastName ?? ""}`} back={{ href: `/contacts/${id}`, label: t("backToContact") }} />
      <ContactForm action={updateContactAction} contact={contact} />
      <Card className="border-red-200">
        <h2 className="text-xl font-bold text-red-900">{t("deleteTitle")}</h2>
        <p className="mt-2 text-lg">{t("deleteWarning")}</p>
        <form action={deleteContactAction} className="mt-4 space-y-4">
          <input type="hidden" name="id" value={id} />
          <label className="flex items-center gap-3 text-lg">
            <input type="checkbox" required className="size-7 accent-red-700" />
            {t("deleteConfirm")}
          </label>
          <SubmitButton variant="danger" pendingText={t("deleting")}>{t("deleteButton")}</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
