import { Prisma, type AuditLog } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export interface AuditRepository {
  findMany(tenantId: string, query: Prisma.AuditLogWhereInput, skip: number, take: number): Promise<AuditLog[]>;
  count(tenantId: string, query: Prisma.AuditLogWhereInput): Promise<number>;
}

export function createAuditRepository(): AuditRepository {
  return {
    findMany(tenantId, query, skip, take) { return prisma.auditLog.findMany({ where: { ...query, tenantId }, orderBy: { createdAt: "desc" }, skip, take }); },
    count(tenantId, query) { return prisma.auditLog.count({ where: { ...query, tenantId } }); },
  };
}
