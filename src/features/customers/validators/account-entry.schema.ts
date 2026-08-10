import { z } from "zod";

export const accountEntryTypeEnum = z.enum(["CHARGE", "PAYMENT", "DEPOSIT_IN", "DEPOSIT_OUT"]);

export const accountEntryQuerySchema = z.object({ page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20) });

export const createAccountEntrySchema = z.object({
  type: accountEntryTypeEnum,
  amount: z.coerce.number().min(0).default(0),
  depositQuantity: z.coerce.number().int().min(0).default(0),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  referenceType: z.string().trim().max(50).optional().or(z.literal("")),
  referenceId: z.string().trim().max(100).optional().or(z.literal("")),
}).superRefine((value, context) => {
  if (["CHARGE", "PAYMENT"].includes(value.type) && value.amount <= 0) context.addIssue({ code: "custom", path: ["amount"], message: "Tutar sıfırdan büyük olmalıdır" });
  if (["DEPOSIT_IN", "DEPOSIT_OUT"].includes(value.type) && value.depositQuantity <= 0) context.addIssue({ code: "custom", path: ["depositQuantity"], message: "Depozito adedi sıfırdan büyük olmalıdır" });
});

export type AccountEntryQueryInput = z.output<typeof accountEntryQuerySchema>;
export type CreateAccountEntryOutput = z.output<typeof createAccountEntrySchema>;
