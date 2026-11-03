import type { JsonSchema, LLMProvider, LLMRequest, LLMResponse } from "@/lib/llm/types";

/**
 * Offline provider for local development and automated checks when no AI key
 * is configured. Produces schema-valid sample output so every screen can be
 * clicked through. Never used in production (see llm/index.ts).
 */
function sample(schema: JsonSchema, key: string, depth: number): unknown {
  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;
  if (Array.isArray(schema.enum) && schema.enum.length) return schema.enum[0];
  switch (type) {
    case "object": {
      const props = (schema.properties ?? {}) as Record<string, JsonSchema>;
      return Object.fromEntries(Object.entries(props).map(([k, v]) => [k, sample(v, k, depth + 1)]));
    }
    case "array": {
      const items = (schema.items ?? { type: "string" }) as JsonSchema;
      const count = depth > 2 ? 2 : 3;
      return Array.from({ length: count }, (_, i) => sample(items, `${key} ${i + 1}`, depth + 1));
    }
    case "integer":
    case "number":
      return 3;
    case "boolean":
      return true;
    default: {
      const label = key.replace(/_/g, " ");
      return `Sample ${label}. (Demo mode: connect an AI provider to write real content.)`;
    }
  }
}

export const mockProvider: LLMProvider = {
  id: "mock",
  defaultModel: "mock",
  isConfigured: () => true,
  async generate(req: LLMRequest): Promise<LLMResponse> {
    const started = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 250));
    const text = JSON.stringify(sample(req.schema, req.schemaName, 0));
    return {
      provider: "mock",
      model: "mock",
      text,
      usage: { inputTokens: Math.ceil((req.system.length + req.prompt.length) / 4), outputTokens: Math.ceil(text.length / 4) },
      latencyMs: Date.now() - started,
    };
  },
};
