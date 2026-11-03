import "server-only";
import { MODULES } from "@/modules/_generated/registry";
import { toMeta, type ContentModule, type ModuleMeta } from "@/modules/types";

export function getModule(id: string): ContentModule | undefined {
  return MODULES[id];
}

/** Modules shown in the Create menu, in display order. */
export function listModuleMeta(options: { includeHidden?: boolean } = {}): ModuleMeta[] {
  return Object.values(MODULES)
    .filter((m) => options.includeHidden || !m.hidden)
    .sort((a, b) => a.order - b.order)
    .map(toMeta);
}
