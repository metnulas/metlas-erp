import { z } from "zod";

export const auditQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  action: z.string().trim().max(50).optional(),
  entityType: z.string().trim().max(50).optional(),
});

export type AuditQueryInput = z.output<typeof auditQuerySchema>;
