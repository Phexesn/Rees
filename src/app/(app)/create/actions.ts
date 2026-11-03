"use server";

import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/actions";
import { requireSetupContext } from "@/lib/auth/context";
import { FeatureLockedError } from "@/lib/features";
import { GenerationInputError, runGeneration } from "@/lib/generation/run";
import { LLMError } from "@/lib/llm";
import { log } from "@/lib/log";
import { getModule } from "@/modules";

export async function generateAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await requireSetupContext();
  const moduleId = String(formData.get("moduleId") ?? "");
  const mod = getModule(moduleId);
  if (!mod) return { error: "errors.notFound" };

  // Build the module input from its declared option fields.
  const input: Record<string, unknown> = {};
  for (const field of mod.options) {
    if (field.type === "checkbox") input[field.name] = formData.get(field.name) === "on";
    else {
      const value = formData.get(field.name);
      input[field.name] = typeof value === "string" ? value.trim() : field.default;
    }
  }
  const languages = formData.getAll("languages").filter((v): v is string => typeof v === "string");
  const propertyId = (formData.get("propertyId") as string) || null;
  const contactId = (formData.get("contactId") as string) || null;

  let batchId: string;
  try {
    const result = await runGeneration(ctx, { moduleId, propertyId, contactId, input, languages });
    batchId = result.batchId;
  } catch (error) {
    if (error instanceof FeatureLockedError) return { error: "locked.generic" };
    if (error instanceof GenerationInputError) return { error: `create.errors.${error.code}` };
    if (error instanceof LLMError) return { error: "create.errors.ai", message: error.message };
    log("error", "generate_action_failed", { moduleId, error: String(error) });
    return { error: "errors.generic" };
  }
  redirect(`/generations/${batchId}`);
}
