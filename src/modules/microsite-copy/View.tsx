"use client";

import { BulletList, CopyBlock } from "@/components/output";
import type { ModuleViewProps } from "@/modules/view-types";

type Output = { headline: string; intro: string; highlights: string[]; body: string };

export default function MicrositeCopyView({ output }: ModuleViewProps<Output>) {
  return (
    <div className="space-y-4">
      <CopyBlock text={output.headline} />
      <CopyBlock text={output.intro} />
      <div className="rounded-xl border-2 border-slate-200 bg-white p-5">
        <BulletList items={output.highlights} />
      </div>
      <CopyBlock text={output.body} />
    </div>
  );
}
