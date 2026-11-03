"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { fieldErrorsFrom, formObject, type ActionState } from "@/lib/actions";
import { audit } from "@/lib/audit";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { getContext } from "@/lib/auth/context";
import { systemDb, withSystemTx } from "@/lib/db";
import { TRIAL_DAYS } from "@/lib/features";
import { isUiLocale } from "@/lib/languages";
import { LOCALE_COOKIE } from "@/i18n/request";

const SignupSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email().max(200),
  password: z.string().min(8).max(200),
  locale: z.string().optional(),
});

export async function signupAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = SignupSchema.safeParse(formObject(formData));
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };
  const { name, password } = parsed.data;
  const email = parsed.data.email.toLowerCase();
  const locale = isUiLocale(parsed.data.locale) ? parsed.data.locale : "en";

  // systemDb: email uniqueness is global, checked before any tenant exists.
  const existing = await systemDb().user.findUnique({ where: { email } });
  if (existing) return { fieldErrors: { email: "auth.errors.emailTaken" } };

  const passwordHash = await hashPassword(password);
  const { tenantId, userId } = await withSystemTx(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: `${name}'s business`,
        plan: "PRO",
        subscriptionStatus: "TRIALING",
        trialEndsAt: new Date(Date.now() + TRIAL_DAYS * 86_400_000),
        defaultLocale: locale,
      },
    });
    const user = await tx.user.create({
      data: { tenantId: tenant.id, email, passwordHash, name, role: "OWNER", locale },
    });
    await tx.agentProfile.create({
      data: { tenantId: tenant.id, userId: user.id, displayName: name, email, contentLanguage: locale },
    });
    return { tenantId: tenant.id, userId: user.id };
  });

  await createSession(userId, tenantId);
  await audit({ tenantId, userId, action: "auth:signup", entity: "user", entityId: userId });
  (await cookies()).set(LOCALE_COOKIE, locale, { path: "/", maxAge: 31_536_000, sameSite: "lax" });
  redirect("/setup");
}

const LoginSchema = z.object({ email: z.string().min(1), password: z.string().min(1) });

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = LoginSchema.safeParse(formObject(formData));
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };
  const email = parsed.data.email.toLowerCase();
  // systemDb: we don't know the tenant until we find the user.
  const user = await systemDb().user.findUnique({ where: { email } });
  const ok = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;
  if (!user || !ok) return { error: "auth.errors.wrongLogin" };

  await createSession(user.id, user.tenantId);
  await audit({ tenantId: user.tenantId, userId: user.id, action: "auth:login", entity: "user", entityId: user.id });
  if (isUiLocale(user.locale)) {
    (await cookies()).set(LOCALE_COOKIE, user.locale, { path: "/", maxAge: 31_536_000, sameSite: "lax" });
  }
  const next = formData.get("next");
  redirect(typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

export async function setLocaleAction(formData: FormData): Promise<void> {
  const locale = formData.get("locale");
  if (typeof locale !== "string" || !isUiLocale(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, { path: "/", maxAge: 31_536_000, sameSite: "lax" });
  const ctx = await getContext();
  if (ctx) {
    await ctx.db.user.update({ where: { id: ctx.user.id }, data: { locale } });
  }
  const back = formData.get("back");
  redirect(typeof back === "string" && back.startsWith("/") && !back.startsWith("//") ? back : "/");
}
