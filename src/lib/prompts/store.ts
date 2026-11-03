import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
import type { JsonSchema } from "@/lib/llm/types";

/**
 * Prompt templates live in /prompts as `<id>.prompt.md` files so non-engineers
 * can edit them. Format (see architecture/README.md):
 *
 *   ---
 *   id: mls-listing
 *   version: 1
 *   model: anthropic:claude-opus-5-5
 *   temperature: 0.7
 *   effort: medium
 *   max_tokens: 6000
 *   language_param: language
 *   inputs: [property_facts, agent, brand_voice, language]
 *   output_schema: { ...JSON schema... }
 *   ---
 *   # System
 *   ...
 *   # User
 *   ... {{property_facts}} ... {{#if extra}}...{{/if}}
 *
 * `FilePromptStore` re-reads a file whenever its mtime changes (hot reload, no
 * redeploy). A DB-backed store can implement the same `PromptStore` interface.
 */

export type PromptTemplate = {
  id: string;
  version: number;
  description?: string;
  model: string;
  temperature?: number;
  effort?: "low" | "medium" | "high";
  maxTokens: number;
  languageParam: string;
  inputs: string[];
  outputSchema: JsonSchema;
  system: string;
  user: string;
  source: string;
};

export interface PromptStore {
  get(id: string): Promise<PromptTemplate>;
}

const Frontmatter = z.object({
  id: z.string(),
  version: z.number().int().positive(),
  description: z.string().optional(),
  model: z.string(),
  temperature: z.number().min(0).max(2).optional(),
  effort: z.enum(["low", "medium", "high"]).optional(),
  max_tokens: z.number().int().positive(),
  language_param: z.string().default("language"),
  inputs: z.array(z.string()).default([]),
  output_schema: z.record(z.string(), z.unknown()),
});

export function parsePromptFile(raw: string, source: string): PromptTemplate {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`${source}: missing YAML frontmatter`);
  const meta = Frontmatter.parse(parseYaml(match[1]));
  const body = match[2];
  const systemMatch = body.match(/^# System\s*$([\s\S]*?)^# User\s*$([\s\S]*)$/im);
  if (!systemMatch) throw new Error(`${source}: body must contain "# System" then "# User" sections`);
  return {
    id: meta.id,
    version: meta.version,
    description: meta.description,
    model: meta.model,
    temperature: meta.temperature,
    effort: meta.effort,
    maxTokens: meta.max_tokens,
    languageParam: meta.language_param,
    inputs: meta.inputs,
    outputSchema: meta.output_schema,
    system: systemMatch[1].trim(),
    user: systemMatch[2].trim(),
    source,
  };
}

export class FilePromptStore implements PromptStore {
  private cache = new Map<string, { mtimeMs: number; template: PromptTemplate }>();
  constructor(private root: string) {}

  async get(id: string): Promise<PromptTemplate> {
    if (!/^[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(id)) throw new Error(`Invalid prompt id: ${id}`);
    const file = path.join(this.root, `${id}.prompt.md`);
    const stat = await fs.stat(file);
    const cached = this.cache.get(id);
    if (cached && cached.mtimeMs === stat.mtimeMs) return cached.template;
    const template = parsePromptFile(await fs.readFile(file, "utf8"), path.relative(process.cwd(), file));
    if (template.id !== id) throw new Error(`${file}: frontmatter id "${template.id}" must match file name "${id}"`);
    this.cache.set(id, { mtimeMs: stat.mtimeMs, template });
    return template;
  }
}

export const PROMPTS_DIR = path.join(process.cwd(), "prompts");

let store: PromptStore | null = null;
export function promptStore(): PromptStore {
  store ??= new FilePromptStore(PROMPTS_DIR);
  return store;
}

/** Reads a supporting reference file that lives next to the prompts (e.g. photography reference). */
export async function readPromptAsset(relativePath: string): Promise<string> {
  const file = path.join(PROMPTS_DIR, relativePath);
  if (!file.startsWith(PROMPTS_DIR)) throw new Error("Invalid asset path");
  return fs.readFile(file, "utf8");
}
