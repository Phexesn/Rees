import "server-only";
import { env } from "@/lib/env";
import { log } from "@/lib/log";

/**
 * Transactional email via Resend's REST API. Without RESEND_API_KEY the email
 * is logged instead of sent (development), and callers are told it was not sent.
 */
export async function sendEmail(message: { to: string; subject: string; text: string; replyTo?: string }): Promise<{ sent: boolean }> {
  const key = env.resendKey();
  if (!key) {
    log("info", "email_not_sent_no_provider", { to: message.to, subject: message.subject });
    return { sent: false };
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: env.emailFrom(),
        to: [message.to],
        subject: message.subject,
        text: message.text,
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      }),
    });
    if (!response.ok) {
      log("error", "email_send_failed", { status: response.status });
      return { sent: false };
    }
    return { sent: true };
  } catch (error) {
    log("error", "email_send_failed", { error: String(error) });
    return { sent: false };
  }
}

/** Turns any structured AI output into readable plain text (for email-to-self). */
export function outputToText(value: unknown, depth = 0): string {
  const indent = "  ".repeat(depth);
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "object" && item !== null ? outputToText(item, depth + 1) : `${indent}• ${outputToText(item)}`))
      .join("\n");
  }
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, v]) => {
        const label = key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
        const body = outputToText(v, depth + 1);
        return typeof v === "object" && v !== null ? `${indent}${label}:\n${body}` : `${indent}${label}: ${body}`;
      })
      .join("\n");
  }
  return "";
}
