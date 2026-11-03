"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { formObject } from "@/lib/actions";
import { captureLead, findPublishedMicrosite, rateLimited } from "@/lib/leads";
import { log } from "@/lib/log";

export type LeadFormState = { ok?: boolean; error?: "missing" | "contact" | "rate" | "generic"; fieldErrors?: Record<string, true> };

const LeadSchema = z.object({
  slug: z.string().min(1),
  firstName: z.string().min(1).max(80),
  lastName: z.string().max(80).optional(),
  email: z.email().max(200).optional(),
  phone: z.string().max(40).optional(),
  interest: z.string().max(80).default("More information"),
  message: z.string().max(1500).optional(),
  website: z.string().optional(),
  consentText: z.string().max(1000).optional(),
  source: z.enum(["MICROSITE", "OPEN_HOUSE"]).default("MICROSITE"),
  workingWithAgent: z.enum(["yes", "no"]).optional(),
});

export async function submitLeadAction(_prev: LeadFormState, formData: FormData): Promise<LeadFormState> {
  const raw = formObject(formData);
  // Honeypot: real people never fill the hidden "website" field.
  if (raw.website) return { ok: true };
  const parsed = LeadSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, true> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = true;
    return { error: "missing", fieldErrors };
  }
  const d = parsed.data;
  if (!d.email && !d.phone) return { error: "contact", fieldErrors: { email: true, phone: true } };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(`lead:${ip}`)) return { error: "rate" };

  const found = await findPublishedMicrosite(d.slug);
  if (!found) return { error: "generic" };
  try {
    await captureLead(
      found.site,
      {
        firstName: d.firstName,
        lastName: d.lastName,
        email: d.email?.toLowerCase(),
        phone: d.phone,
        interest: d.interest,
        message: d.message,
        emailOptIn: formData.get("emailOptIn") === "on",
        smsConsent: formData.get("smsConsent") === "on",
        consentText: d.consentText ?? "",
        workingWithAgent: d.workingWithAgent ? d.workingWithAgent === "yes" : undefined,
        language: found.site.language,
      },
      d.source,
    );
  } catch (error) {
    log("error", "lead_capture_failed", { slug: d.slug, error: String(error) });
    return { error: "generic" };
  }
  return { ok: true };
}
