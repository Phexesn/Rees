import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { AgentProfile, Tenant } from "@prisma/client";
import { tenantDb, type TenantDb } from "@/lib/db";
import { readSession } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { contentLanguageLimit, hasFeature, type Feature } from "@/lib/features";
import { allowedContentLanguages } from "@/lib/languages";

export type AppUser = {
  id: string;
  email: string;
  name: string;
  role: "OWNER" | "ADMIN" | "AGENT";
  locale: string;
  isPlatformAdmin: boolean;
};

export type AppContext = {
  user: AppUser;
  tenant: Tenant;
  profile: AgentProfile | null;
  db: TenantDb;
  can: (feature: Feature) => boolean;
  /** Content languages this agent may generate in (plan-limited). */
  contentLanguages: string[];
};

/** Per-request cached context for the signed-in user, or null. */
export const getContext = cache(async (): Promise<AppContext | null> => {
  const session = await readSession();
  if (!session) return null;
  const db = tenantDb(session.tenantId);
  const [user, tenant, profile] = await Promise.all([
    db.user.findUnique({ where: { id: session.userId } }),
    db.tenant.findUnique({ where: { id: session.tenantId } }),
    db.agentProfile.findUnique({ where: { userId: session.userId } }),
  ]);
  if (!user || !tenant) return null;
  const isPlatformAdmin = user.isPlatformAdmin || env.adminEmails().includes(user.email.toLowerCase());
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      locale: user.locale,
      isPlatformAdmin,
    },
    tenant,
    profile,
    db,
    can: (feature) => hasFeature(tenant, feature),
    contentLanguages: allowedContentLanguages(
      profile?.contentLanguage ?? "en",
      profile?.extraLanguages ?? [],
      contentLanguageLimit(tenant),
    ),
  };
});

/** For pages and actions that need a signed-in user. Redirects to /login otherwise. */
export async function requireContext(): Promise<AppContext> {
  const ctx = await getContext();
  if (!ctx) redirect("/login");
  return ctx;
}

/** Like requireContext, but also sends unfinished accounts to the setup wizard. */
export async function requireSetupContext(): Promise<AppContext> {
  const ctx = await requireContext();
  if (!ctx.profile?.setupCompletedAt) redirect("/setup");
  return ctx;
}
