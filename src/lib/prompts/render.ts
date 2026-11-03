/**
 * Minimal, predictable template rendering:
 *   {{name}}                 → value (missing → empty string)
 *   {{#if name}}...{{/if}}   → kept only when name is non-empty (no nesting)
 */
export type PromptVariables = Record<string, string | number | boolean | null | undefined>;

export function renderTemplate(template: string, vars: PromptVariables): string {
  const present = (name: string) => {
    const v = vars[name];
    return v !== undefined && v !== null && v !== false && String(v).trim() !== "";
  };
  const withConditionals = template.replace(
    /\{\{#if\s+([a-zA-Z0-9_]+)\s*\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_, name: string, inner: string) => (present(name) ? inner : ""),
  );
  return withConditionals
    .replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, name: string) => (present(name) ? String(vars[name]) : ""))
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
