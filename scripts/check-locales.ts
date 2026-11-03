/**
 * Locale checks (run with `npm run check:locales`):
 *  1. every translation file has exactly the keys of locales/en.json
 *  2. every static translation key used in src/ exists in en.json
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

type Tree = { [key: string]: string | Tree };

const root = process.cwd();
const localesDir = path.join(root, "locales");
const en = JSON.parse(readFileSync(path.join(localesDir, "en.json"), "utf8")) as Tree;

function flatten(tree: Tree, prefix = ""): Map<string, string> {
  const out = new Map<string, string>();
  for (const [k, v] of Object.entries(tree)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") out.set(key, v);
    else for (const [ik, iv] of flatten(v, key)) out.set(ik, iv);
  }
  return out;
}

const enKeys = flatten(en);
const enPrefixes = new Set<string>();
for (const key of enKeys.keys()) {
  const parts = key.split(".");
  for (let i = 1; i < parts.length; i++) enPrefixes.add(parts.slice(0, i).join("."));
}
let problems = 0;

// 1. Translation parity
for (const file of readdirSync(localesDir).filter((f) => f.endsWith(".json") && f !== "en.json")) {
  const keys = flatten(JSON.parse(readFileSync(path.join(localesDir, file), "utf8")) as Tree);
  const missing = [...enKeys.keys()].filter((k) => !keys.has(k));
  const extra = [...keys.keys()].filter((k) => !enKeys.has(k));
  if (missing.length || extra.length) {
    problems += missing.length + extra.length;
    console.log(`\n${file}: ${missing.length} missing, ${extra.length} extra`);
    for (const k of missing.slice(0, 50)) console.log(`  - missing ${k}`);
    for (const k of extra.slice(0, 20)) console.log(`  + extra   ${k}`);
  } else {
    console.log(`${file}: OK (${keys.size} keys)`);
  }
}

// 2. Static keys used in code
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return name === "_generated" ? [] : walk(full);
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

const topLevel = new Set(Object.keys(en));
const used = new Map<string, string>();
for (const file of walk(path.join(root, "src"))) {
  const src = readFileSync(file, "utf8");
  // Declarations, in source order: const t = useTranslations("ns") | getTranslations({ namespace: "ns" }).
  const declarations = [
    ...src.matchAll(
      /(?:const|let)\s+(\w+)\s*=\s*(?:await\s+)?(?:getTranslations|useTranslations)\(\s*(?:"([^"]*)"|\{[^}]*namespace:\s*"([^"]*)"[^}]*\})?\s*\)/g,
    ),
  ].map((m) => ({ variable: m[1], ns: m[2] ?? m[3] ?? "", index: m.index ?? 0 }));
  for (const name of new Set(declarations.map((d) => d.variable))) {
    const re = new RegExp(`\\b${name}\\(\\s*"([^"]+)"`, "g");
    for (const m of src.matchAll(re)) {
      // The nearest declaration of this variable above the call decides the namespace.
      const decl = declarations.filter((d) => d.variable === name && d.index < (m.index ?? 0)).at(-1);
      if (!decl) continue;
      used.set(decl.ns ? `${decl.ns}.${m[1]}` : m[1], path.relative(root, file));
    }
  }
  // Keys passed around as plain strings (labelKey, error keys).
  for (const m of src.matchAll(/"([a-z][A-Za-z]*\.[A-Za-z0-9_.-]+)"/g)) {
    const key = m[1];
    // Direct translator calls like t("a.b") were already resolved above with their namespace.
    if (/\b\w+\(\s*$/.test(src.slice(Math.max(0, (m.index ?? 0) - 40), m.index))) continue;
    if (topLevel.has(key.split(".")[0]) && !key.endsWith(".")) used.set(key, path.relative(root, file));
  }
}

const missingInEn = [...used.entries()].filter(([key]) => !enKeys.has(key) && !enPrefixes.has(key));
if (missingInEn.length) {
  problems += missingInEn.length;
  console.log(`\nKeys used in code but missing from en.json (${missingInEn.length}):`);
  for (const [key, file] of missingInEn) console.log(`  ${key}   (${file})`);
} else {
  console.log(`All ${used.size} static keys used in code exist in en.json.`);
}

if (problems) process.exit(1);
