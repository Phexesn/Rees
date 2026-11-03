import { env } from "@/lib/env";
import { log } from "@/lib/log";
import { anthropicProvider } from "@/lib/llm/providers/anthropic";
import { googleProvider } from "@/lib/llm/providers/google";
import { mockProvider } from "@/lib/llm/providers/mock";
import { openaiProvider } from "@/lib/llm/providers/openai";
import { LLMError, type LLMProvider, type LLMRequest, type LLMResponse, type ProviderId } from "@/lib/llm/types";

export * from "@/lib/llm/types";
export { costUsd } from "@/lib/llm/pricing";

const PROVIDERS: Record<ProviderId, LLMProvider> = {
  anthropic: anthropicProvider,
  openai: openaiProvider,
  google: googleProvider,
  mock: mockProvider,
};

function isProviderId(value: string | undefined): value is ProviderId {
  return !!value && value in PROVIDERS;
}

/**
 * Turns a prompt's declared model ("anthropic:claude-opus-5-5") into a concrete
 * provider + model, applying overrides in this order:
 *   1. per-call override (e.g. admin testing)
 *   2. LLM_PROVIDER env var — the "one config change swaps providers" switch
 *      (model from LLM_MODEL_<PROVIDER> or the provider default)
 *   3. the prompt file's own declaration
 * In development, an unconfigured provider falls back to the mock provider so
 * the app is usable without keys. In production it is an error.
 */
export function resolveModel(declared: string, override?: string): { provider: LLMProvider; model: string } {
  const spec = override ?? declared;
  const [declaredProvider, declaredModel] = spec.includes(":") ? spec.split(":", 2) : ["anthropic", spec];
  const envProvider = env.llmProviderOverride();

  let providerId: ProviderId = isProviderId(declaredProvider) ? declaredProvider : "anthropic";
  let model = declaredModel;
  if (!override && isProviderId(envProvider) && envProvider !== providerId) {
    providerId = envProvider;
    model = env.llmModelFor(envProvider) ?? PROVIDERS[envProvider].defaultModel;
  } else if (!override && isProviderId(envProvider)) {
    model = env.llmModelFor(envProvider) ?? model;
  }

  const provider = PROVIDERS[providerId];
  if (provider.isConfigured()) return { provider, model };
  if (!env.isProd()) {
    log("warn", "llm_provider_not_configured_using_mock", { provider: providerId });
    return { provider: mockProvider, model: "mock" };
  }
  throw new LLMError("AI writing is not set up yet. Ask your administrator to add an AI key.", "not_configured");
}

export function isDemoMode(): boolean {
  if (env.llmProviderOverride() === "mock") return true;
  return !env.isProd() && !anthropicProvider.isConfigured() && !openaiProvider.isConfigured() && !googleProvider.isConfigured();
}

/** One call with a single retry for transient failures. */
export async function callLLM(provider: LLMProvider, req: LLMRequest): Promise<LLMResponse> {
  try {
    return await provider.generate(req);
  } catch (error) {
    if (error instanceof LLMError && error.retryable) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return provider.generate(req);
    }
    if (error instanceof LLMError) throw error;
    log("error", "llm_unexpected_error", { provider: provider.id, error: String(error) });
    throw new LLMError("The AI service had a problem. Please try again.", "provider_error");
  }
}
