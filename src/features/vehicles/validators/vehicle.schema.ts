import { z } from "zod";

const vehicleStatusEnum = z.enum(["ACTIVE", "MAINTENANCE", "INACTIVE"]);

export const createVehicleSchema = z.object({
  code: z.string().trim().min(1, "Araç kodu zorunludur").max(50),
  plate: z.string().trim().min(1, "Plaka zorunludur").max(20),
  type: z.string().trim().min(1, "Araç tipi zorunludur").max(80),
  brand: z.string().trim().max(80).optional().or(z.literal("")),
  model: z.string().trim().max(80).optional().or(z.literal("")),
  modelYear: z.preprocess(
    (value) => value === "" ? undefined : value,
    z.coerce.number().int().min(1900).max(2200).optional()
  ),
  capacity: z.coerce.number().int().min(0, "Kapasite negatif olamaz"),
  capacityUnit: z.string().trim().min(1, "Kapasite birimi zorunludur").max(20),
  mileage: z.coerce.number().int().min(0, "Kilometre negatif olamaz"),
  status: vehicleStatusEnum.default("ACTIVE"),
  inspectionDate: z.string().optional().or(z.literal("")),
  insuranceDate: z.string().optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export const updateVehicleSchema = createVehicleSchema.partial().extend({ id: z.string().min(1) });

export const vehicleQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.string().optional(),
  status: vehicleStatusEnum.optional(),
  sort: z.enum(["code", "plate", "type", "mileage", "createdAt"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const vehicleIdSchema = z.object({ id: z.string().min(1) });

export type CreateVehicleInput = z.input<typeof createVehicleSchema>;
export type CreateVehicleOutput = z.output<typeof createVehicleSchema>;
export type UpdateVehicleOutput = z.output<typeof updateVehicleSchema>;
export type VehicleQueryInput = z.output<typeof vehicleQuerySchema>;
