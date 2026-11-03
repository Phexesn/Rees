"use client";

import { useTranslations } from "next-intl";
import { BulletList, Checklist, CopyBlock, OutputSection, Tabs } from "@/components/output";
import type { ModuleViewProps } from "@/modules/view-types";

type Output = {
  variants: { angle: string; headline: string; short: string; long: string }[];
  feature_bullets: string[];
  agent_checklist: string[];
};

export default function MlsListingView({ output, input }: ModuleViewProps<Output, { longLimit?: string }>) {
  const t = useTranslations("modules.mls-listing.view");
  const longLimit = Number(input.longLimit ?? 1000);
  const shortLimit = Math.min(250, longLimit / 2);
  return (
    <div className="space-y-10">
      <OutputSection title={t("variants")} icon="✍️">
        <Tabs labels={output.variants.map((v, i) => `${i + 1}. ${v.angle}`)}>
          {(i) => {
            const v = output.variants[i];
            return (
              <div className="space-y-4">
                <CopyBlock title={t("headline")} text={v.headline} />
                <CopyBlock title={t("short")} text={v.short} limit={shortLimit} />
                <CopyBlock title={t("long")} text={v.long} limit={longLimit} />
              </div>
            );
          }}
        </Tabs>
      </OutputSection>
      <OutputSection title={t("bullets")} icon="✅">
        <div className="rounded-xl border-2 border-slate-200 bg-white p-5">
          <BulletList items={output.feature_bullets} />
        </div>
        <CopyBlock title={t("bulletsCopy")} text={output.feature_bullets.map((b) => `• ${b}`).join("\n")} />
      </OutputSection>
      {output.agent_checklist.length > 0 && (
        <OutputSection title={t("checklist")} icon="📝">
          <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-5">
            <Checklist items={output.agent_checklist} />
          </div>
        </OutputSection>
      )}
    </div>
  );
}
