"use client";

import { useTranslations } from "next-intl";
import { CopyBlock, OutputSection } from "@/components/output";
import type { ModuleViewProps } from "@/modules/view-types";

type Output = {
  subject_lines: string[];
  preview_text: string;
  greeting: string;
  body_paragraphs: string[];
  highlights: string[];
  call_to_action: string;
  sign_off: string;
  ps: string;
};

export default function EmailBlastView({ output }: ModuleViewProps<Output>) {
  const t = useTranslations("modules.email-blast.view");
  const [button, explanation] = output.call_to_action.split(" — ");
  const fullEmail = [
    output.greeting,
    ...output.body_paragraphs,
    output.highlights.map((h) => `• ${h}`).join("\n"),
    `${button}${explanation ? ` — ${explanation}` : ""}`,
    output.sign_off,
    `P.S. ${output.ps.replace(/^P\.?S\.?\s*/i, "")}`,
  ].join("\n\n");

  return (
    <div className="space-y-10">
      <OutputSection title={t("subjects")} icon="📨">
        {output.subject_lines.map((s, i) => (
          <CopyBlock key={i} title={t("subjectOption", { number: i + 1 })} text={s} limit={60} />
        ))}
        <CopyBlock title={t("preview")} text={output.preview_text} limit={110} />
      </OutputSection>
      <OutputSection title={t("email")} icon="✉️">
        <div className="rounded-xl border-2 border-slate-200 bg-white p-6 text-lg leading-relaxed text-slate-900">
          <p className="mb-4">{output.greeting}</p>
          {output.body_paragraphs.map((p, i) => (
            <p key={i} className="mb-4">{p}</p>
          ))}
          <ul className="mb-5 list-disc space-y-1 pl-7">
            {output.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
          <p className="mb-5">
            <span className="inline-block rounded-lg bg-brand-700 px-5 py-3 font-semibold text-white">{button}</span>
            {explanation ? <span className="ml-3 text-slate-700">{explanation}</span> : null}
          </p>
          <p className="mb-4 whitespace-pre-line">{output.sign_off}</p>
          <p className="italic">P.S. {output.ps.replace(/^P\.?S\.?\s*/i, "")}</p>
        </div>
        <CopyBlock title={t("copyAll")} text={fullEmail} />
        <p className="rounded-lg bg-amber-50 p-4 text-base text-amber-900">⚖️ {t("canSpam")}</p>
      </OutputSection>
    </div>
  );
}
