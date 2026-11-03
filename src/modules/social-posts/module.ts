import { z } from "zod";
import { agentBlock, brandVoice, propertyFacts, todayLong } from "@/modules/_shared/variables";
import { defineModule } from "@/modules/types";

export const OCCASIONS = ["just_listed", "open_house", "coming_soon", "price_improvement", "under_contract", "just_sold"] as const;

const OCCASION_TEXT: Record<(typeof OCCASIONS)[number], string> = {
  just_listed: "JUST LISTED — the home just hit the market",
  open_house: "OPEN HOUSE — invite people to the open house (use the date/time from the facts; if none is given, say 'this weekend' only if the agent provided it, otherwise invite people to message for details)",
  coming_soon: "COMING SOON — build anticipation before the home hits the market",
  price_improvement: "PRICE IMPROVEMENT — the price was reduced; present it positively and factually",
  under_contract: "UNDER CONTRACT / PENDING — celebrate and invite other buyers and sellers to reach out",
  just_sold: "JUST SOLD — celebrate the sale (use the sold price only if provided) and invite future sellers to reach out",
};

export default defineModule({
  id: "social-posts",
  icon: "📣",
  feature: "MARKETING",
  order: 20,
  requires: "property",
  promptId: "social-posts",
  options: [
    {
      type: "select",
      name: "occasion",
      labelKey: "modules.social-posts.occasion",
      default: "just_listed",
      options: OCCASIONS.map((o) => ({ value: o, labelKey: `modules.social-posts.occasions.${o}` })),
    },
    { type: "checkbox", name: "useEmoji", labelKey: "modules.social-posts.useEmoji", default: true },
  ],
  inputSchema: z.object({
    occasion: z.enum(OCCASIONS).default("just_listed"),
    useEmoji: z.boolean().default(true),
  }),
  buildVariables: (ctx, input) => ({
    property_facts: propertyFacts(ctx.property),
    agent: agentBlock(ctx.profile),
    brand_voice: brandVoice(ctx.profile),
    occasion: OCCASION_TEXT[input.occasion],
    use_emoji: input.useEmoji,
    no_emoji: !input.useEmoji,
    today: todayLong(),
  }),
});
