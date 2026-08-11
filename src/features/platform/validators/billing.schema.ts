import { z } from "zod";

export const generateInvoiceSchema = z.object({
  tenantId: z.string().min(1),
  periodStart: z.string().min(1),
  dueDate: z.string().min(1),
});

export const createPaymentSchema = z.object({
  tenantId: z.string().min(1),
  invoiceId: z.string().optional().or(z.literal("")),
  amount: z.coerce.number().positive(),
  method: z.enum(["CARD", "BANK_TRANSFER", "CASH", "OTHER"]),
  referenceNumber: z.string().trim().max(120).optional().or(z.literal("")),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  status: z.enum(["PENDING", "SUCCEEDED", "FAILED"]).default("PENDING"),
  failureReason: z.string().trim().max(500).optional().or(z.literal("")),
});

export const refundPaymentSchema = z.object({
  amount: z.coerce.number().positive().optional(),
});

export type GenerateInvoiceInput = z.infer<typeof generateInvoiceSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
