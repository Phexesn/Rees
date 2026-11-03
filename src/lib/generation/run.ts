import "server-only";
import { randomUUID } from "node:crypto";
import type { Generation, Prisma } from "@prisma/client";
import { checkOutput, violationSummary, type FairHousingReport } from "@/compliance/fair-housing";
import { audit } from "@/lib/audit";
import type { AppContext } from "@/lib/auth/context";
import { assertFeature, FeatureLockedError } from "@/lib/features";
import { languageInfo } from "@/lib/languages";
import { callLLM, costUsd, LLMError, resolveModel } from "@/lib/llm";
import { log } from "@/lib/log";
import { renderTemplate } from "@/lib/prompts/render";
import { parseJsonOutput, strictSchema, validateAgainst } from "@/lib/prompts/schema";
import { promptStore } from "@/lib/prompts/store";
import { getModule } from "@/modules";
import type { ContentModule } from "@/modules/types";

export class GenerationInputError extends Error {
  constructor(public code: "unknown_module" | "property_required" | "language_not_allowed" | "invalid_options") {
    super(code);
    this.name = "GenerationInputError";
  }
}

export type GenerationRequest = {
  moduleId: string;
  propertyId?: string | null;
  contactId?: string | null;
  input: Record<string, unknown>;
  languages: string[];
};

const COMPLIANCE_REMINDER = [
  "COMPLIANCE (US Fair Housing Act and state law) — this is mandatory:",
  "- Describe the PROPERTY, never the people who should live there.",
  "- Never mention or imply race, color, religion, sex, gender identity, sexual orientation, national origin,",
  "  ancestry, familial status (children, couples, singles), age, marital status, disability, source of income,",
  "  military status or citizenship.",
  "- Do not call an area \"safe\" or rate its schools; state facts the agent provided instead.",
  "- Use \"primary bedroom\" (not \"master\").",
  "HONESTY:",
  "- Use only facts provided below. Never invent features, upgrades, measurements, views or nearby places.",
  "- No hype or pressure (\"won't last\", \"once in a lifetime\", \"perfect\", \"dream home\"). Let real details sell.",
].join("\n");

