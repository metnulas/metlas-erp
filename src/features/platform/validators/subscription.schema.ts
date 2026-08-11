import { z } from "zod";

const nullableLimit = z.coerce.number().int().min(0).nullable().optional();

export const packageSchema = z.object({
  code: z.string().trim().min(2).max(40).regex(/^[A-Z0-9_-]+$/, "Kod yalnızca büyük harf, sayı, alt çizgi ve tire içerebilir"),
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).nullable().optional(),
  monthlyPrice: z.coerce.number().min(0),
  annualPrice: z.coerce.number().min(0),
  maxUsers: nullableLimit,
  maxOrders: nullableLimit,
  maxWarehouses: nullableLimit,
  maxVehicles: nullableLimit,
  storageGb: nullableLimit,
  apiLimit: nullableLimit,
  aiUsage: nullableLimit,
  isActive: z.boolean().optional().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const packageUpdateSchema = packageSchema.partial();

export const subscriptionSchema = z.object({
  tenantId: z.string().min(1),
  packageId: z.string().min(1),
  startsAt: z.string().min(1),
  endsAt: z.string().optional().or(z.literal("")),
  status: z.enum(["TRIAL", "ACTIVE", "PAST_DUE", "CANCELLED", "EXPIRED"]),
  isTrial: z.boolean(),
  trialEndsAt: z.string().optional().or(z.literal("")),
  lastPaymentAt: z.string().optional().or(z.literal("")),
  nextPaymentAt: z.string().optional().or(z.literal("")),
  discountAmount: z.coerce.number().min(0),
  manualPrice: z.coerce.number().min(0).nullable().optional(),
  taxRate: z.coerce.number().min(0).max(100),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type PackageInput = z.infer<typeof packageSchema>;
export type PackageUpdateInput = z.infer<typeof packageUpdateSchema>;
export type SubscriptionInput = z.infer<typeof subscriptionSchema>;
