import { env } from "@/lib/env";
import { LLMError, type LLMProvider, type LLMRequest, type LLMResponse } from "@/lib/llm/types";

/** OpenAI Chat Completions with strict JSON-schema output. */
export const openaiProvider: LLMProvider = {
  id: "openai",
  defaultModel: "gpt-5-mini",
  isConfigured: () => Boolean(env.openaiKey()),
  async generate(req: LLMRequest): Promise<LLMResponse> {
    const started = Date.now();
    // Reasoning-model families reject sampling params.
    const acceptsTemperature = !/^(gpt-5|o\d)/.test(req.model);
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${env.openaiKey()}` },
      body: JSON.stringify({
        model: req.model,
        messages: [
          { role: "system", content: req.system },
          { role: "user", content: req.prompt },
        ],
        max_completion_tokens: req.maxTokens,
        ...(acceptsTemperature && req.temperature !== undefined ? { temperature: req.temperature } : {}),
        response_format: {
          type: "json_schema",
          json_schema: { name: req.schemaName.replace(/[^a-zA-Z0-9_-]/g, "_"), schema: req.schema, strict: true },
        },
      }),
    });
    if (response.status === 429) throw new LLMError("The AI is busy right now. Please try again shortly.", "rate_limited", true);
    if (!response.ok) {
      throw new LLMError("The AI service had a problem. Please try again.", "provider_error", response.status >= 500);
    }
    const data = (await response.json()) as {
      model: string;
      choices: { message: { content: string | null; refusal?: string | null } }[];
      usage: { prompt_tokens: number; completion_tokens: number };
    };
    const choice = data.choices[0]?.message;
    if (choice?.refusal) throw new LLMError("The AI declined to write this.", "refused");
    return {
      provider: "openai",
      model: data.model,
      text: choice?.content ?? "",
      usage: { inputTokens: data.usage.prompt_tokens, outputTokens: data.usage.completion_tokens },
      latencyMs: Date.now() - started,
    };
  },
};
