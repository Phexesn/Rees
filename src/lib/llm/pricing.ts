/**
 * USD per 1M tokens. Used for the cost-per-tenant dashboard.
 * Anthropic rates are first-party API list prices (2026-10). OpenAI and Google
 * rates are placeholders to verify against their pricing pages before relying
 * on the numbers. Unknown models cost 0 and log a warning.
 */
import { log } from "@/lib/log";

type Rate = { input: number; output: number; cacheRead?: number };

const RATES: Record<string, Rate> = {
  "claude-fable-5-1": { input: 10, output: 50 },
  "claude-opus-5-5": { input: 4, output: 20, cacheRead: 0.2 },
  "claude-opus-5": { input: 5, output: 25 },
  "claude-opus-4-8": { input: 5, output: 25 },
  "claude-sonnet-5-5": { input: 2, output: 10, cacheRead: 0.2 },
  "claude-sonnet-5": { input: 2, output: 10 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5 },
  // Verify before relying on these:
  "gpt-5": { input: 1.25, output: 10 },
  "gpt-5-mini": { input: 0.25, output: 2 },
  "gemini-2.5-pro": { input: 1.25, output: 10 },
  "gemini-2.5-flash": { input: 0.3, output: 2.5 },
  mock: { input: 0, output: 0 },
};

export function costUsd(
  model: string,
  usage: { inputTokens: number; outputTokens: number; cacheReadTokens?: number; cacheWriteTokens?: number },
): number {
  const rate = RATES[model];
  if (!rate) {
    log("warn", "llm_unknown_model_price", { model });
    return 0;
  }
  const cacheRead = usage.cacheReadTokens ?? 0;
  const cacheWrite = usage.cacheWriteTokens ?? 0;
  const cost =
    (usage.inputTokens * rate.input +
      cacheWrite * rate.input * 1.25 +
      cacheRead * (rate.cacheRead ?? rate.input * 0.1) +
      usage.outputTokens * rate.output) /
    1_000_000;
  return Math.round(cost * 1_000_000) / 1_000_000;
}
