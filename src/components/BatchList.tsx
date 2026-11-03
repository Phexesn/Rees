import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui";
import type { BatchSummary } from "@/lib/generation/history";
import { languageInfo } from "@/lib/languages";

export async function BatchList({ batches }: { batches: BatchSummary[] }) {
  const t = await getTranslations("generation");
  const tm = await getTranslations("modules");
  const format = await getFormatter();
  if (batches.length === 0) return <p className="text-lg text-slate-700">{t("noHistory")}</p>;
  return (
    <ul className="divide-y-2 divide-slate-100 rounded-2xl border-2 border-slate-200 bg-white">
      {batches.map((b) => (
        <li key={b.batchId}>
          <Link href={`/generations/${b.batchId}`} className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-slate-50">
            <span className="text-lg font-semibold">{tm(`${b.moduleId}.name`)}</span>
            <span className="flex flex-wrap items-center gap-2 text-base text-slate-700">
              {b.languages.map((l) => (
                <Badge key={l}>{languageInfo(l).native}</Badge>
              ))}
              {b.status === "NEEDS_REVIEW" ? <Badge tone="amber">{t("needsReview")}</Badge> : null}
              {b.status === "FAILED" ? <Badge tone="red">{t("failed")}</Badge> : null}
              <span>{format.relativeTime(b.createdAt)}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
