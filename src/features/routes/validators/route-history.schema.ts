import { z } from "zod";

const stopSchema = z.object({
  orderId: z.string().min(1),
  orderCode: z.string().min(1),
  customerName: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const routeHistoryInputSchema = z.object({
  routeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  distanceKm: z.number().min(0).max(10000),
  stops: z.array(stopSchema).max(500),
  fuelPricePerLiter: z.number().min(0).max(10000).optional(),
});

export type RouteHistoryInput = z.infer<typeof routeHistoryInputSchema>;

export const updateFuelPriceSchema = z.object({ fuelPricePerLiter: z.number().positive().max(10000) });
