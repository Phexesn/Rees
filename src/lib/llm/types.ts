export type ProviderId = "anthropic" | "openai" | "google" | "mock";

export type JsonSchema = Record<string, unknown>;

export type Effort = "low" | "medium" | "high";

export type LLMRequest = {
  model: string;
  system: string;
  prompt: string;
  maxTokens: number;
  /** Ignored by providers/models that no longer accept sampling params (e.g. current Claude models). */
  temperature?: number;
  /** Reasoning effort for providers that support it (Anthropic). */
  effort?: Effort;
  /** JSON schema the response must match. Providers use native structured output when available. */
  schema: JsonSchema;
  schemaName: string;
};

export type LLMUsage = { inputTokens: number; outputTokens: number; cacheReadTokens?: number; cacheWriteTokens?: number };

export type LLMResponse = {
  provider: ProviderId;
  /** Model that actually served the request (may differ after a refusal fallback). */
  model: string;
  text: string;
  usage: LLMUsage;
  latencyMs: number;
};

export interface LLMProvider {
  id: ProviderId;
  isConfigured(): boolean;
  defaultModel: string;
  generate(req: LLMRequest): Promise<LLMResponse>;
}

/** Errors with a message that is safe to show an agent. */
export class LLMError extends Error {
  constructor(
    message: string,
    public kind: "not_configured" | "refused" | "rate_limited" | "bad_output" | "provider_error",
    public retryable = false,
  ) {
    super(message);
    this.name = "LLMError";
  }
}
