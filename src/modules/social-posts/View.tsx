"use client";

import { useTranslations } from "next-intl";
import { BulletList, CopyBlock, OutputSection } from "@/components/output";
import type { ModuleViewProps } from "@/modules/view-types";

type Output = {
  instagram: { caption: string; hashtags: string[]; alt_text: string };
  facebook: { post: string };
  linkedin: { post: string };
  x: { post: string };
  story_slides: string[];
};

export default function SocialPostsView({ output }: ModuleViewProps<Output>) {
  const t = useTranslations("modules.social-posts.view");
  const hashtags = output.instagram.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ");
  return (
    <div className="space-y-10">
      <OutputSection title="Instagram" icon="📸">
        <CopyBlock title={t("caption")} text={output.instagram.caption} limit={2200} />
        <CopyBlock title={t("hashtags")} text={hashtags} hint={t("hashtagsHint")} />
        <CopyBlock title={t("captionWithTags")} text={`${output.instagram.caption}\n\n${hashtags}`} limit={2200} />
        <CopyBlock title={t("altText")} text={output.instagram.alt_text} hint={t("altTextHint")} />
      </OutputSection>
      <OutputSection title="Facebook" icon="👍">
        <CopyBlock text={output.facebook.post} />
      </OutputSection>
      <OutputSection title="LinkedIn" icon="💼">
        <CopyBlock text={output.linkedin.post} limit={3000} />
      </OutputSection>
      <OutputSection title="X (Twitter)" icon="✖️">
        <CopyBlock text={output.x.post} limit={280} />
      </OutputSection>
      <OutputSection title={t("stories")} icon="📱">
        <div className="rounded-xl border-2 border-slate-200 bg-white p-5">
          <BulletList items={output.story_slides} numbered />
        </div>
      </OutputSection>
    </div>
  );
}
