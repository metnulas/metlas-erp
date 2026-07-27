import { z } from "zod";

const deliveryStatusEnum = z.enum(["PENDING", "CONFIRMED", "DELIVERING", "DELIVERED", "CANCELLED"]);
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih YYYY-AA-GG formatında olmalıdır");

export const deliveryQuerySchema = z.object({
  date: dateSchema.optional(),
  status: deliveryStatusEnum.optional(),
  includeUnscheduled: z.coerce.boolean().default(false),
});

export const assignDeliverySchema = z.object({
  vehicleId: z.string().min(1).nullable().optional(),
  personnelId: z.string().min(1).nullable().optional(),
  deliveryDate: dateSchema.optional().or(z.literal("")),
  deliveryNotes: z.string().max(1000).optional().or(z.literal("")),
  status: deliveryStatusEnum.optional(),
});

export type DeliveryQueryInput = z.output<typeof deliveryQuerySchema>;
export type AssignDeliveryInput = z.output<typeof assignDeliverySchema>;
