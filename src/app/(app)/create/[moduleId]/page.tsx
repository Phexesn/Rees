import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { GenerateForm } from "@/app/(app)/create/GenerateForm";
import { LockedFeature } from "@/components/LockedFeature";
import { Card, EmptyState, LinkButton, PageHeader } from "@/components/ui";
import { requireSetupContext } from "@/lib/auth/context";
import { contentLanguageLimit } from "@/lib/features";
import { CONTENT_LANGUAGES } from "@/lib/languages";
import { getModule } from "@/modules";
import { toMeta } from "@/modules/types";

// Long outputs (photo guides in several languages) can take a while.
export const maxDuration = 300;

export async function generateMetadata({ params }: { params: Promise<{ moduleId: string }> }): Promise<Metadata> {
  const { moduleId } = await params;
  const tm = await getTranslations("modules");
  return { title: getModule(moduleId) ? tm(`${moduleId}.name`) : "Create" };
}

export default async function CreateModulePage({
  params,
  searchParams,
}: {
  params: Promise<{ moduleId: string }>;
  searchParams: Promise<{ propertyId?: string; contactId?: string; pick?: string }>;
}) {
  const ctx = await requireSetupContext();
  const { moduleId } = await params;
  const { propertyId, contactId, pick } = await searchParams;
  const mod = getModule(moduleId);
  if (!mod || mod.hidden) notFound();
  if (!ctx.can(mod.feature)) return <LockedFeature feature={mod.feature} />;

  const t = await getTranslations("create");
  const tm = await getTranslations("modules");
  const property = propertyId ? await ctx.db.property.findUnique({ where: { id: propertyId } }) : null;

  // Step 1: choose a listing (required for most modules).
  if (!property && (mod.requires === "property" || pick)) {
    const properties = await ctx.db.property.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
    return (
      <div className="space-y-6">
        <PageHeader title={tm(`${mod.id}.name`)} description={t("chooseListing")} back={{ href: "/create", label: t("backToCreate") }} />
        {properties.length === 0 ? (
          <EmptyState icon="🏡" title={t("noListingsTitle")} description={t("noListingsBody")} action={<LinkButton href="/properties/new">＋ {t("addListing")}</LinkButton>} />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {properties.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/create/${mod.id}?propertyId=${p.id}${contactId ? `&contactId=${contactId}` : ""}`}
                  className="flex min-h-20 flex-col justify-center rounded-2xl border-2 border-slate-200 bg-white p-5 hover:border-brand-600"
                >
                  <span className="text-xl font-bold">{p.address}</span>
                  <span className="text-lg text-slate-700">{p.city}, {p.state}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  const contacts =
    mod.usesContact && ctx.can("CRM")
      ? (await ctx.db.contact.findMany({ orderBy: { updatedAt: "desc" }, take: 200, select: { id: true, firstName: true, lastName: true } })).map(
          (c) => ({ id: c.id, name: `${c.firstName} ${c.lastName ?? ""}`.trim() }),
        )
      : undefined;

  const limit = contentLanguageLimit(ctx.tenant);
  const languages = CONTENT_LANGUAGES.map((l) => ({ code: l.code, native: l.native, allowed: ctx.contentLanguages.includes(l.code) }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${mod.icon} ${tm(`${mod.id}.name`)}`}
        description={tm(`${mod.id}.description`)}
        back={property ? { href: `/properties/${property.id}`, label: property.address } : { href: "/create", label: t("backToCreate") }}
      />
      {property ? (
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-lg">
            <span className="font-semibold">{t("forListing")}:</span> {property.address}, {property.city}
          </p>
          <Link href={`/create/${mod.id}`} className="text-lg font-semibold text-brand-800 underline">
            {t("changeListing")}
          </Link>
        </Card>
      ) : mod.requires === "property-optional" ? (
        <p className="text-lg text-slate-700">
          {t("optionalListing")}{" "}
          <Link href={`/create/${mod.id}?pick=1${contactId ? `&contactId=${contactId}` : ""}`} className="font-semibold text-brand-800 underline">
            {t("pickListing")}
          </Link>
        </p>
      ) : null}
      <GenerateForm
        meta={toMeta(mod)}
        propertyId={property?.id}
        contacts={contacts}
        contactId={contactId}
        languages={languages}
        primaryLanguage={ctx.contentLanguages[0] ?? "en"}
        languageLimit={limit}
      />
    </div>
  );
}
