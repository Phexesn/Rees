"use client";

import { useTranslations } from "next-intl";
import { BulletList, CopyBlock, OutputSection } from "@/components/output";
import type { ModuleViewProps } from "@/modules/view-types";

type Output = {
  situation_summary: string;
  call_script: {
    opening: string;
    discovery_questions: string[];
    key_points: string[];
    ask_for_appointment: string;
    voicemail: string;
  };
  objections: { they_say: string; you_say: string }[];
  text_message: string;
  email: { subject: string; body: string };
  follow_up_plan: { day: number; channel: "call" | "text" | "email"; action: string; message: string }[];
  coaching_tips: string[];
  avoid: string[];
};

type ContactLinks = { phone?: string | null; email?: string | null };

const card = "rounded-xl border-2 border-slate-200 bg-white p-5";
const CHANNEL_ICON = { call: "📞", text: "💬", email: "✉️" } as const;

export default function FollowUpCoachView({ output, input }: ModuleViewProps<Output, { contact?: ContactLinks }>) {
  const t = useTranslations("modules.follow-up-coach.view");
  const phone = input.contact?.phone?.replace(/[^\d+]/g, "");
  const email = input.contact?.email;
  return (
    <div className="space-y-10">
      <p className="rounded-xl border-2 border-brand-200 bg-brand-50 p-5 text-xl text-slate-900">{output.situation_summary}</p>

      <OutputSection title={t("callScript")} icon="📞">
        {phone ? (
          <a
            href={`tel:${phone}`}
            className="inline-flex min-h-14 items-center gap-2 rounded-lg bg-green-700 px-6 text-lg font-bold text-white hover:bg-green-800 print:hidden"
          >
            📞 {t("callNow")}
          </a>
        ) : null}
        <div className={card}>
          <p className="text-base font-bold uppercase tracking-wide text-slate-700">{t("opening")}</p>
          <p className="mt-2 text-xl leading-relaxed">“{output.call_script.opening}”</p>
        </div>
        <div className={card}>
          <p className="mb-3 text-base font-bold uppercase tracking-wide text-slate-700">{t("questions")}</p>
          <BulletList items={output.call_script.discovery_questions} numbered />
        </div>
        <div className={card}>
          <p className="mb-3 text-base font-bold uppercase tracking-wide text-slate-700">{t("keyPoints")}</p>
          <BulletList items={output.call_script.key_points} />
        </div>
        <div className={card}>
          <p className="text-base font-bold uppercase tracking-wide text-slate-700">{t("askForAppointment")}</p>
          <p className="mt-2 text-xl leading-relaxed">“{output.call_script.ask_for_appointment}”</p>
        </div>
        <CopyBlock title={t("voicemail")} text={output.call_script.voicemail} />
      </OutputSection>

      <OutputSection title={t("objections")} icon="🤔">
        <div className="space-y-3">
          {output.objections.map((o, i) => (
            <details key={i} className={`${card} group`} open={i === 0}>
              <summary className="cursor-pointer list-none text-lg font-bold">
                <span className="mr-2 inline-block transition group-open:rotate-90" aria-hidden>▶</span>
                {t("theySay")}: “{o.they_say}”
              </summary>
              <p className="mt-3 border-l-4 border-green-600 pl-4 text-lg leading-relaxed">
                <span className="font-bold">{t("youSay")}:</span> “{o.you_say}”
              </p>
            </details>
          ))}
        </div>
      </OutputSection>

      <OutputSection title={t("text")} icon="💬">
        <CopyBlock text={output.text_message} limit={300} />
        {phone ? (
          <a
            href={`sms:${phone}?&body=${encodeURIComponent(output.text_message)}`}
            className="inline-flex min-h-14 items-center gap-2 rounded-lg bg-brand-700 px-6 text-lg font-bold text-white hover:bg-brand-800 print:hidden"
          >
            💬 {t("openTextApp")}
          </a>
        ) : null}
        <p className="text-base text-slate-700">{t("textConsent")}</p>
      </OutputSection>

      <OutputSection title={t("email")} icon="✉️">
        <CopyBlock title={t("subject")} text={output.email.subject} limit={60} />
        <CopyBlock title={t("body")} text={output.email.body} />
        {email ? (
          <a
            href={`mailto:${email}?subject=${encodeURIComponent(output.email.subject)}&body=${encodeURIComponent(output.email.body)}`}
            className="inline-flex min-h-14 items-center gap-2 rounded-lg bg-brand-700 px-6 text-lg font-bold text-white hover:bg-brand-800 print:hidden"
          >
            ✉️ {t("openEmailApp")}
          </a>
        ) : null}
      </OutputSection>

      <OutputSection title={t("plan")} icon="📅">
        <ol className="space-y-3">
          {output.follow_up_plan.map((step, i) => (
            <li key={i} className={`${card} flex gap-4`}>
              <div className="flex w-20 shrink-0 flex-col items-center justify-center rounded-lg bg-slate-100 p-2 text-center">
                <span className="text-2xl" aria-hidden>{CHANNEL_ICON[step.channel] ?? "•"}</span>
                <span className="text-base font-bold">{t("day", { day: step.day })}</span>
              </div>
              <div className="text-lg">
                <p className="font-semibold">{step.action}</p>
                <p className="mt-1 text-slate-800">“{step.message}”</p>
              </div>
            </li>
          ))}
        </ol>
      </OutputSection>

      <div className="grid gap-6 md:grid-cols-2">
        <OutputSection title={t("tips")} icon="🌟">
          <div className={card}>
            <BulletList items={output.coaching_tips} />
          </div>
        </OutputSection>
        <OutputSection title={t("avoid")} icon="🚫">
          <div className="rounded-xl border-2 border-red-200 bg-red-50 p-5">
            <BulletList items={output.avoid} />
          </div>
        </OutputSection>
      </div>
    </div>
  );
}
