import "server-only";
import type { Prisma } from "@prisma/client";
import { tenantDb } from "@/lib/db";
import { log } from "@/lib/log";

export type AuditEntry = {
  tenantId: string;
  userId?: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  model?: string | null;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
  latencyMs?: number;
  metadata?: Prisma.InputJsonValue;
};

/**
 * Records every AI generation and every CRM mutation (brief: observability).
 * Failures to write the audit row are logged, never thrown — auditing must not
 * break the user's action.
 */
export async function audit(entry: AuditEntry): Promise<void> {
  log("info", "audit", { ...entry, metadata: undefined });
  try {
    await tenantDb(entry.tenantId).auditLog.create({
      data: {
        tenantId: entry.tenantId,
        userId: entry.userId ?? null,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        model: entry.model ?? null,
        inputTokens: entry.inputTokens,
        outputTokens: entry.outputTokens,
        costUsd: entry.costUsd,
        latencyMs: entry.latencyMs,
        metadata: entry.metadata,
      },
    });
  } catch (error) {
    log("error", "audit_write_failed", { action: entry.action, error: String(error) });
  }
}
