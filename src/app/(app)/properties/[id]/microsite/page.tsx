import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createMicrositeAction, writeMicrositeCopyAction } from "@/app/(app)/properties/[id]/microsite/actions";
import { MicrositeForm } from "@/app/(app)/properties/[id]/microsite/MicrositeForm";
import { CopyButton } from "@/components/output";
import { LockedFeature } from "@/components/LockedFeature";
import { Alert, Card, LinkButton, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { requireSetupContext } from "@/lib/auth/context";
import { env } from "@/lib/env";

export const maxDuration = 120;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("microsite");
  return { title: t("title") };
}

export default async function MicrositePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ written?: string; error?: string }>;
}) {
  const ctx = await requireSetupContext();
  if (!ctx.can("MICROSITES")) return <LockedFeature feature="MICROSITES" />;
  const { id } = await params;
  const flags = await searchParams;
  const property = await ctx.db.property.findUnique({ where: { id }, include: { microsite: true } });
  if (!property) notFound();
  const t = await getTranslations("microsite");
  const site = property.microsite;
  const url = site ? `${env.appUrl()}/l/${site.slug}` : "";

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} description={property.address} back={{ href: `/properties/${id}`, label: t("backToListing") }} />
      {!site ? (
        <Card className="space-y-4">
          <p className="text-xl">{t("intro")}</p>
          <ul className="list-disc space-y-1 pl-7 text-lg">
            <li>{t("point1")}</li>
            <li>{t("point2")}</li>
            <li>{t("point3")}</li>
          </ul>
          <form action={createMicrositeAction}>
            <input type="hidden" name="propertyId" value={id} />
            <SubmitButton pendingText={t("creating")} size="xl">{t("createButton")}</SubmitButton>
          </form>
        </Card>
      ) : (
        <>
          {flags.written ? <Alert tone="success">{t("written")}</Alert> : null}
          {flags.error ? <Alert tone="error">{t("writeFailed")}</Alert> : null}
          <Card className="space-y-4">
            <p className="text-lg font-semibold">{site.published ? t("liveAt") : t("notLiveYet")}</p>
            {site.published ? (
              <div className="flex flex-wrap items-center gap-3">
                <code className="break-all rounded-lg bg-slate-100 px-3 py-2 text-base">{url}</code>
                <CopyButton text={url} label={t("copyLink")} />
                <LinkButton href={`/l/${site.slug}`} target="_blank" variant="secondary" size="md">{t("open")} ↗</LinkButton>
                <LinkButton href={`/l/${site.slug}/open-house`} target="_blank" variant="secondary" size="md">{t("openHouseMode")} ↗</LinkButton>
              </div>
            ) : null}
            <form action={writeMicrositeCopyAction} className="border-t-2 border-slate-100 pt-4">
              <input type="hidden" name="propertyId" value={id} />
              <p className="mb-3 text-lg text-slate-700">{t("writeHint")}</p>
              <SubmitButton variant="secondary" pendingText={t("writing")}>✨ {t("writeButton")}</SubmitButton>
            </form>
          </Card>
          <MicrositeForm site={site} propertyId={id} />
        </>
      )}
    </div>
  );
}
