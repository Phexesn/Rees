import { z } from "zod";
import { agentBlock, brandVoice, propertyFacts } from "@/modules/_shared/variables";
import { defineModule } from "@/modules/types";

const TYPES = ["just_listed", "open_house", "price_improvement", "just_sold"] as const;
const AUDIENCES = ["sphere", "buyers", "agents"] as const;

const TYPE_TEXT: Record<(typeof TYPES)[number], string> = {
  just_listed: "Just listed",
  open_house: "Open house invitation",
  price_improvement: "Price improvement",
  just_sold: "Just sold",
};

const AUDIENCE_TEXT: Record<(typeof AUDIENCES)[number], string> = {
  sphere: "the agent's sphere of influence and past clients (friends, neighbors, former clients) — warm, personal, ask for referrals",
  buyers: "active buyer leads who asked to hear about homes like this — helpful, specific, invite them to tour",
  agents: "other local real estate agents (cooperating agents) — concise, facts first, invite them to show it to their buyers",
};

export default defineModule({
  id: "email-blast",
  icon: "✉️",
  feature: "MARKETING",
  order: 40,
  requires: "property",
  promptId: "email-blast",
  options: [
    {
      type: "select",
      name: "emailType",
      labelKey: "modules.email-blast.emailType",
      default: "just_listed",
      options: TYPES.map((v) => ({ value: v, labelKey: `modules.email-blast.types.${v}` })),
    },
    {
      type: "select",
      name: "audience",
      labelKey: "modules.email-blast.audience",
      default: "sphere",
      options: AUDIENCES.map((v) => ({ value: v, labelKey: `modules.email-blast.audiences.${v}` })),
    },
  ],
  inputSchema: z.object({
    emailType: z.enum(TYPES).default("just_listed"),
    audience: z.enum(AUDIENCES).default("sphere"),
  }),
  buildVariables: (ctx, input) => ({
    property_facts: propertyFacts(ctx.property),
    agent: agentBlock(ctx.profile),
    brand_voice: brandVoice(ctx.profile),
    email_type: TYPE_TEXT[input.emailType],
    audience: AUDIENCE_TEXT[input.audience],
    // Merge tag passed through literally into the email body.
    first_name: "{{first_name}}",
  }),
});
