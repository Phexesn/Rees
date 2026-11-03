import { getLocale, getTranslations } from "next-intl/server";
import { setLocaleAction } from "@/app/(auth)/actions";
import { CONTENT_LANGUAGES, UI_LOCALES } from "@/lib/languages";

/**
 * Works without JavaScript: each language is a real submit button.
 * `compact` renders a small "🌐 English ▾" dropdown for phone-sized headers.
 */
export async function LanguageSwitcher({ back = "/", compact = false }: { back?: string; compact?: boolean }) {
  const locale = await getLocale();
  const t = await getTranslations("common");
  const current = CONTENT_LANGUAGES.find((l) => l.code === locale)!;

  const buttons = UI_LOCALES.map((code) => {
    const info = CONTENT_LANGUAGES.find((l) => l.code === code)!;
    const active = code === locale;
    return (
      <button
        key={code}
        name="locale"
        value={code}
        lang={code}
        aria-pressed={active}
        className={`min-h-11 rounded-lg border-2 px-3 text-base font-semibold ${
          active ? "border-brand-700 bg-brand-700 text-white" : "border-slate-300 bg-white text-slate-900 hover:border-brand-600"
        } ${compact ? "w-full text-left" : ""}`}
      >
        {info.native}
      </button>
    );
  });

  if (compact) {
    return (
      <details className="relative">
        <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 rounded-xl border-2 border-slate-300 px-3 text-base font-semibold" aria-label={t("language")}>
          <span aria-hidden>🌐</span>
          <span lang={locale}>{current.native}</span>
          <span aria-hidden>▾</span>
        </summary>
        <form action={setLocaleAction} className="absolute right-0 z-50 mt-2 flex w-48 flex-col gap-2 rounded-2xl border-2 border-slate-200 bg-white p-3 shadow-xl">
          <input type="hidden" name="back" value={back} />
          {buttons}
        </form>
      </details>
    );
  }

  return (
    <form action={setLocaleAction} className="flex flex-wrap items-center gap-2" aria-label={t("language")}>
      <input type="hidden" name="back" value={back} />
      <span aria-hidden className="text-xl">🌐</span>
      {buttons}
    </form>
  );
}
