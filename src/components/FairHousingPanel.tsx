import { getTranslations } from "next-intl/server";
import type { FairHousingReport } from "@/compliance/fair-housing";

/** Explains, in plain words, what the Fair Housing filter did to this output. */
export async function FairHousingPanel({ report }: { report: FairHousingReport | null }) {
  const t = await getTranslations("fairHousing");
  if (!report) return null;
  if (report.issues.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-xl border-2 border-green-300 bg-green-50 p-4 text-lg text-green-950">
        <span aria-hidden className="text-2xl">🛡️</span>
        <p>{t("clean")}</p>
      </div>
    );
  }
  const rewritten = report.issues.filter((i) => i.action === "rewritten");
  const removed = report.issues.filter((i) => i.action === "removed");
  const flagged = report.issues.filter((i) => i.action === "flagged");
  return (
    <div className="space-y-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-5 text-lg text-slate-900">
      <p className="flex items-center gap-2 text-xl font-bold">
        <span aria-hidden>🛡️</span> {t("title")}
      </p>
      {removed.length > 0 && (
        <div>
          <p className="font-bold text-red-800">{t("removedTitle", { count: removed.length })}</p>
          <ul className="mt-2 space-y-2">
            {removed.map((i, n) => (
              <li key={n} className="rounded-lg bg-white p-3">
                <p>{t("removedItem", { phrase: i.match, reason: t(`classes.${i.class}`) })}</p>
                <p className="text-base text-slate-700">💡 {i.suggestion}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      {flagged.length > 0 && (
        <div>
          <p className="font-bold text-amber-900">{t("flaggedTitle", { count: flagged.length })}</p>
          <ul className="mt-2 space-y-2">
            {flagged.map((i, n) => (
              <li key={n} className="rounded-lg bg-white p-3">
                <p>{t("flaggedItem", { phrase: i.match, reason: t(`classes.${i.class}`) })}</p>
                <p className="text-base text-slate-700">💡 {i.suggestion}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      {rewritten.length > 0 && (
        <div>
          <p className="font-bold text-green-900">{t("rewrittenTitle", { count: rewritten.length })}</p>
          <ul className="mt-2 list-disc space-y-1 pl-7">
            {rewritten.map((i, n) => (
              <li key={n}>{t("rewrittenItem", { from: i.match, to: i.replacement ?? "" })}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-base text-slate-700">{t("disclaimer")}</p>
    </div>
  );
}
