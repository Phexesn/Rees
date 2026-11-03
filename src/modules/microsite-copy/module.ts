import { z } from "zod";
import { brandVoice, propertyFacts } from "@/modules/_shared/variables";
import { defineModule } from "@/modules/types";

export default defineModule({
  id: "microsite-copy",
  icon: "🌐",
  feature: "MICROSITES",
  order: 900,
  requires: "property",
  hidden: true,
  promptId: "microsite-copy",
  options: [],
  inputSchema: z.object({}),
  buildVariables: (ctx) => ({
    property_facts: propertyFacts(ctx.property),
    brand_voice: brandVoice(ctx.profile),
  }),
});
