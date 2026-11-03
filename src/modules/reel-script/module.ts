import { z } from "zod";
import { phoneFor } from "@/modules/_shared/phones";
import { agentBlock, brandVoice, propertyFacts } from "@/modules/_shared/variables";
import { defineModule } from "@/modules/types";

const DURATIONS = ["15", "30", "60"] as const;
const STYLES = ["tour", "top_features", "reveal", "detail_montage"] as const;

const STYLE_TEXT: Record<(typeof STYLES)[number], string> = {
  tour: "Smooth walkthrough tour — arrive at the front door, move through the home in order, end outside.",
  top_features: "Top features countdown — the 3-5 best true features, one per scene, with numbered overlays.",
  reveal: "Just-listed reveal — tease details first, then reveal the full exterior and best room.",
  detail_montage: "Detail montage — close-ups of materials and finishes, quick cuts on the beat, ending on a wide shot.",
};

export default defineModule({
  id: "reel-script",
  icon: "🎬",
  feature: "MARKETING",
  order: 30,
  requires: "property",
  promptId: "reel-script",
  options: [
    {
      type: "select",
      name: "duration",
      labelKey: "modules.reel-script.duration",
      default: "30",
      options: DURATIONS.map((d) => ({ value: d, labelKey: `modules.reel-script.seconds${d}` })),
    },
    {
      type: "select",
      name: "style",
      labelKey: "modules.reel-script.style",
      default: "tour",
      options: STYLES.map((s) => ({ value: s, labelKey: `modules.reel-script.styles.${s}` })),
    },
    { type: "checkbox", name: "onCamera", labelKey: "modules.reel-script.onCamera", default: false },
  ],
  inputSchema: z.object({
    duration: z.enum(DURATIONS).default("30"),
    style: z.enum(STYLES).default("tour"),
    onCamera: z.boolean().default(false),
  }),
  buildVariables: (ctx, input) => ({
    property_facts: propertyFacts(ctx.property),
    agent: agentBlock(ctx.profile),
    brand_voice: brandVoice(ctx.profile),
    duration: input.duration,
    style: STYLE_TEXT[input.style],
    on_camera: input.onCamera,
    not_on_camera: !input.onCamera,
    phone: phoneFor(ctx.property?.phoneModel, ctx.profile?.phoneModel),
  }),
});
