import { getTranslations } from "next-intl/server";
import type { LeadFormLabels } from "@/app/l/[slug]/LeadForm";
import { isUiLocale } from "@/lib/languages";

/** Lead-form labels in the listing page's own language (not the visitor's app setting). */
export async function leadFormLabels(language: string, agentName: string, kiosk = false): Promise<LeadFormLabels> {
  const locale = isUiLocale(language) ? language : "en";
  const t = await getTranslations({ locale, namespace: "publicPage" });
  const interests = ["showing", "info", "openHouse", "selling"] as const;
  return {
    title: kiosk ? t("kioskTitle") : t("formTitle"),
    firstName: t("firstName"),
    lastName: t("lastName"),
    email: t("email"),
    phone: t("phone"),
    contactHint: t("contactHint"),
    interest: t("interest"),
    interests: interests.map((i) => ({ value: t(`interests.${i}`), label: t(`interests.${i}`) })),
    message: t("message"),
    emailOptIn: t("emailOptIn", { agent: agentName }),
    smsConsent: t("smsConsent", { agent: agentName }),
    workingWithAgent: t("workingWithAgent"),
    yes: t("yes"),
    no: t("no"),
    submit: kiosk ? t("kioskSubmit") : t("submit"),
    sending: t("sending"),
    thanksTitle: kiosk ? t("kioskThanksTitle") : t("thanksTitle"),
    thanksBody: kiosk ? t("kioskThanksBody") : t("thanksBody", { agent: agentName }),
    nextVisitor: t("nextVisitor"),
    optional: t("optional"),
    errors: { missing: t("errors.missing"), contact: t("errors.contact"), rate: t("errors.rate"), generic: t("errors.generic") },
  };
}

/** Picks black or white text for readable contrast on the agent's accent color. */
export function textOn(hex: string): string {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.4 ? "#0f172a" : "#ffffff";
}
