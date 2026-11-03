import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

/**
 * Fair Housing filter. Every AI output passes through `checkOutput` before an
 * agent sees it. Rules live in compliance/fair-housing.rules.yaml.
 *
 *   block + replacement → matched text rewritten          (action "rewritten")
 *   block, no replacement → containing sentence removed   (action "removed")
 *   warn  + replacement → matched text rewritten          (action "rewritten")
 *   warn, no replacement → kept, shown to the agent        (action "flagged")
 */

const RuleSchema = z.object({
  id: z.string(),
  lang: z.string(),
  class: z.string(),
  severity: z.enum(["block", "warn"]),
  pattern: z.string(),
  replacement: z.string().optional(),
  suggestion: z.string(),
});
const RulesFile = z.object({ version: z.number(), rules: z.array(RuleSchema) });

export type FairHousingRule = z.infer<typeof RuleSchema> & { regex: RegExp };

export type FairHousingIssue = {
  ruleId: string;
  class: string;
  severity: "block" | "warn";
  action: "rewritten" | "removed" | "flagged";
  match: string;
  path: string;
  suggestion: string;
  replacement?: string;
};

export type FairHousingReport = {
  checkedAt: string;
  rulesVersion: number;
  issues: FairHousingIssue[];
  /** True when any block-level rule matched in the raw output. */
  hadViolations: boolean;
  /** True when the agent should look before using the copy (removals or flags). */
  needsReview: boolean;
};

export const RULES_PATH = path.join(process.cwd(), "compliance", "fair-housing.rules.yaml");

let cache: { mtimeMs: number; version: number; rules: FairHousingRule[] } | null = null;

export function loadRules(file = RULES_PATH): { version: number; rules: FairHousingRule[] } {
  const mtimeMs = statSync(file).mtimeMs;
  if (cache && cache.mtimeMs === mtimeMs && file === RULES_PATH) return cache;
  const parsed = RulesFile.parse(parseYaml(readFileSync(file, "utf8")));
  const ids = new Set<string>();
  const rules = parsed.rules.map((rule) => {
    if (ids.has(rule.id)) throw new Error(`Duplicate Fair Housing rule id: ${rule.id}`);
    ids.add(rule.id);
    try {
      return { ...rule, regex: new RegExp(rule.pattern, "giu") };
    } catch (error) {
      throw new Error(`Fair Housing rule ${rule.id} has an invalid pattern: ${String(error)}`);
    }
  });
  const loaded = { mtimeMs, version: parsed.version, rules };
  if (file === RULES_PATH) cache = loaded;
  return loaded;
}

/** English rules always run; plus the target language's rules and "all". */
function rulesFor(language: string, rules: FairHousingRule[]): FairHousingRule[] {
  const base = language.split("-")[0];
  return rules.filter((r) => r.lang === "all" || r.lang === "en" || r.lang === language || r.lang === base);
}

function matchCase(source: string, replacement: string): string {
  if (source.length > 1 && source === source.toUpperCase() && /[A-Z]/.test(source)) return replacement.toUpperCase();
  if (/^[A-Z]/.test(source)) return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  return replacement;
}

const SENTENCE_END = /[.!?。！？\n]/u;

/** Removes the sentence that contains [start, end). */
function removeSentence(text: string, start: number, end: number): string {
  let s = start;
  while (s > 0 && !SENTENCE_END.test(text[s - 1])) s--;
  let e = end;
  while (e < text.length && !SENTENCE_END.test(text[e])) e++;
  if (e < text.length && text[e] !== "\n") e++;
  const before = text.slice(0, s).replace(/[ \t]+$/, "");
  const after = text.slice(e).replace(/^[ \t]+/, "");
  const joined = before && after && !before.endsWith("\n") ? `${before} ${after}` : `${before}${after}`;
  return joined.replace(/[ \t]{2,}/g, " ").trim();
}

export function checkText(
  text: string,
  language: string,
  pathLabel = "",
  rules: FairHousingRule[] = loadRules().rules,
): { text: string; issues: FairHousingIssue[] } {
  let current = text;
  const issues: FairHousingIssue[] = [];
  for (const rule of rulesFor(language, rules)) {
    // Loop because a removal shifts positions; re-scan until the rule no longer matches.
    for (let guard = 0; guard < 20; guard++) {
      rule.regex.lastIndex = 0;
      const m = rule.regex.exec(current);
      if (!m) break;
      const matched = m[0];
      const start = m.index;
      const end = start + matched.length;
      if (rule.replacement !== undefined) {
        current = current.slice(0, start) + matchCase(matched, rule.replacement) + current.slice(end);
        issues.push({
          ruleId: rule.id, class: rule.class, severity: rule.severity, action: "rewritten",
          match: matched, path: pathLabel, suggestion: rule.suggestion, replacement: rule.replacement,
        });
      } else if (rule.severity === "block") {
        current = removeSentence(current, start, end);
        issues.push({
          ruleId: rule.id, class: rule.class, severity: rule.severity, action: "removed",
          match: matched, path: pathLabel, suggestion: rule.suggestion,
        });
      } else {
        issues.push({
          ruleId: rule.id, class: rule.class, severity: rule.severity, action: "flagged",
          match: matched, path: pathLabel, suggestion: rule.suggestion,
        });
        // Flag each distinct phrase once; collect the remaining matches without changing text.
        const seen = new Set([matched.toLowerCase()]);
        let next: RegExpExecArray | null;
        while ((next = rule.regex.exec(current))) {
          if (!seen.has(next[0].toLowerCase())) {
            seen.add(next[0].toLowerCase());
            issues.push({
              ruleId: rule.id, class: rule.class, severity: rule.severity, action: "flagged",
              match: next[0], path: pathLabel, suggestion: rule.suggestion,
            });
          }
        }
        break;
      }
    }
  }
  return { text: current, issues };
}

/** Walks every string in a JSON output, rewriting/removing as needed. */
export function checkOutput<T>(output: T, language: string): { output: T; report: FairHousingReport } {
  const { version, rules } = loadRules();
  const issues: FairHousingIssue[] = [];

  const walk = (value: unknown, at: string): unknown => {
    if (typeof value === "string") {
      const result = checkText(value, language, at, rules);
      issues.push(...result.issues);
      return result.text;
    }
    if (Array.isArray(value)) {
      return value
        .map((item, i) => walk(item, `${at}[${i}]`))
        .filter((item, i) => !(typeof value[i] === "string" && item === ""));
    }
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, walk(v, at ? `${at}.${k}` : k)]),
      );
    }
    return value;
  };

  const cleaned = walk(output, "") as T;
  return {
    output: cleaned,
    report: {
      checkedAt: new Date().toISOString(),
      rulesVersion: version,
      issues,
      hadViolations: issues.some((i) => i.severity === "block"),
      needsReview: issues.some((i) => i.action === "removed" || i.action === "flagged"),
    },
  };
}

/** Phrases to tell the model to avoid on a regeneration attempt. */
export function violationSummary(report: FairHousingReport): string {
  const phrases = Array.from(new Set(report.issues.filter((i) => i.severity === "block").map((i) => `"${i.match}"`)));
  return phrases.join(", ");
}
