import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/server/logger/logger";

export interface AuditInput {
  tenantId: string;
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
}

export async function recordAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({ data: { ...input, actorId: input.actorId ?? null, metadata: input.metadata ?? undefined } });
  } catch (error) {
    logger.error("Audit kaydı oluşturulamadı", { error: error instanceof Error ? error.message : String(error), ...input });
  }
}
