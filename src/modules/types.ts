import type { AgentProfile, Contact, Property, Tenant } from "@prisma/client";
import type { z } from "zod";
import type { Feature } from "@/lib/features";
import type { PromptVariables } from "@/lib/prompts/render";

/**
 * Content-generation module contract. Every module lives in
 * src/modules/<id>/ with two files:
 *   module.ts  — default export implementing ContentModule (server side)
 *   View.tsx   — default export React client component rendering the output
 * `npm run gen:registry` picks new folders up automatically.
 */

export type OptionField =
  | {
      type: "select";
      name: string;
      labelKey: string;
      hintKey?: string;
      options: { value: string; labelKey: string }[];
      default: string;
    }
  | { type: "checkbox"; name: string; labelKey: string; hintKey?: string; default: boolean }
  | {
      type: "text";
      name: string;
      labelKey: string;
      hintKey?: string;
      placeholderKey?: string;
      default: string;
      multiline?: boolean;
    };

export type ModuleMeta = {
  /** Folder name and stable id, e.g. "mls-listing". */
  id: string;
  icon: string;
  /** Tier gate checked on the server and shown in the UI. */
  feature: Feature;
  /** Position in the "Create" menu. */
  order: number;
  /** Whether a listing must be chosen first. */
  requires: "property" | "property-optional";
  /** Uses contact details when started from a CRM contact. */
  usesContact?: boolean;
  /** Internal modules (used by other screens) are not shown in the Create menu. */
  hidden?: boolean;
  options: OptionField[];
};

export type ModuleBuildContext = {
  tenant: Tenant;
  profile: AgentProfile | null;
  property: Property | null;
  contact: Contact | null;
  /** Content language code, e.g. "es". */
  language: string;
  /** Full instruction for the model, e.g. "Spanish (US Latino audience…)". */
  languageName: string;
};

export interface ContentModule<Input extends Record<string, unknown> = Record<string, unknown>>
  extends ModuleMeta {
  promptId: string;
  inputSchema: z.ZodType<Input>;
  buildVariables(ctx: ModuleBuildContext, input: Input): PromptVariables | Promise<PromptVariables>;
}

export function defineModule<Input extends Record<string, unknown>>(
  mod: ContentModule<Input>,
): ContentModule<Input> {
  return mod;
}

/** Serializable subset passed to client components. */
export function toMeta(mod: ContentModule): ModuleMeta {
  const { id, icon, feature, order, requires, usesContact, hidden, options } = mod;
  return { id, icon, feature, order, requires, usesContact, hidden, options };
}
