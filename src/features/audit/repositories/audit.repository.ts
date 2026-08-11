import { Prisma, type AuditLog } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export interface AuditRepository {
  findMany(tenantId: string, query: Prisma.AuditLogWhereInput, skip: number, take: number): Promise<AuditLog[]>;
  count(tenantId: string, query: Prisma.AuditLogWhereInput): Promise<number>;
  findManyGlobal?(query: Prisma.AuditLogWhereInput, skip: number, take: number): Promise<AuditLog[]>;
  countGlobal?(query: Prisma.AuditLogWhereInput): Promise<number>;
}

export function createAuditRepository(): AuditRepository {
  return {
    findMany(tenantId, query, skip, take) { return prisma.auditLog.findMany({ where: { ...query, tenantId }, orderBy: { createdAt: "desc" }, skip, take }); },
    count(tenantId, query) { return prisma.auditLog.count({ where: { ...query, tenantId } }); },
    findManyGlobal(query, skip, take) { return prisma.auditLog.findMany({ where: query, include: { actor: { select: { id: true, name: true, email: true, role: true } }, tenant: { select: { id: true, name: true, slug: true } } }, orderBy: { createdAt: "desc" }, skip, take }); },
    countGlobal(query) { return prisma.auditLog.count({ where: query }); },
  };
}
