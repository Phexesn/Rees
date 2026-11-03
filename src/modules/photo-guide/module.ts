import { z } from "zod";
import { readPromptAsset } from "@/lib/prompts/store";
import { PHONE_MODELS, phoneFor } from "@/modules/_shared/phones";
import { propertyFacts, todayLong } from "@/modules/_shared/variables";
import { defineModule } from "@/modules/types";

const TIME = ["quick", "afternoon", "weekend"] as const;
const STYLES = ["bright_airy", "warm_cozy", "modern_crisp", "luxury"] as const;
const DETAIL = ["quick", "pro"] as const;

const TIME_TEXT: Record<(typeof TIME)[number], string> = {
  quick: "About 20 minutes — the essential 12-15 shots only.",
  afternoon: "About 1-2 hours — a complete set of 25-35 photos.",
  weekend: "A weekend — premium plan: best light for every side of the house, a twilight exterior, detail shots and a walkthrough.",
};

const STYLE_TEXT: Record<(typeof STYLES)[number], string> = {
  bright_airy: "Bright and airy — lots of natural light, clean whites",
  warm_cozy: "Warm and cozy — lamps on, warm tones, inviting",
  modern_crisp: "Modern and crisp — clean lines, neutral color, high clarity",
  luxury: "Luxury — dramatic light, details of finishes, twilight exterior",
};

const DETAIL_TEXT: Record<(typeof DETAIL)[number], string> = {
  quick: "QUICK MODE — a one-page cheat sheet. Keep every list short (3-5 items), one line per item.",
  pro: "PRO MODE — detailed. Full explanations, every room, complete settings.",
};

export default defineModule({
  id: "photo-guide",
  icon: "📷",
  feature: "PHOTO_GUIDE",
  order: 50,
  requires: "property",
  promptId: "photo-guide",
  options: [
    {
      type: "select",
      name: "phone",
      labelKey: "modules.photo-guide.phone",
      hintKey: "modules.photo-guide.phoneHint",
      default: "default",
      options: [
        { value: "default", labelKey: "modules.photo-guide.phoneDefault" },
        ...PHONE_MODELS.map((p) => ({ value: p, labelKey: `raw:${p}` })),
      ],
    },
    {
      type: "select",
      name: "time",
      labelKey: "modules.photo-guide.time",
      default: "afternoon",
      options: TIME.map((v) => ({ value: v, labelKey: `modules.photo-guide.times.${v}` })),
    },
    {
      type: "select",
      name: "style",
      labelKey: "modules.photo-guide.style",
      default: "bright_airy",
      options: STYLES.map((v) => ({ value: v, labelKey: `modules.photo-guide.styles.${v}` })),
    },
    {
      type: "select",
      name: "detail",
      labelKey: "modules.photo-guide.detail",
      default: "pro",
      options: DETAIL.map((v) => ({ value: v, labelKey: `modules.photo-guide.details.${v}` })),
    },
    { type: "checkbox", name: "includeVideo", labelKey: "modules.photo-guide.includeVideo", default: true },
  ],
  inputSchema: z.object({
    phone: z.enum(["default", ...PHONE_MODELS]).default("default"),
    time: z.enum(TIME).default("afternoon"),
    style: z.enum(STYLES).default("bright_airy"),
    detail: z.enum(DETAIL).default("pro"),
    includeVideo: z.boolean().default(true),
  }),
  buildVariables: async (ctx, input) => ({
    property_facts: propertyFacts(ctx.property),
    phone: phoneFor(ctx.property?.phoneModel, ctx.profile?.phoneModel, input.phone),
    time_budget: TIME_TEXT[input.time],
    style: STYLE_TEXT[input.style],
    detail: DETAIL_TEXT[input.detail],
    include_video: input.includeVideo,
    no_video: !input.includeVideo,
    reference: await readPromptAsset("photo-guide/reference.md"),
    today: todayLong(),
  }),
});
