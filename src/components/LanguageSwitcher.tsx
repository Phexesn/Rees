import { getLocale, getTranslations } from "next-intl/server";
import { setLocaleAction } from "@/app/(auth)/actions";
import { CONTENT_LANGUAGES, UI_LOCALES } from "@/lib/languages";

/** Works without JavaScript: each language is a real submit button. */
export async function LanguageSwitcher({ back = "/" }: { back?: string }) {
  const locale = await getLocale();
  const t = await getTranslations("common");
  return (
    <form action={setLocaleAction} className="flex flex-wrap items-center gap-2" aria-label={t("language")}>
      <input type="hidden" name="back" value={back} />
      <span className="sr-only">{t("language")}</span>
      <span aria-hidden className="text-xl">🌐</span>
      {UI_LOCALES.map((code) => {
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
            }`}
          >
            {info.native}
          </button>
        );
      })}
    </form>
  );
}
