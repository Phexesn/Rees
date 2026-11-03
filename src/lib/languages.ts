/** UI locales shipped with translation files in /locales. */
export const UI_LOCALES = ["en", "es", "zh", "vi", "ko"] as const;
export type UiLocale = (typeof UI_LOCALES)[number];
export const DEFAULT_LOCALE: UiLocale = "en";

export function isUiLocale(value: string | undefined | null): value is UiLocale {
  return !!value && (UI_LOCALES as readonly string[]).includes(value);
}

/**
 * Languages the AI can write content in. The first five also have a full UI
 * translation; the last three are content-only for now (see BACKLOG.md).
 * `promptName` is what we tell the model.
 */
export const CONTENT_LANGUAGES = [
  { code: "en", native: "English", promptName: "English (US)" },
  { code: "es", native: "Español", promptName: "Spanish (US Latino audience, neutral Latin American Spanish)" },
  { code: "zh", native: "简体中文", promptName: "Simplified Chinese (Mandarin, for Chinese-speaking home buyers in the US)" },
  { code: "vi", native: "Tiếng Việt", promptName: "Vietnamese (for Vietnamese-American home buyers)" },
  { code: "ko", native: "한국어", promptName: "Korean (for Korean-American home buyers)" },
  { code: "tl", native: "Tagalog", promptName: "Tagalog / Filipino" },
  { code: "pt-BR", native: "Português (Brasil)", promptName: "Brazilian Portuguese" },
  { code: "fr-CA", native: "Français (Canada)", promptName: "Canadian French" },
] as const;

export type ContentLanguageCode = (typeof CONTENT_LANGUAGES)[number]["code"];

export function isContentLanguage(code: string): code is ContentLanguageCode {
  return CONTENT_LANGUAGES.some((l) => l.code === code);
}

export function languageInfo(code: string) {
  return CONTENT_LANGUAGES.find((l) => l.code === code) ?? CONTENT_LANGUAGES[0];
}

/** Languages the agent has chosen, primary first, trimmed to the plan limit. */
export function allowedContentLanguages(
  primary: string,
  extras: string[],
  limit: number,
): ContentLanguageCode[] {
  const ordered = [primary, ...extras].filter(isContentLanguage);
  return Array.from(new Set(ordered)).slice(0, Math.max(0, limit)) as ContentLanguageCode[];
}
