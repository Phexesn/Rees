import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";
import { LLMError, type LLMProvider, type LLMRequest, type LLMResponse } from "@/lib/llm/types";

let client: Anthropic | null = null;
function getClient(): Anthropic {
  client ??= new Anthropic({ apiKey: env.anthropicKey() });
  return client;
}

/**
 * Claude via the official SDK.
 * - Structured output via output_config.format (JSON schema).
 * - Streaming + finalMessage() so long outputs (photo guides) never hit HTTP timeouts.
 * - Server-side refusal fallback ("default" routing) so a safety decline is
 *   re-run on Anthropic's recommended fallback model instead of failing.
 * - Current Claude models reject temperature, so it is not sent.
 */
export const anthropicProvider: LLMProvider = {
  id: "anthropic",
  defaultModel: "claude-opus-5-5",
  isConfigured: () => Boolean(env.anthropicKey()),
  async generate(req: LLMRequest): Promise<LLMResponse> {
    const started = Date.now();
    try {
      const stream = getClient().beta.messages.stream({
        model: req.model,
        max_tokens: req.maxTokens,
        system: req.system,
        cache_control: { type: "ephemeral" },
        messages: [{ role: "user", content: req.prompt }],
        output_config: {
          effort: req.effort ?? "medium",
          format: { type: "json_schema", schema: req.schema },
        },
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
      });
      const message = await stream.finalMessage();
      if (message.stop_reason === "refusal") {
        throw new LLMError("The AI declined to write this. Try rewording the property details.", "refused");
      }
      if (message.stop_reason === "max_tokens") {
        throw new LLMError("The AI ran out of room before finishing. Please try again.", "bad_output", true);
      }
      const text = message.content
        .map((block) => (block.type === "text" ? block.text : ""))
        .join("");
      return {
        provider: "anthropic",
        model: message.model,
        text,
        usage: {
          inputTokens: message.usage.input_tokens,
          outputTokens: message.usage.output_tokens,
          cacheReadTokens: message.usage.cache_read_input_tokens ?? 0,
          cacheWriteTokens: message.usage.cache_creation_input_tokens ?? 0,
        },
        latencyMs: Date.now() - started,
      };
    } catch (error) {
      if (error instanceof LLMError) throw error;
      if (error instanceof Anthropic.RateLimitError) {
        throw new LLMError("The AI is busy right now. Please wait a minute and try again.", "rate_limited", true);
      }
      if (error instanceof Anthropic.AuthenticationError) {
        throw new LLMError("The AI service key is not valid. Ask your administrator to check it.", "not_configured");
      }
      if (error instanceof Anthropic.APIError) {
        throw new LLMError(
          "The AI service had a problem. Please try again.",
          "provider_error",
          (error.status ?? 500) >= 500,
        );
      }
      throw error;
    }
  },
};
