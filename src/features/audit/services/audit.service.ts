import { Prisma, type AuditLog } from "@prisma/client";
import { createAuditRepository, type AuditRepository } from "../repositories/audit.repository";
import type { AuditQueryInput } from "../validators/audit.schema";

export interface PaginatedAuditLogs { data: AuditLog[]; total: number; page: number; pageSize: number; totalPages: number; }

export interface AuditService { list(tenantId: string, query: AuditQueryInput): Promise<PaginatedAuditLogs>; }

export function createAuditService(repository: AuditRepository = createAuditRepository()): AuditService {
  return {
    async list(tenantId, { page, pageSize, action, entityType }) {
      const where: Prisma.AuditLogWhereInput = {};
      if (action) where.action = action;
      if (entityType) where.entityType = entityType;
      const [data, total] = await Promise.all([repository.findMany(tenantId, where, (page - 1) * pageSize, pageSize), repository.count(tenantId, where)]);
      return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    },
  };
}
