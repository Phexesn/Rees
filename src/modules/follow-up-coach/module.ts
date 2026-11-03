import { z } from "zod";
import { agentBlock, brandVoice, contactBlock, propertyFacts, todayLong } from "@/modules/_shared/variables";
import { defineModule } from "@/modules/types";

export const SITUATIONS = [
  "portal_inquiry",
  "listing_page",
  "open_house",
  "sign_call",
  "referral",
  "past_client",
  "gone_quiet",
] as const;
export const GOALS = ["showing", "consultation", "preapproval", "listing_appointment", "stay_in_touch"] as const;
const EXPERIENCE = ["new", "experienced"] as const;

const SITUATION_TEXT: Record<(typeof SITUATIONS)[number], string> = {
  portal_inquiry: "They sent an inquiry from Zillow, Realtor.com or another home-search website.",
  listing_page: "They filled out the form on my listing's page.",
  open_house: "They visited my open house and signed in.",
  sign_call: "They called or texted from my yard sign.",
  referral: "Someone I know referred them to me.",
  past_client: "A past client I helped before — checking in.",
  gone_quiet: "A lead who stopped replying a few weeks ago — I want to re-engage politely.",
};

const GOAL_TEXT: Record<(typeof GOALS)[number], string> = {
  showing: "Book a showing of the home.",
  consultation: "Book a buyer consultation (meeting) to understand their needs.",
  preapproval: "Help them get pre-approved by connecting them with a lender.",
  listing_appointment: "Book a listing appointment to discuss selling their home.",
  stay_in_touch: "Stay in touch helpfully until they are ready.",
};

const EXPERIENCE_TEXT: Record<(typeof EXPERIENCE)[number], string> = {
  new: "I am a NEW agent (under 1 year). Explain why each step works, keep it simple, and include confidence tips.",
  experienced: "I am an experienced agent. Be concise — just the script and the sharp points.",
};

export default defineModule({
  id: "follow-up-coach",
  icon: "🧭",
  feature: "FOLLOW_UP_COACH",
  order: 5,
  requires: "property-optional",
  usesContact: true,
  promptId: "follow-up-coach",
  options: [
    {
      type: "select",
      name: "situation",
      labelKey: "modules.follow-up-coach.situation",
      default: "portal_inquiry",
      options: SITUATIONS.map((v) => ({ value: v, labelKey: `modules.follow-up-coach.situations.${v}` })),
    },
    {
      type: "select",
      name: "goal",
      labelKey: "modules.follow-up-coach.goal",
      default: "showing",
      options: GOALS.map((v) => ({ value: v, labelKey: `modules.follow-up-coach.goals.${v}` })),
    },
    {
      type: "text",
      name: "leadName",
      labelKey: "modules.follow-up-coach.leadName",
      hintKey: "modules.follow-up-coach.leadNameHint",
      default: "",
    },
    {
      type: "text",
      name: "whatTheySaid",
      labelKey: "modules.follow-up-coach.whatTheySaid",
      placeholderKey: "modules.follow-up-coach.whatTheySaidPlaceholder",
      default: "",
      multiline: true,
    },
    {
      type: "select",
      name: "experience",
      labelKey: "modules.follow-up-coach.experience",
      default: "new",
      options: EXPERIENCE.map((v) => ({ value: v, labelKey: `modules.follow-up-coach.experiences.${v}` })),
    },
  ],
  inputSchema: z.object({
    situation: z.enum(SITUATIONS).default("portal_inquiry"),
    goal: z.enum(GOALS).default("showing"),
    leadName: z.string().max(80).default(""),
    whatTheySaid: z.string().max(1500).default(""),
    experience: z.enum(EXPERIENCE).default("new"),
  }),
  buildVariables: (ctx, input) => ({
    situation: SITUATION_TEXT[input.situation],
    goal: GOAL_TEXT[input.goal],
    experience: EXPERIENCE_TEXT[input.experience],
    lead: ctx.contact
      ? contactBlock(ctx.contact)
      : input.leadName
        ? `- First name: ${input.leadName}`
        : "- First name: [their name]",
    what_they_said: input.whatTheySaid,
    property_facts: propertyFacts(ctx.property),
    agent: agentBlock(ctx.profile),
    brand_voice: brandVoice(ctx.profile),
    today: todayLong(),
  }),
});
