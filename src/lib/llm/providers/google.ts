import { env } from "@/lib/env";
import { LLMError, type LLMProvider, type LLMRequest, type LLMResponse } from "@/lib/llm/types";

/** Google Gemini via the Generative Language REST API with JSON-schema output. */
export const googleProvider: LLMProvider = {
  id: "google",
  defaultModel: "gemini-2.5-flash",
  isConfigured: () => Boolean(env.googleKey()),
  async generate(req: LLMRequest): Promise<LLMResponse> {
    const started = Date.now();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(req.model)}:generateContent`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": env.googleKey() ?? "" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: req.system }] },
        contents: [{ role: "user", parts: [{ text: req.prompt }] }],
        generationConfig: {
          maxOutputTokens: req.maxTokens,
          ...(req.temperature !== undefined ? { temperature: req.temperature } : {}),
          responseMimeType: "application/json",
          responseJsonSchema: req.schema,
        },
      }),
    });
    if (response.status === 429) throw new LLMError("The AI is busy right now. Please try again shortly.", "rate_limited", true);
    if (!response.ok) {
      throw new LLMError("The AI service had a problem. Please try again.", "provider_error", response.status >= 500);
    }
    const data = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
      usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; thoughtsTokenCount?: number };
      modelVersion?: string;
    };
    const candidate = data.candidates?.[0];
    if (candidate?.finishReason === "SAFETY") throw new LLMError("The AI declined to write this.", "refused");
    return {
      provider: "google",
      model: data.modelVersion ?? req.model,
      text: candidate?.content?.parts?.map((p) => p.text ?? "").join("") ?? "",
      usage: {
        inputTokens: data.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: (data.usageMetadata?.candidatesTokenCount ?? 0) + (data.usageMetadata?.thoughtsTokenCount ?? 0),
      },
      latencyMs: Date.now() - started,
    };
  },
};
