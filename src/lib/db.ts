import "server-only";
import { Prisma, PrismaClient } from "@prisma/client";

/**
 * Database access.
 *
 * NEVER import `basePrisma` in feature code. Use:
 *   - tenantDb(tenantId)  → every query is scoped to one tenant. Postgres RLS
 *                           enforces it even if a `where` is forgotten.
 *   - systemDb()          → cross-tenant access for login, Stripe webhooks,
 *                           public microsites and the platform admin page.
 *   - withTenantTx()      → multi-statement atomic work inside one tenant.
 *
 * Convention: always write scalar foreign keys (`contactId: x`), never nested
 * `connect`/`create` writes, and always pass `tenantId` on create. The
 * extension overwrites `tenantId` with the session's tenant so a caller can
 * never write into another tenant.
 */

const globalForPrisma = globalThis as unknown as { basePrisma?: PrismaClient };

const basePrisma =
  globalForPrisma.basePrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.basePrisma = basePrisma;

/** Models that do not carry a tenantId column. */
const UNSCOPED_MODELS = new Set(["Tenant", "StripeEvent"]);

const WHERE_OPS = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "update",
  "updateMany",
  "updateManyAndReturn",
  "upsert",
  "delete",
  "deleteMany",
  "aggregate",
  "groupBy",
  "count",
]);

type AnyArgs = Record<string, unknown> & {
  where?: Record<string, unknown>;
  data?: unknown;
  create?: Record<string, unknown>;
};

function scopeArgs(model: string, operation: string, args: AnyArgs, tenantId: string): AnyArgs {
  if (UNSCOPED_MODELS.has(model)) return args;
  const next: AnyArgs = { ...args };
  if (WHERE_OPS.has(operation)) {
    next.where = { ...(args.where ?? {}), tenantId };
  }
  if (operation === "create") {
    next.data = { ...(args.data as Record<string, unknown>), tenantId };
  }
  if (operation === "createMany" || operation === "createManyAndReturn") {
    const rows = Array.isArray(args.data) ? args.data : [args.data];
    next.data = rows.map((row) => ({ ...(row as Record<string, unknown>), tenantId }));
  }
  if (operation === "upsert") {
    next.create = { ...(args.create ?? {}), tenantId };
  }
  return next;
}

function setTenant(tenantId: string) {
  return basePrisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, TRUE)`;
}

function setBypass() {
  return basePrisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
}

export function tenantDb(tenantId: string) {
  if (!tenantId) throw new Error("tenantDb() requires a tenantId");
  return basePrisma.$extends({
    name: "tenant-scope",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const scoped = scopeArgs(model, operation, (args ?? {}) as AnyArgs, tenantId);
          const [, result] = await basePrisma.$transaction([
            setTenant(tenantId),
            query(scoped as typeof args),
          ]);
          return result;
        },
      },
    },
  });
}

export type TenantDb = ReturnType<typeof tenantDb>;

const systemClient = basePrisma.$extends({
  name: "system-bypass",
  query: {
    $allModels: {
      async $allOperations({ args, query }) {
        const [, result] = await basePrisma.$transaction([setBypass(), query(args)]);
        return result;
      },
    },
  },
});

/** Cross-tenant access. Every call site must justify why it is not tenant-scoped. */
export function systemDb() {
  return systemClient;
}

/** Atomic multi-statement work inside one tenant (RLS still enforced). */
export async function withTenantTx<T>(
  tenantId: string,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return basePrisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, TRUE)`;
    return fn(tx);
  });
}

/** Atomic multi-statement work across tenants (webhooks, signup). */
export async function withSystemTx<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  return basePrisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
    return fn(tx);
  });
}
