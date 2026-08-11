import { z } from "zod";

export const createTenantSchema = z.object({ name: z.string().trim().min(2).max(120) });
export const updateTenantSchema = z.object({ name: z.string().trim().min(2).max(120).optional(), isActive: z.boolean().optional() });
export const tenantIdSchema = z.object({ id: z.string().cuid() });
