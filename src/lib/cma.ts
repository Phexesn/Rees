import { z } from "zod";

/**
 * Comparative Market Analysis math. Deterministic and explainable: the agent
 * provides the comps and can change every adjustment value. The AI only
 * writes the narrative around these numbers — it never sets the price.
 */

export const SubjectSchema = z.object({
  address: z.string().min(1).max(200),
  beds: z.coerce.number().min(0).max(30),
  baths: z.coerce.number().min(0).max(30),
  sqft: z.coerce.number().int().min(100).max(100000),
  yearBuilt: z.coerce.number().int().min(1700).max(2100).optional(),
  garageSpaces: z.coerce.number().min(0).max(20).default(0),
  pool: z.boolean().default(false),
  condition: z.coerce.number().int().min(1).max(5).default(3),
});

export const CompSchema = SubjectSchema.extend({
  status: z.enum(["sold", "pending", "active"]).default("sold"),
  price: z.coerce.number().int().min(1000).max(1_000_000_000),
  date: z.string().max(20).optional(),
  distanceMiles: z.coerce.number().min(0).max(100).optional(),
  notes: z.string().max(300).optional(),
});

export const SettingsSchema = z.object({
  sqftRate: z.coerce.number().min(0).max(5000).optional(),
  perBedroom: z.coerce.number().min(0).max(1_000_000).default(10000),
  perBathroom: z.coerce.number().min(0).max(1_000_000).default(7500),
  perGarageSpace: z.coerce.number().min(0).max(1_000_000).default(5000),
  pool: z.coerce.number().min(0).max(1_000_000).default(15000),
  conditionPct: z.coerce.number().min(0).max(25).default(3),
});

export type Subject = z.infer<typeof SubjectSchema>;
export type Comp = z.infer<typeof CompSchema>;
export type CmaSettings = z.infer<typeof SettingsSchema>;

export type CompResult = {
  comp: Comp;
  pricePerSqft: number;
  adjustments: { label: string; amount: number }[];
  netAdjustment: number;
  grossAdjustmentPct: number;
  adjustedPrice: number;
  weak: boolean;
};

