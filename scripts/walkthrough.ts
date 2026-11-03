/**
 * Quality walkthrough (brief, slice 17): generates every content module for
 * the sample listings in several languages and writes readable files for a
 * human to review. Needs a real AI key (ANTHROPIC_API_KEY etc.); without one
 * the outputs are demo placeholders.
 *
 *   npm run db:seed            # creates the demo account and sample listings
 *   npm run walkthrough -- --languages=en,es,vi --listings=5 --modules=all
 *
 * Output: walkthrough-output/<timestamp>/<listing>/<module>.<lang>.md
 * Cost: ~5 listings x 6 modules x 3 languages = 90 generations. Check /admin.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { AppContext } from "@/lib/auth/context";
import { systemDb, tenantDb } from "@/lib/db";
import { outputToText } from "@/lib/email";
import { contentLanguageLimit, hasFeature } from "@/lib/features";
import { runGeneration } from "@/lib/generation/run";
import { allowedContentLanguages } from "@/lib/languages";
import { isDemoMode } from "@/lib/llm";
import { listModuleMeta } from "@/modules";

const arg = (name: string, fallback: string) =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1] ?? fallback;

async function main() {
  const email = arg("email", "demo@realtyboost.app");
  const languages = arg("languages", "en,es,vi").split(",");
  const listingCount = Number(arg("listings", "5"));
  const moduleFilter = arg("modules", "all");

  if (isDemoMode()) console.warn("⚠️  No AI key configured — outputs will be demo placeholders.");

  const user = await systemDb().user.findUnique({ where: { email } });
  if (!user) throw new Error(`No user ${email}. Run npm run db:seed first.`);
  const db = tenantDb(user.tenantId);
  const tenant = (await db.tenant.findUnique({ where: { id: user.tenantId } }))!;
  const profile = await db.agentProfile.findUnique({ where: { userId: user.id } });
  // Make sure the requested languages are allowed for this walkthrough run.
  const ctx: AppContext = {
    user: { id: user.id, email: user.email, name: user.name, role: user.role, locale: user.locale, isPlatformAdmin: false },
    tenant,
    profile,
    db,
    can: (feature) => hasFeature(tenant, feature),
    contentLanguages: Array.from(new Set([...languages, ...allowedContentLanguages(profile?.contentLanguage ?? "en", profile?.extraLanguages ?? [], contentLanguageLimit(tenant))])),
  };

  const properties = await db.property.findMany({ orderBy: { createdAt: "asc" }, take: listingCount });
  const modules = listModuleMeta().filter((m) => moduleFilter === "all" || moduleFilter.split(",").includes(m.id));
  const outDir = path.join(process.cwd(), "walkthrough-output", new Date().toISOString().replace(/[:.]/g, "-"));
  let total = 0;
  let failed = 0;
  let cost = 0;

  for (const property of properties) {
    const folder = path.join(outDir, property.address.replace(/[^a-z0-9]+/gi, "-").toLowerCase());
    mkdirSync(folder, { recursive: true });
    for (const mod of modules) {
      const input = Object.fromEntries(mod.options.map((o) => [o.name, o.default]));
      if (mod.id === "follow-up-coach") {
        Object.assign(input, { leadName: "Alex", whatTheySaid: "Is the price negotiable? We're relocating in the spring and haven't talked to a lender yet." });
      }
      process.stdout.write(`${property.address} · ${mod.id} … `);
      try {
        const { generations } = await runGeneration(ctx, { moduleId: mod.id, propertyId: property.id, input, languages });
        for (const g of generations) {
          total++;
          cost += Number(g.costUsd);
          if (g.status === "FAILED") failed++;
          const report = g.compliance as { issues?: { action: string; match: string; ruleId: string }[] } | null;
          const header = [
            `# ${mod.id} — ${property.address} — ${g.language}`,
            `status: ${g.status} · model: ${g.model} · tokens: ${g.inputTokens}/${g.outputTokens} · cost: $${Number(g.costUsd).toFixed(4)} · ${g.latencyMs} ms`,
            report?.issues?.length ? `Fair Housing: ${report.issues.map((i) => `${i.action} "${i.match}" (${i.ruleId})`).join("; ")}` : "Fair Housing: clean",
            "",
            "## Review (fill in): accuracy 1-5 · tone 1-5 · language quality 1-5 · would you publish it? notes:",
            "",
            "---",
            "",
          ].join("\n");
          writeFileSync(path.join(folder, `${mod.id}.${g.language}.md`), header + (g.output ? outputToText(g.output) : `FAILED: ${g.errorMessage}`));
        }
        console.log("done");
      } catch (error) {
        failed++;
        console.log(`error: ${String(error)}`);
      }
    }
  }
  console.log(`\n${total} outputs, ${failed} failed, total cost $${cost.toFixed(2)}.\nReview files in ${outDir}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
