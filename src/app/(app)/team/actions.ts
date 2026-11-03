"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { formObject, type ActionState } from "@/lib/actions";
import { audit } from "@/lib/audit";
import { hashPassword } from "@/lib/auth/password";
import { requireSetupContext } from "@/lib/auth/context";
import { systemDb, withTenantTx } from "@/lib/db";
import { effectivePlan, PLANS } from "@/lib/features";

const MemberSchema = z.object({ name: z.string().min(1).max(100), email: z.email().max(200) });

export async function addTeammateAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await requireSetupContext();
  if (!ctx.can("TEAM_DASHBOARD")) return { error: "locked.generic" };
  if (ctx.user.role === "AGENT") return { error: "billing.errors.owner" };
  const parsed = MemberSchema.safeParse(formObject(formData));
  if (!parsed.success) return { error: "errors.fixFields" };
  const plan = effectivePlan(ctx.tenant);
  const seats = plan ? PLANS[plan].seats : 1;
  const count = await ctx.db.user.count();
  if (count >= seats) return { error: "team.seatsFull" };
  const email = parsed.data.email.toLowerCase();
  // systemDb: emails are unique across all accounts.
  if (await systemDb().user.findUnique({ where: { email } })) return { error: "auth.errors.emailTaken" };

  const tempPassword = randomBytes(6).toString("base64url");
  const passwordHash = await hashPassword(tempPassword);
  const userId = await withTenantTx(ctx.tenant.id, async (tx) => {
    const user = await tx.user.create({
      data: { tenantId: ctx.tenant.id, email, name: parsed.data.name, passwordHash, role: "AGENT", locale: ctx.user.locale },
    });
    await tx.agentProfile.create({
      data: {
        tenantId: ctx.tenant.id,
        userId: user.id,
        displayName: parsed.data.name,
        email,
        brokerage: ctx.profile?.brokerage ?? null,
        contentLanguage: ctx.profile?.contentLanguage ?? "en",
      },
    });
    return user.id;
  });
  await audit({ tenantId: ctx.tenant.id, userId: ctx.user.id, action: "team:add_member", entity: "user", entityId: userId });
  revalidatePath("/team");
  return { ok: true, message: tempPassword };
}
