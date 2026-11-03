"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";

/** Big, obvious copy button that confirms in words, not just an icon. */
export function CopyButton({ text, label }: { text: string; label?: string }) {
  const t = useTranslations("output");
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch {
          setCopied(false);
        }
      }}
      className="inline-flex min-h-12 items-center gap-2 rounded-lg border-2 border-brand-700 bg-white px-4 text-base font-semibold text-brand-800 hover:bg-brand-50 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-brand-600 print:hidden"
      aria-live="polite"
    >
      <span aria-hidden>{copied ? "✓" : "⧉"}</span>
      {copied ? t("copied") : (label ?? t("copy"))}
    </button>
  );
}

/** A piece of generated text with a copy button and an optional character limit. */
export function CopyBlock({
  title,
  text,
  limit,
  hint,
}: {
  title?: string;
  text: string;
  limit?: number;
  hint?: ReactNode;
}) {
  const t = useTranslations("output");
  const length = [...text].length;
  const over = limit !== undefined && length > limit;
  return (
    <div className="rounded-xl border-2 border-slate-200 bg-white p-5 print:border-slate-400">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        {title ? <h4 className="text-lg font-bold text-slate-900">{title}</h4> : <span />}
        <CopyButton text={text} />
      </div>
      <p className="whitespace-pre-wrap text-lg leading-relaxed text-slate-900">{text}</p>
      <p className={`mt-3 text-base ${over ? "font-semibold text-red-700" : "text-slate-700"}`}>
        {limit !== undefined
          ? over
            ? t("overLimit", { count: length, limit, over: length - limit })
            : t("charsOfLimit", { count: length, limit })
          : t("chars", { count: length })}
      </p>
      {hint ? <div className="mt-2 text-base text-slate-700">{hint}</div> : null}
    </div>
  );
}

export function OutputSection({ title, children, icon }: { title: string; children: ReactNode; icon?: string }) {
  return (
    <section className="space-y-4 break-inside-avoid">
      <h3 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
        {icon ? <span aria-hidden>{icon}</span> : null}
        {title}
      </h3>
      {children}
    </section>
  );
}

export function BulletList({ items, numbered }: { items: string[]; numbered?: boolean }) {
  const Tag = numbered ? "ol" : "ul";
  return (
    <Tag className={`space-y-2 pl-7 text-lg leading-relaxed text-slate-900 ${numbered ? "list-decimal" : "list-disc"}`}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </Tag>
  );
}

export function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-lg text-slate-900">
          <input
            type="checkbox"
            className="mt-1 size-6 shrink-0 accent-brand-700"
            aria-label={item}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Tabs for variants — real buttons with large hit targets. */
export function Tabs({ labels, children }: { labels: string[]; children: (index: number) => ReactNode }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div role="tablist" className="mb-4 flex flex-wrap gap-2 print:hidden">
        {labels.map((label, i) => (
          <button
            key={i}
            role="tab"
            type="button"
            aria-selected={active === i}
            onClick={() => setActive(i)}
            className={`min-h-12 rounded-lg border-2 px-4 text-base font-semibold ${
              active === i
                ? "border-brand-700 bg-brand-700 text-white"
                : "border-slate-300 bg-white text-slate-900 hover:border-brand-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="print:hidden">{children(active)}</div>
      <div className="hidden space-y-8 print:block">
        {labels.map((label, i) => (
          <div key={i}>
            <h4 className="mb-2 text-xl font-bold">{label}</h4>
            {children(i)}
          </div>
        ))}
      </div>
    </div>
  );
}
