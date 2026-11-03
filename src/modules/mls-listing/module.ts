import { z } from "zod";
import { agentBlock, brandVoice, propertyFacts, todayLong } from "@/modules/_shared/variables";
import { defineModule } from "@/modules/types";

export const LONG_LIMITS = ["500", "1000", "1500", "2000", "4000"] as const;

export default defineModule({
  id: "mls-listing",
  icon: "🏡",
  feature: "MARKETING",
  order: 10,
  requires: "property",
  promptId: "mls-listing",
  options: [
    {
      type: "select",
      name: "longLimit",
      labelKey: "modules.mls-listing.longLimit",
      hintKey: "modules.mls-listing.longLimitHint",
      default: "1000",
      options: LONG_LIMITS.map((v) => ({ value: v, labelKey: `modules.mls-listing.chars${v}` })),
    },
    {
      type: "text",
      name: "emphasis",
      labelKey: "modules.mls-listing.emphasis",
      placeholderKey: "modules.mls-listing.emphasisPlaceholder",
      default: "",
    },
  ],
  inputSchema: z.object({
    longLimit: z.enum(LONG_LIMITS).default("1000"),
    emphasis: z.string().max(300).default(""),
  }),
  buildVariables: (ctx, input) => ({
    property_facts: propertyFacts(ctx.property),
    agent: agentBlock(ctx.profile),
    brand_voice: brandVoice(ctx.profile),
    long_limit: input.longLimit,
    short_limit: Math.min(250, Number(input.longLimit) / 2),
    emphasis: input.emphasis,
    today: todayLong(),
  }),
});
