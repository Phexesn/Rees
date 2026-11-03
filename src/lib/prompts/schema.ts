import Ajv, { type ValidateFunction } from "ajv";
import type { JsonSchema } from "@/lib/llm/types";

/**
 * Prompt files can write short schemas. Before sending to a provider we make
 * them strict-mode compatible for every provider: all object properties are
 * required and no extra properties are allowed.
 */
export function strictSchema(schema: JsonSchema): JsonSchema {
  const out: JsonSchema = { ...schema };
  if (out.type === "object" && out.properties && typeof out.properties === "object") {
    const props = out.properties as Record<string, JsonSchema>;
    out.properties = Object.fromEntries(Object.entries(props).map(([k, v]) => [k, strictSchema(v)]));
    out.required = Object.keys(props);
    out.additionalProperties = false;
  }
  if (out.type === "array" && out.items && typeof out.items === "object") {
    out.items = strictSchema(out.items as JsonSchema);
  }
  return out;
}

const ajv = new Ajv({ allErrors: true, strict: false });
const cache = new WeakMap<JsonSchema, ValidateFunction>();

export function validateAgainst(schema: JsonSchema, value: unknown): { ok: true } | { ok: false; errors: string } {
  let validate = cache.get(schema);
  if (!validate) {
    validate = ajv.compile(schema);
    cache.set(schema, validate);
  }
  if (validate(value)) return { ok: true };
  return { ok: false, errors: ajv.errorsText(validate.errors, { separator: "; " }) };
}

/** Parses model output that should be JSON, tolerating code fences. */
export function parseJsonOutput(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  return JSON.parse(trimmed);
}
