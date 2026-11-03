import { z } from "zod";
import { agentBlock } from "@/modules/_shared/variables";
import { defineModule } from "@/modules/types";

export default defineModule({
  id: "cma-narrative",
  icon: "📊",
  feature: "CMA",
  order: 910,
  requires: "property-optional",
  hidden: true,
  promptId: "cma-narrative",
  options: [],
  inputSchema: z.object({
    analysis: z.string().min(1).max(20000),
    audience: z.enum(["seller", "buyer"]).default("seller"),
  }),
  buildVariables: (ctx, input) => ({
    analysis: input.analysis,
    agent: agentBlock(ctx.profile),
    audience: input.audience === "buyer" ? "a home buyer deciding what to offer" : "a homeowner thinking about selling",
  }),
});
