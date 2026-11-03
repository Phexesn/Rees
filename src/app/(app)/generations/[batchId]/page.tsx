import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";
import { emailToSelfAction, regenerateAction } from "@/app/(app)/generations/actions";
import { FairHousingPanel } from "@/components/FairHousingPanel";
import { ModuleOutput, PrintButton } from "@/components/ModuleOutput";
import { Alert, Badge, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { FairHousingReport } from "@/compliance/fair-housing";
import { requireSetupContext } from "@/lib/auth/context";
import { languageInfo } from "@/lib/languages";

export const maxDuration = 300;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("generation");
  return { title: t("title") };
}

export default async function GenerationPage({
  params,
  searchParams,
}: {
  params: Promise<{ batchId: string }>;
  searchParams: Promise<{ emailed?: string }>;
}) {
  const ctx = await requireSetupContext();
  const { batchId } = await params;
  const { emailed } = await searchParams;
  const rows = await ctx.db.generation.findMany({ where: { batchId }, orderBy: { createdAt: "asc" } });
  if (!rows.length) notFound();
  const t = await getTranslations("generation");
  const tm = await getTranslations("modules");
  const format = await getFormatter();
  const first = rows[0];
  const [property, contact] = await Promise.all([
    first.propertyId ? ctx.db.property.findUnique({ where: { id: first.propertyId } }) : null,
    first.contactId ? ctx.db.contact.findUnique({ where: { id: first.contactId } }) : null,
  ]);
  const extraInput = contact ? { contact: { phone: contact.phone, email: contact.email } } : {};

  return (
    <div className="space-y-8">
      <PageHeader
        title={tm(`${first.moduleId}.name`)}
        description={
          <>
            {property ? <>{property.address} · </> : null}
            {contact ? <>{contact.firstName} {contact.lastName ?? ""} · </> : null}
            {format.dateTime(first.createdAt, { dateStyle: "medium", timeStyle: "short" })}
          </>
        }
        back={property ? { href: `/properties/${property.id}`, label: property.address } : { href: "/create", label: t("backToCreate") }}
      />

      {emailed === "1" ? <Alert tone="success">{t("emailed")}</Alert> : null}
      {emailed === "0" ? <Alert tone="warning">{t("emailNotConfigured")}</Alert> : null}

      <div className="flex flex-wrap gap-3 print:hidden">
        <PrintButton label={t("print")} />
        <form action={emailToSelfAction}>
          <input type="hidden" name="batchId" value={batchId} />
          <SubmitButton variant="secondary" pendingText={t("sending")}>✉️ {t("emailMe")}</SubmitButton>
        </form>
        <form action={regenerateAction}>
          <input type="hidden" name="batchId" value={batchId} />
          <SubmitButton variant="secondary" pendingText={t("rewriting")}>🔄 {t("regenerate")}</SubmitButton>
        </form>
        <Link href={`/create/${first.moduleId}${property ? `?propertyId=${property.id}` : ""}`} className="inline-flex min-h-14 items-center px-4 text-lg font-semibold text-brand-800 underline">
          {t("changeOptions")}
        </Link>
      </div>

      {rows.length > 1 ? (
        <nav aria-label={t("languages")} className="flex flex-wrap gap-2 print:hidden">
          {rows.map((r) => (
            <a key={r.id} href={`#lang-${r.language}`} className="inline-flex min-h-12 items-center rounded-lg border-2 border-slate-300 bg-white px-4 text-lg font-semibold hover:border-brand-600">
              {languageInfo(r.language).native}
            </a>
          ))}
        </nav>
      ) : null}

      {rows.map((row) => (
        <section key={row.id} id={`lang-${row.language}`} className="scroll-mt-6 space-y-6 break-before-page">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold">🌐 {languageInfo(row.language).native}</h2>
            {row.status === "NEEDS_REVIEW" ? <Badge tone="amber">{t("needsReview")}</Badge> : null}
            {row.status === "FAILED" ? <Badge tone="red">{t("failed")}</Badge> : null}
          </div>
          {row.status === "FAILED" ? (
            <Alert tone="error" title={t("failedTitle")}>
              {row.errorMessage ?? t("failedBody")}
            </Alert>
          ) : (
            <>
              <div className="print:hidden">
                <FairHousingPanel report={row.compliance as unknown as FairHousingReport | null} />
              </div>
              <ModuleOutput
                moduleId={row.moduleId}
                output={row.output}
                input={{ ...((row.input ?? {}) as Record<string, unknown>), ...extraInput }}
                language={row.language}
              />
            </>
          )}
        </section>
      ))}
      <p className="text-base text-slate-700">{t("reviewNote")}</p>
    </div>
  );
}
