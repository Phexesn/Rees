"use client";

import { useTranslations } from "next-intl";
import { BulletList, OutputSection } from "@/components/output";
import type { ModuleViewProps } from "@/modules/view-types";

export type CmaNarrative = {
  summary: string;
  comp_commentary: { address: string; commentary: string }[];
  adjustments_explained: string;
  pricing_discussion: string;
  data_gaps: string[];
  seller_talking_points: string[];
};

const card = "rounded-xl border-2 border-slate-200 bg-white p-5 text-lg leading-relaxed";

export default function CmaNarrativeView({ output }: ModuleViewProps<CmaNarrative>) {
  const t = useTranslations("cma.narrative");
  return (
    <div className="space-y-8">
      <OutputSection title={t("summary")}>
        <p className={card}>{output.summary}</p>
      </OutputSection>
      <OutputSection title={t("comps")}>
        <div className="space-y-3">
          {output.comp_commentary.map((c, i) => (
            <div key={i} className={card}>
              <p className="font-bold">{c.address}</p>
              <p className="mt-1">{c.commentary}</p>
            </div>
          ))}
        </div>
      </OutputSection>
      <OutputSection title={t("adjustments")}>
        <p className={card}>{output.adjustments_explained}</p>
      </OutputSection>
      <OutputSection title={t("pricing")}>
        <p className={card}>{output.pricing_discussion}</p>
      </OutputSection>
      <OutputSection title={t("talkingPoints")}>
        <div className={card}>
          <BulletList items={output.seller_talking_points} />
        </div>
      </OutputSection>
      {output.data_gaps.length > 0 && (
        <OutputSection title={t("gaps")}>
          <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-5">
            <BulletList items={output.data_gaps} />
          </div>
        </OutputSection>
      )}
    </div>
  );
}
