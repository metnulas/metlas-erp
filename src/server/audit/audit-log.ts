import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/server/logger/logger";

export interface AuditInput {
  tenantId: string | null;
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
  actorRole?: string;
  ipAddress?: string;
  userAgent?: string;
  browser?: string;
  operatingSystem?: string;
  url?: string;
  httpMethod?: string;
  oldData?: Prisma.InputJsonValue;
  newData?: Prisma.InputJsonValue;
}

export async function recordAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({ data: { ...input, actorId: input.actorId ?? null, metadata: input.metadata ?? undefined, oldData: input.oldData ?? undefined, newData: input.newData ?? undefined } });
  } catch (error) {
    logger.error("Audit kaydı oluşturulamadı", { error: error instanceof Error ? error.message : String(error), ...input });
  }
}
