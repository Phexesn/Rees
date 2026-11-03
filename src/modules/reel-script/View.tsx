"use client";

import { useTranslations } from "next-intl";
import { BulletList, Checklist, CopyBlock, OutputSection } from "@/components/output";
import type { ModuleViewProps } from "@/modules/view-types";

type Output = {
  title: string;
  hook: string;
  duration_seconds: number;
  storyboard: {
    scene: number;
    seconds: number;
    area: string;
    shot: string;
    camera_move: string;
    on_screen_text: string;
    voiceover: string;
  }[];
  voiceover_script: string;
  shot_list: { clip: string; how_to_film: string; tip: string }[];
  editing_steps: string[];
  caption: string;
  hashtags: string[];
  music_note: string;
};

export default function ReelScriptView({ output }: ModuleViewProps<Output>) {
  const t = useTranslations("modules.reel-script.view");
  const total = output.storyboard.reduce((sum, s) => sum + (Number(s.seconds) || 0), 0);
  return (
    <div className="space-y-10">
      <div className="rounded-xl border-2 border-brand-200 bg-brand-50 p-5">
        <p className="text-xl font-bold text-slate-900">{output.title}</p>
        <p className="mt-1 text-lg text-slate-800">
          {t("length", { seconds: output.duration_seconds })} · {t("scenes", { count: output.storyboard.length })}
        </p>
      </div>
      <OutputSection title={t("hook")} icon="⚡">
        <CopyBlock text={output.hook} />
      </OutputSection>
      <OutputSection title={t("storyboard")} icon="🎞️">
        <ol className="space-y-4">
          {output.storyboard.map((s) => (
            <li key={s.scene} className="rounded-xl border-2 border-slate-200 bg-white p-5">
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-lg font-bold text-slate-900">
                  {t("scene", { number: s.scene })} · {s.area}
                </p>
                <p className="text-base font-semibold text-slate-700">{t("seconds", { seconds: s.seconds })}</p>
              </div>
              <dl className="grid gap-2 text-lg sm:grid-cols-[10rem_1fr]">
                <dt className="font-semibold text-slate-700">{t("shot")}</dt>
                <dd>{s.shot}</dd>
                <dt className="font-semibold text-slate-700">{t("cameraMove")}</dt>
                <dd>{s.camera_move}</dd>
                {s.on_screen_text ? (
                  <>
                    <dt className="font-semibold text-slate-700">{t("overlay")}</dt>
                    <dd className="font-semibold">“{s.on_screen_text}”</dd>
                  </>
                ) : null}
                {s.voiceover ? (
                  <>
                    <dt className="font-semibold text-slate-700">{t("voiceover")}</dt>
                    <dd className="italic">{s.voiceover}</dd>
                  </>
                ) : null}
              </dl>
            </li>
          ))}
        </ol>
        <p className="text-base text-slate-700">{t("totalSeconds", { seconds: Math.round(total) })}</p>
      </OutputSection>
      <OutputSection title={t("voiceoverScript")} icon="🎙️">
        <CopyBlock text={output.voiceover_script} />
      </OutputSection>
      <OutputSection title={t("shotList")} icon="📋">
        <div className="space-y-3">
          {output.shot_list.map((shot, i) => (
            <div key={i} className="rounded-xl border-2 border-slate-200 bg-white p-5">
              <Checklist items={[shot.clip]} />
              <p className="mt-2 pl-9 text-lg text-slate-800">{shot.how_to_film}</p>
              {shot.tip ? <p className="mt-1 pl-9 text-base text-slate-700">💡 {shot.tip}</p> : null}
            </div>
          ))}
        </div>
      </OutputSection>
      <OutputSection title={t("editing")} icon="✂️">
        <div className="rounded-xl border-2 border-slate-200 bg-white p-5">
          <BulletList items={output.editing_steps} numbered />
        </div>
      </OutputSection>
      <OutputSection title={t("caption")} icon="💬">
        <CopyBlock
          text={`${output.caption}\n\n${output.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")}`}
          limit={2200}
        />
        <p className="text-lg text-slate-800">🎵 {output.music_note}</p>
      </OutputSection>
    </div>
  );
}
