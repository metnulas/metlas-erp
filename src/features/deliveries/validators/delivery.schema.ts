import { z } from "zod";

const deliveryStatusEnum = z.enum(["PENDING", "CONFIRMED", "DELIVERING", "DELIVERED", "CANCELLED"]);

export const deliveryQuerySchema = z.object({
  date: z.string().optional(),
  status: deliveryStatusEnum.optional(),
  includeUnscheduled: z.coerce.boolean().default(false),
});

export const assignDeliverySchema = z.object({
  vehicleId: z.string().min(1).nullable().optional(),
  personnelId: z.string().min(1).nullable().optional(),
  deliveryDate: z.string().optional().or(z.literal("")),
  deliveryNotes: z.string().max(1000).optional().or(z.literal("")),
  status: deliveryStatusEnum.optional(),
});

export type DeliveryQueryInput = z.output<typeof deliveryQuerySchema>;
export type AssignDeliveryInput = z.output<typeof assignDeliverySchema>;
