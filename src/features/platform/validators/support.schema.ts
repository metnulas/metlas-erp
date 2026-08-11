import { z } from "zod";

export const createSupportTicketSchema = z.object({ tenantId: z.string().min(1), subject: z.string().trim().min(3).max(160), description: z.string().trim().min(3).max(5000), category: z.enum(["GENERAL", "BILLING", "TECHNICAL", "ACCOUNT", "SECURITY"]), priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]) });
export const updateSupportTicketSchema = z.object({ status: z.enum(["OPEN", "IN_PROGRESS", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"]).optional(), priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(), assigneeId: z.string().nullable().optional() });
export const supportMessageSchema = z.object({ body: z.string().trim().min(1).max(5000), isInternal: z.boolean().default(false) });
export type CreateSupportTicketInput = z.infer<typeof createSupportTicketSchema>;
