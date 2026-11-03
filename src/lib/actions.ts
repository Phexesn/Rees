import type { z } from "zod";

/**
 * Shared shape for server-action results used with useActionState.
 * `error` and field errors are i18n keys (resolved in the client form) so
 * messages appear in the agent's language.
 */
export type ActionState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
};

export const initialActionState: ActionState = {};

/** Maps zod issues to { field: "errors.<code>" } keys. */
export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    if (out[field]) continue;
    if (issue.code === "too_small") out[field] = issue.minimum === 1 ? "errors.required" : "errors.tooShort";
    else if (issue.code === "too_big") out[field] = "errors.tooLong";
    else if (issue.code === "invalid_format") out[field] = "errors.invalidFormat";
    else out[field] = "errors.invalid";
  }
  return out;
}

/** Reads a FormData into a plain object; empty strings become undefined. */
export function formObject(formData: FormData): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    out[key] = trimmed === "" ? undefined : trimmed;
  }
  return out;
}
