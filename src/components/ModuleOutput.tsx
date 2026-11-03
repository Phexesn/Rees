"use client";

import { VIEWS } from "@/modules/_generated/views";

/** Renders a module's output with that module's own View component. */
export function ModuleOutput({
  moduleId,
  output,
  input,
  language,
}: {
  moduleId: string;
  output: unknown;
  input: Record<string, unknown>;
  language: string;
}) {
  const View = VIEWS[moduleId];
  if (!View) return null;
  return (
    <div lang={language}>
      <View output={output} input={input} language={language} />
    </div>
  );
}

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-14 items-center gap-2 rounded-xl border-2 border-brand-700 bg-white px-6 text-lg font-semibold text-brand-800 hover:bg-brand-50"
    >
      🖨️ {label}
    </button>
  );
}
