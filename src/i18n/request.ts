import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, isUiLocale, type UiLocale } from "@/lib/languages";

export const LOCALE_COOKIE = "NEXT_LOCALE";

type Messages = Record<string, unknown>;

function deepMerge(base: Messages, override: Messages): Messages {
  const out: Messages = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const existing = out[key];
    out[key] =
      value && typeof value === "object" && !Array.isArray(value) && existing && typeof existing === "object"
        ? deepMerge(existing as Messages, value as Messages)
        : value;
  }
  return out;
}

async function loadMessages(locale: UiLocale): Promise<Messages> {
  const en = (await import("../../locales/en.json")).default as Messages;
  if (locale === "en") return en;
  const translated = (await import(`../../locales/${locale}.json`)).default as Messages;
  // English fills any key a translation has not caught up with yet.
  return deepMerge(en, translated);
}

export default getRequestConfig(async () => {
  const jar = await cookies();
  const cookieLocale = jar.get(LOCALE_COOKIE)?.value;
  const locale: UiLocale = isUiLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  return {
    locale,
    messages: await loadMessages(locale),
    timeZone: "America/New_York",
    getMessageFallback: ({ key }) => key.split(".").pop() ?? key,
  };
});
