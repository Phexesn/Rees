import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { systemDb } from "@/lib/db";

export const SESSION_COOKIE = "rb_session";
const SESSION_DAYS = 30;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string, tenantId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  // systemDb: the session row is written before a tenant context exists.
  await systemDb().session.create({
    data: { tokenHash: hashToken(token), userId, tenantId, expiresAt },
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd(),
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Resolves the session cookie to user + tenant ids, or null. */
export async function readSession(): Promise<{ userId: string; tenantId: string } | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  // systemDb: we cannot know the tenant until the session is found.
  const session = await systemDb().session.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!session || session.expiresAt < new Date()) return null;
  return { userId: session.userId, tenantId: session.tenantId };
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await systemDb().session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  jar.delete(SESSION_COOKIE);
}
