import type { Generation } from "@prisma/client";

export type BatchSummary = {
  batchId: string;
  moduleId: string;
  languages: string[];
  createdAt: Date;
  status: Generation["status"];
};

/** Collapses per-language generation rows into one entry per batch, newest first. */
export function summarizeBatches(rows: Pick<Generation, "batchId" | "id" | "moduleId" | "language" | "createdAt" | "status">[]): BatchSummary[] {
  const map = new Map<string, BatchSummary>();
  for (const row of rows) {
    const key = row.batchId ?? row.id;
    const existing = map.get(key);
    if (existing) {
      existing.languages.push(row.language);
      if (row.status !== "SUCCESS") existing.status = row.status;
    } else {
      map.set(key, { batchId: key, moduleId: row.moduleId, languages: [row.language], createdAt: row.createdAt, status: row.status });
    }
  }
  return [...map.values()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