async function generateOne(
  ctx: AppContext,
  mod: ContentModule,
  req: GenerationRequest,
  language: string,
  batchId: string,
  records: { property: Prisma.PropertyGetPayload<object> | null; contact: Prisma.ContactGetPayload<object> | null },
  input: Record<string, unknown>,
): Promise<Generation> {
  const template = await promptStore().get(mod.promptId);
  const lang = languageInfo(language);
  const vars = await mod.buildVariables(
    {
      tenant: ctx.tenant,
      profile: ctx.profile,
      property: records.property,
      contact: records.contact,
      language,
      languageName: lang.promptName,
    },
    input,
  );
  const allVars = { ...vars, [template.languageParam]: lang.promptName, compliance_rules: COMPLIANCE_REMINDER };
  const system = renderTemplate(template.system, allVars);
  const userPrompt = renderTemplate(template.user, allVars);
  const schema = strictSchema(template.outputSchema);
  const { provider, model } = resolveModel(template.model);

  let inputTokens = 0;
  let outputTokens = 0;
  let cost = 0;
  let latency = 0;
  let servedModel = model;

  const attempt = async (extraInstruction?: string) => {
    const response = await callLLM(provider, {
      model,
      system,
      prompt: extraInstruction ? `${userPrompt}\n\n${extraInstruction}` : userPrompt,
      maxTokens: template.maxTokens,
      temperature: template.temperature,
      effort: template.effort,
      schema,
      schemaName: template.id,
    });
    inputTokens += response.usage.inputTokens + (response.usage.cacheReadTokens ?? 0);
    outputTokens += response.usage.outputTokens;
    cost += costUsd(response.model, response.usage);
    latency += response.latencyMs;
    servedModel = response.model;
    let parsed: unknown;
    try {
      parsed = parseJsonOutput(response.text);
    } catch {
      throw new LLMError("The AI returned an unreadable answer. Please try again.", "bad_output", true);
    }
    const valid = validateAgainst(schema, parsed);
    if (!valid.ok) {
      log("warn", "generation_schema_mismatch", { module: mod.id, errors: valid.errors });
      throw new LLMError("The AI returned an incomplete answer. Please try again.", "bad_output", true);
    }
    return parsed;
  };

  let output: unknown = null;
  let report: FairHousingReport | null = null;
  let status: Generation["status"] = "SUCCESS";
  let errorMessage: string | null = null;

  try {
    let raw: unknown;
    try {
      raw = await attempt();
    } catch (error) {
      if (error instanceof LLMError && error.kind === "bad_output") raw = await attempt();
      else throw error;
    }
    let checked = checkOutput(raw, language);
    if (checked.report.hadViolations) {
      // One regeneration with explicit feedback before falling back to sentence removal.
      const retryRaw = await attempt(
        `IMPORTANT: Your previous draft used phrases that violate Fair Housing rules (${violationSummary(
          checked.report,
        )}). Rewrite without them. Describe only the property.`,
      );
      checked = checkOutput(retryRaw, language);
    }
    output = checked.output;
    report = checked.report;
    status = report.needsReview ? "NEEDS_REVIEW" : "SUCCESS";
  } catch (error) {
    status = "FAILED";
    errorMessage = error instanceof LLMError ? error.message : "Something went wrong while writing. Please try again.";
    if (!(error instanceof LLMError)) log("error", "generation_failed", { module: mod.id, error: String(error) });
  }

  const row = await ctx.db.generation.create({
    data: {
      tenantId: ctx.tenant.id,
      userId: ctx.user.id,
      moduleId: mod.id,
      propertyId: records.property?.id ?? null,
      contactId: records.contact?.id ?? null,
      batchId,
      language,
      input: input as Prisma.InputJsonValue,
      output: (output ?? undefined) as Prisma.InputJsonValue | undefined,
      compliance: (report ?? undefined) as Prisma.InputJsonValue | undefined,
      status,
      errorMessage,
      provider: provider.id,
      model: servedModel,
      promptId: template.id,
      promptVersion: template.version,
      inputTokens,
      outputTokens,
      costUsd: cost,
      latencyMs: latency,
    },
  });

  await audit({
    tenantId: ctx.tenant.id,
    userId: ctx.user.id,
    action: `generate:${mod.id}`,
    entity: "generation",
    entityId: row.id,
    model: servedModel,
    inputTokens,
    outputTokens,
    costUsd: cost,
    latencyMs: latency,
    metadata: { language, status, promptVersion: template.version, fairHousingIssues: report?.issues.length ?? 0 },
  });

  return row;
}

/**
 * Runs a module once per requested language (in parallel). All rows share a
 * batchId so the results page can show them side by side.
 */
export async function runGeneration(ctx: AppContext, req: GenerationRequest): Promise<{ batchId: string; generations: Generation[] }> {
  const mod = getModule(req.moduleId);
  if (!mod) throw new GenerationInputError("unknown_module");
  assertFeature(ctx.tenant, mod.feature);

  const parsedInput = mod.inputSchema.safeParse(req.input);
  if (!parsedInput.success) throw new GenerationInputError("invalid_options");

  const languages = Array.from(new Set(req.languages.length ? req.languages : [ctx.contentLanguages[0] ?? "en"]));
  for (const language of languages) {
    if (!ctx.contentLanguages.includes(language)) throw new GenerationInputError("language_not_allowed");
  }

  const property = req.propertyId ? await ctx.db.property.findUnique({ where: { id: req.propertyId } }) : null;
  if (mod.requires === "property" && !property) throw new GenerationInputError("property_required");
  const contact =
    req.contactId && mod.usesContact ? await ctx.db.contact.findUnique({ where: { id: req.contactId } }) : null;

  const batchId = randomUUID();
  const generations = await Promise.all(
    languages.map((language) => generateOne(ctx, mod, req, language, batchId, { property, contact }, parsedInput.data)),
  );
  return { batchId, generations };
}

export { FeatureLockedError };
