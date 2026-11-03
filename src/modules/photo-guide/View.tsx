"use client";

import { useTranslations } from "next-intl";
import { BulletList, Checklist, OutputSection } from "@/components/output";
import type { ModuleViewProps } from "@/modules/view-types";

type Output = {
  summary: string;
  shoot_plan: { best_time: string; total_time: string; room_order: string[] };
  before_you_start: string[];
  phone_settings: { phone: string; settings: { setting: string; value: string; why: string }[]; verify_note: string };
  lighting_plan: { area: string; best_time: string; tips: string }[];
  shot_list: { area: string; shots: string[]; lens: string; tip: string }[];
  staging_checklist: { area: string; items: string[] }[];
  composition_rules: string[];
  editing_steps: { app: string; steps: { step: string; value: string }[]; honesty_note: string };
  video_plan: { clips: { clip: string; seconds: number; movement: string }[]; tips: string[] };
  troubleshooting: { problem: string; fix: string }[];
};

const card = "rounded-xl border-2 border-slate-200 bg-white p-5";

export default function PhotoGuideView({ output }: ModuleViewProps<Output>) {
  const t = useTranslations("modules.photo-guide.view");
  return (
    <div className="space-y-10">
      <div className="rounded-xl border-2 border-brand-200 bg-brand-50 p-5 text-lg text-slate-900">
        <p>{output.summary}</p>
        <dl className="mt-4 grid gap-2 sm:grid-cols-[12rem_1fr]">
          <dt className="font-bold">{t("bestTime")}</dt>
          <dd>{output.shoot_plan.best_time}</dd>
          <dt className="font-bold">{t("totalTime")}</dt>
          <dd>{output.shoot_plan.total_time}</dd>
        </dl>
      </div>

      <OutputSection title={t("roomOrder")} icon="🗺️">
        <div className={card}>
          <BulletList items={output.shoot_plan.room_order} numbered />
        </div>
      </OutputSection>

      <OutputSection title={t("beforeYouStart")} icon="🔋">
        <div className={card}>
          <Checklist items={output.before_you_start} />
        </div>
      </OutputSection>

      <OutputSection title={t("phoneSettings", { phone: output.phone_settings.phone })} icon="📱">
        <div className="overflow-x-auto rounded-xl border-2 border-slate-200 bg-white">
          <table className="w-full text-left text-lg">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4">{t("setting")}</th>
                <th className="p-4">{t("value")}</th>
                <th className="p-4">{t("why")}</th>
              </tr>
            </thead>
            <tbody>
              {output.phone_settings.settings.map((s, i) => (
                <tr key={i} className="border-t-2 border-slate-100 align-top">
                  <td className="p-4 font-semibold">{s.setting}</td>
                  <td className="p-4">{s.value}</td>
                  <td className="p-4 text-slate-800">{s.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {output.phone_settings.verify_note ? (
          <p className="rounded-lg bg-amber-50 p-4 text-base text-amber-900">🔎 {output.phone_settings.verify_note}</p>
        ) : null}
      </OutputSection>

      <OutputSection title={t("lighting")} icon="☀️">
        <div className="grid gap-4 md:grid-cols-2">
          {output.lighting_plan.map((l, i) => (
            <div key={i} className={card}>
              <p className="text-lg font-bold">{l.area}</p>
              <p className="mt-1 text-lg">🕒 {l.best_time}</p>
              <p className="mt-2 text-lg text-slate-800">{l.tips}</p>
            </div>
          ))}
        </div>
      </OutputSection>

      <OutputSection title={t("shotList")} icon="📋">
        <div className="space-y-4">
          {output.shot_list.map((room, i) => (
            <div key={i} className={card}>
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-xl font-bold">{room.area}</p>
                <p className="rounded-full bg-slate-100 px-3 py-1 text-base font-semibold">{t("lens")}: {room.lens}</p>
              </div>
              <Checklist items={room.shots} />
              {room.tip ? <p className="mt-3 text-base text-slate-700">💡 {room.tip}</p> : null}
            </div>
          ))}
        </div>
      </OutputSection>

      <OutputSection title={t("staging")} icon="🧹">
        <div className="grid gap-4 md:grid-cols-2">
          {output.staging_checklist.map((area, i) => (
            <div key={i} className={card}>
              <p className="mb-3 text-lg font-bold">{area.area}</p>
              <Checklist items={area.items} />
            </div>
          ))}
        </div>
      </OutputSection>

      <OutputSection title={t("composition")} icon="📐">
        <div className={card}>
          <BulletList items={output.composition_rules} />
        </div>
      </OutputSection>

      <OutputSection title={t("editing", { app: output.editing_steps.app })} icon="🎨">
        <ol className="space-y-3">
          {output.editing_steps.steps.map((s, i) => (
            <li key={i} className={`${card} flex gap-4`}>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-700 text-lg font-bold text-white">
                {i + 1}
              </span>
              <div className="text-lg">
                <p className="font-semibold">{s.step}</p>
                {s.value ? <p className="text-slate-800">{s.value}</p> : null}
              </div>
            </li>
          ))}
        </ol>
        <p className="rounded-lg bg-amber-50 p-4 text-base text-amber-900">⚖️ {output.editing_steps.honesty_note}</p>
      </OutputSection>

      {output.video_plan.clips.length > 0 && (
        <OutputSection title={t("video")} icon="🎥">
          <ol className="space-y-3">
            {output.video_plan.clips.map((c, i) => (
              <li key={i} className={card}>
                <p className="text-lg font-bold">
                  {i + 1}. {c.clip} <span className="font-normal text-slate-700">· {t("seconds", { seconds: c.seconds })}</span>
                </p>
                <p className="mt-1 text-lg text-slate-800">{c.movement}</p>
              </li>
            ))}
          </ol>
          {output.video_plan.tips.length > 0 && (
            <div className={card}>
              <BulletList items={output.video_plan.tips} />
            </div>
          )}
        </OutputSection>
      )}

      <OutputSection title={t("troubleshooting")} icon="🛠️">
        <div className="space-y-3">
          {output.troubleshooting.map((tr, i) => (
            <div key={i} className={card}>
              <p className="text-lg font-bold">❓ {tr.problem}</p>
              <p className="mt-1 text-lg text-slate-800">✅ {tr.fix}</p>
            </div>
          ))}
        </div>
      </OutputSection>
    </div>
  );
}
