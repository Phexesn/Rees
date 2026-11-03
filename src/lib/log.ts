/**
 * Structured JSON logs to stdout. On Vercel these land in Vercel Logs and can
 * be drained to Axiom/Logtail without code changes.
 */
type Level = "info" | "warn" | "error";

export function log(level: Level, event: string, fields: Record<string, unknown> = {}) {
  const line = JSON.stringify({ level, event, ts: new Date().toISOString(), ...fields });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}
