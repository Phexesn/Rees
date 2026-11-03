import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CmaForm } from "@/app/(app)/cma/CmaForm";
import { LockedFeature } from "@/components/LockedFeature";
import { Alert, PageHeader } from "@/components/ui";
import { requireSetupContext } from "@/lib/auth/context";
import { languageInfo } from "@/lib/languages";

export const maxDuration = 120;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("cma");
  return { title: t("newTitle") };
}

export default async function NewCmaPage({ searchParams }: { searchParams: Promise<{ propertyId?: string }> }) {
  const ctx = await requireSetupContext();
  if (!ctx.can("CMA")) return <LockedFeature feature="CMA" />;
  const t = await getTranslations("cma");
  const { propertyId } = await searchParams;
  const property = propertyId ? await ctx.db.property.findUnique({ where: { id: propertyId } }) : null;
  const subject = property
    ? {
        address: `${property.address}, ${property.city}`,
        beds: property.beds?.toString() ?? "",
        baths: property.baths?.toString() ?? "",
        sqft: property.sqft?.toString() ?? "",
        yearBuilt: property.yearBuilt?.toString() ?? "",
      }
    : {};
  return (
    <div className="space-y-6">
      <PageHeader
        title={t("newTitle")}
        description={t("newSubtitle")}
        back={property ? { href: `/properties/${property.id}`, label: property.address } : { href: "/cma", label: t("backToList") }}
      />
      <Alert tone="info" title={t("notAppraisalTitle")}>{t("notAppraisalBody")}</Alert>
      <CmaForm
        initialSubject={subject}
        propertyId={property?.id}
        defaultTitle={property ? t("defaultTitle", { address: property.address }) : t("defaultTitleBlank")}
        languages={ctx.contentLanguages.map((code) => ({ code, native: languageInfo(code).native }))}
      />
    </div>
  );
}