export type CmaResult = {
  usedSqftRate: number;
  comps: CompResult[];
  soldCount: number;
  range: { low: number; median: number; high: number } | null;
  suggestedListRange: { low: number; high: number } | null;
  medianPricePerSqft: number | null;
  warnings: string[];
};

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function percentile(values: number[], p: number): number {
  const s = [...values].sort((a, b) => a - b);
  const idx = (s.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return s[lo] + (s[hi] - s[lo]) * (idx - lo);
}

const roundTo = (value: number, step: number) => Math.round(value / step) * step;

export function computeCma(subject: Subject, comps: Comp[], settings: CmaSettings): CmaResult {
  const warnings: string[] = [];
  const sold = comps.filter((c) => c.status === "sold");
  const ppsfAll = (sold.length ? sold : comps).map((c) => c.price / c.sqft);
  const medianPpsf = ppsfAll.length ? median(ppsfAll) : null;
  // Extra square feet are usually worth less than the average $/sqft; default to half.
  const usedSqftRate = settings.sqftRate ?? (medianPpsf ? Math.round(medianPpsf * 0.5) : 0);

  const results: CompResult[] = comps.map((comp) => {
    const adjustments: { label: string; amount: number }[] = [];
    const add = (label: string, amount: number) => {
      if (Math.round(amount) !== 0) adjustments.push({ label, amount: Math.round(amount) });
    };
    add("size", (subject.sqft - comp.sqft) * usedSqftRate);
    add("bedrooms", (subject.beds - comp.beds) * settings.perBedroom);
    add("bathrooms", (subject.baths - comp.baths) * settings.perBathroom);
    add("garage", (subject.garageSpaces - comp.garageSpaces) * settings.perGarageSpace);
    if (subject.pool !== comp.pool) add("pool", subject.pool ? settings.pool : -settings.pool);
    add("condition", (subject.condition - comp.condition) * (settings.conditionPct / 100) * comp.price);
    const net = adjustments.reduce((sum, a) => sum + a.amount, 0);
    const gross = adjustments.reduce((sum, a) => sum + Math.abs(a.amount), 0);
    const grossPct = (gross / comp.price) * 100;
    return {
      comp,
      pricePerSqft: Math.round(comp.price / comp.sqft),
      adjustments,
      netAdjustment: net,
      grossAdjustmentPct: Math.round(grossPct * 10) / 10,
      adjustedPrice: Math.round(comp.price + net),
      weak: grossPct > 25,
    };
  });

  const soldAdjusted = results.filter((r) => r.comp.status === "sold").map((r) => r.adjustedPrice);
  if (soldAdjusted.length < 3) warnings.push("fewer_than_three_sold");
  if (results.some((r) => r.weak)) warnings.push("weak_comps");

  const range = soldAdjusted.length
    ? { low: Math.min(...soldAdjusted), median: Math.round(median(soldAdjusted)), high: Math.max(...soldAdjusted) }
    : null;
  const suggestedListRange = soldAdjusted.length
    ? soldAdjusted.length >= 3
      ? { low: roundTo(percentile(soldAdjusted, 0.25), 5000), high: roundTo(percentile(soldAdjusted, 0.75), 5000) }
      : { low: roundTo(Math.min(...soldAdjusted), 5000), high: roundTo(Math.max(...soldAdjusted), 5000) }
    : null;

  return {
    usedSqftRate,
    comps: results,
    soldCount: soldAdjusted.length,
    range,
    suggestedListRange,
    medianPricePerSqft: medianPpsf ? Math.round(medianPpsf) : null,
    warnings,
  };
}

/** Plain-text summary of the analysis for the narrative prompt. */
export function describeCma(subject: Subject, result: CmaResult): string {
  const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
  const lines = [
    `SUBJECT: ${subject.address} — ${subject.beds} bd / ${subject.baths} ba, ${subject.sqft} sq ft${
      subject.yearBuilt ? `, built ${subject.yearBuilt}` : ""
    }, garage ${subject.garageSpaces}, pool ${subject.pool ? "yes" : "no"}, condition ${subject.condition}/5`,
    `Size adjustment rate used: ${usd(result.usedSqftRate)} per sq ft. Median comp price per sq ft: ${
      result.medianPricePerSqft ? usd(result.medianPricePerSqft) : "n/a"
    }.`,
    "",
    "COMPS:",
    ...result.comps.map((r, i) => {
      const c = r.comp;
      const adj = r.adjustments.map((a) => `${a.label} ${a.amount >= 0 ? "+" : ""}${usd(a.amount)}`).join(", ") || "none";
      return `${i + 1}. ${c.address} (${c.status}${c.date ? `, ${c.date}` : ""}${
        c.distanceMiles !== undefined ? `, ${c.distanceMiles} mi away` : ""
      }) — ${usd(c.price)}, ${c.beds} bd / ${c.baths} ba, ${c.sqft} sq ft, ${usd(r.pricePerSqft)}/sq ft, condition ${
        c.condition
      }/5. Adjustments: ${adj}. Adjusted: ${usd(r.adjustedPrice)} (gross adjustments ${r.grossAdjustmentPct}%${
        r.weak ? " — weak comp" : ""
      }).${c.notes ? ` Agent notes: ${c.notes}` : ""}`;
    }),
    "",
    result.range
      ? `ADJUSTED SOLD-COMP RANGE: ${usd(result.range.low)} – ${usd(result.range.high)} (median ${usd(result.range.median)}).`
      : "No sold comps provided.",
    result.suggestedListRange
      ? `SUGGESTED LIST-PRICE RANGE FOR DISCUSSION: ${usd(result.suggestedListRange.low)} – ${usd(result.suggestedListRange.high)}.`
      : "",
    result.warnings.includes("fewer_than_three_sold") ? "WARNING: fewer than three sold comps." : "",
    result.warnings.includes("weak_comps") ? "WARNING: at least one comp needed adjustments over 25% of its price." : "",
  ];
  return lines.filter((l) => l !== "").join("\n");
}
