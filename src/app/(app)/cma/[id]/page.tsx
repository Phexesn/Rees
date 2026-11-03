import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";
import { deleteCmaAction, rewriteNarrativeAction } from "@/app/(app)/cma/actions";
import { ModuleOutput, PrintButton } from "@/components/ModuleOutput";
import { Alert, Card, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { requireSetupContext } from "@/lib/auth/context";
import type { CmaResult, Subject } from "@/lib/cma";
import { money } from "@/modules/_shared/variables";

export const maxDuration = 120;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("cma");
  return { title: t("reportTitle") };
}

export default async function CmaReportPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ rewritten?: string }> }) {
  const ctx = await requireSetupContext();
  const { id } = await params;
  const { rewritten } = await searchParams;
  const cma = await ctx.db.cma.findUnique({ where: { id } });
  if (!cma) notFound();
  const t = await getTranslations("cma");
  const format = await getFormatter();
  const subject = cma.subject as unknown as Subject;
  const result = cma.result as unknown as CmaResult;
  const p = ctx.profile;

  return (
    <div className="space-y-8">
      <PageHeader title={cma.title} description={subject.address} back={{ href: "/cma", label: t("backToList") }} />
      {rewritten ? <Alert tone="success">{t("rewritten")}</Alert> : null}
      <div className="flex flex-wrap gap-3 print:hidden">
        <PrintButton label={t("print")} />
        <form action={rewriteNarrativeAction}>
          <input type="hidden" name="id" value={id} />
          <SubmitButton variant="secondary" pendingText={t("rewriting")}>🔄 {t("rewrite")}</SubmitButton>
        </form>
      </div>

      <Card className="space-y-2 print:border-0 print:shadow-none">
        <p className="text-base text-slate-700">{t("preparedBy", { name: p?.displayName ?? ctx.user.name, date: format.dateTime(cma.createdAt, { dateStyle: "long" }) })}</p>
        {p?.brokerage ? <p className="text-base text-slate-700">{p.brokerage}{p.licenseNumber ? ` · ${t("license", { number: p.licenseNumber })}` : ""}</p> : null}
        <p className="text-lg">{t("subjectLine", { beds: subject.beds, baths: subject.baths, sqft: subject.sqft })}</p>
      </Card>

      {result.suggestedListRange ? (
        <div className="rounded-2xl border-4 border-brand-600 bg-brand-50 p-8 text-center">
          <p className="text-lg font-semibold uppercase tracking-wide text-brand-900">{t("suggestedRange")}</p>
          <p className="mt-2 text-4xl font-bold md:text-5xl">{money(result.suggestedListRange.low)} – {money(result.suggestedListRange.high)}</p>
          {result.range ? <p className="mt-3 text-lg text-slate-800">{t("adjustedRange", { low: money(result.range.low), high: money(result.range.high), median: money(result.range.median) })}</p> : null}
          <p className="mt-2 text-base text-slate-700">{t("forDiscussion")}</p>
        </div>
      ) : (
        <Alert tone="warning">{t("noSold")}</Alert>
      )}
      {result.warnings.includes("fewer_than_three_sold") ? <Alert tone="warning">{t("warnings.fewer_than_three_sold")}</Alert> : null}
      {result.warnings.includes("weak_comps") ? <Alert tone="warning">{t("warnings.weak_comps")}</Alert> : null}

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">{t("compsTable")}</h2>
        <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white">
          <table className="w-full min-w-[56rem] text-left text-base">
            <thead className="bg-slate-100 text-base">
              <tr>
                <th className="p-3">{t("col.address")}</th>
                <th className="p-3">{t("col.status")}</th>
                <th className="p-3">{t("col.price")}</th>
                <th className="p-3">{t("col.size")}</th>
                <th className="p-3">{t("col.ppsf")}</th>
                <th className="p-3">{t("col.adjustments")}</th>
                <th className="p-3">{t("col.adjusted")}</th>
              </tr>
            </thead>
            <tbody>
              {result.comps.map((r, i) => (
                <tr key={i} className={`border-t-2 border-slate-100 align-top ${r.weak ? "bg-amber-50" : ""}`}>
                  <td className="p-3 font-semibold">{r.comp.address}{r.comp.distanceMiles !== undefined ? <span className="block font-normal text-slate-700">{t("milesAway", { miles: r.comp.distanceMiles })}</span> : null}</td>
                  <td className="p-3">{t(`status.${r.comp.status}`)}{r.comp.date ? <span className="block text-slate-700">{r.comp.date}</span> : null}</td>
                  <td className="p-3">{money(r.comp.price)}</td>
                  <td className="p-3">{r.comp.beds}/{r.comp.baths} · {r.comp.sqft.toLocaleString("en-US")}</td>
                  <td className="p-3">{money(r.pricePerSqft)}</td>
                  <td className="p-3">
                    {r.adjustments.length === 0 ? "—" : (
                      <ul>
                        {r.adjustments.map((a) => (
                          <li key={a.label}>{t(`adj.${a.label}`)}: {a.amount >= 0 ? "+" : "−"}{money(Math.abs(a.amount))}</li>
                        ))}
                      </ul>
                    )}
                    <span className="block text-slate-700">{t("gross", { pct: r.grossAdjustmentPct })}</span>
                  </td>
                  <td className="p-3 text-lg font-bold">{money(r.adjustedPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-base text-slate-700">{t("sqftRateUsed", { rate: money(result.usedSqftRate) })}</p>
      </section>

      {cma.narrative ? (
        <ModuleOutput moduleId="cma-narrative" output={cma.narrative} input={{}} language={cma.language} />
      ) : (
        <Alert tone="warning">{t("noNarrative")}</Alert>
      )}

      <section className="rounded-2xl border-2 border-slate-300 bg-slate-50 p-6">
        <h2 className="text-xl font-bold">⚖️ {t("disclaimerTitle")}</h2>
        <p className="mt-2 text-base leading-relaxed text-slate-800">{t("disclaimer")}</p>
      </section>

      <form action={deleteCmaAction} className="flex flex-wrap items-center gap-4 print:hidden">
        <input type="hidden" name="id" value={id} />
        <label className="flex items-center gap-3 text-lg">
          <input type="checkbox" required className="size-7 accent-red-700" />
          {t("deleteConfirm")}
        </label>
        <SubmitButton variant="danger" pendingText={t("deleting")}>{t("delete")}</SubmitButton>
      </form>
    </div>
  );
}
