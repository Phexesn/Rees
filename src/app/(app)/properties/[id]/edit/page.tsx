import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { deletePropertyAction, updatePropertyAction } from "@/app/(app)/properties/actions";
import { PropertyForm } from "@/app/(app)/properties/PropertyForm";
import { Card, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { requireSetupContext } from "@/lib/auth/context";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("properties");
  return { title: t("editTitle") };
}

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireSetupContext();
  const { id } = await params;
  const property = await ctx.db.property.findUnique({ where: { id } });
  if (!property) notFound();
  const t = await getTranslations("properties");
  return (
    <div className="space-y-10">
      <PageHeader title={t("editTitle")} description={property.address} back={{ href: `/properties/${id}`, label: t("backToListing") }} />
      <PropertyForm action={updatePropertyAction} property={property} />
      <Card className="border-red-200">
        <h2 className="text-xl font-bold text-red-900">{t("deleteTitle")}</h2>
        <p className="mt-2 text-lg text-slate-800">{t("deleteWarning")}</p>
        <form action={deletePropertyAction} className="mt-4 space-y-4">
          <input type="hidden" name="id" value={property.id} />
          <label className="flex items-center gap-3 text-lg">
            <input type="checkbox" name="confirm" required className="size-7 accent-red-700" />
            {t("deleteConfirm")}
          </label>
          <SubmitButton variant="danger" pendingText={t("deleting")}>
            {t("deleteButton")}
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}
