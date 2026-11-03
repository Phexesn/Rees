import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createPropertyAction } from "@/app/(app)/properties/actions";
import { PropertyForm } from "@/app/(app)/properties/PropertyForm";
import { PageHeader } from "@/components/ui";
import { requireSetupContext } from "@/lib/auth/context";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("properties");
  return { title: t("newTitle") };
}

export default async function NewPropertyPage() {
  await requireSetupContext();
  const t = await getTranslations("properties");
  return (
    <div>
      <PageHeader title={t("newTitle")} description={t("newSubtitle")} back={{ href: "/properties", label: t("backToListings") }} />
      <PropertyForm action={createPropertyAction} />
    </div>
  );
}
