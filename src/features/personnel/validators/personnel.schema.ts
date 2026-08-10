import { z } from "zod";

const personnelStatusEnum = z.enum(["ACTIVE", "ON_LEAVE", "INACTIVE"]);

export const createPersonnelSchema = z.object({
  employeeCode: z.string().trim().max(50).optional().or(z.literal("")),
  fullName: z.string().trim().min(2, "Ad soyad zorunludur").max(160),
  phone: z.string().trim().min(5, "Telefon zorunludur").max(30),
  email: z.string().trim().email("Geçerli bir e-posta girin").optional().or(z.literal("")),
  position: z.string().trim().min(1, "Görev zorunludur").max(100),
  licenseNumber: z.string().trim().max(50).optional().or(z.literal("")),
  licenseClass: z.string().trim().max(20).optional().or(z.literal("")),
  licenseExpiryDate: z.string().optional().or(z.literal("")),
  hireDate: z.string().optional().or(z.literal("")),
  status: personnelStatusEnum.default("ACTIVE"),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export const updatePersonnelSchema = createPersonnelSchema.partial().extend({ id: z.string().min(1) });
export const personnelQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(), position: z.string().optional(), status: personnelStatusEnum.optional(),
  sort: z.enum(["employeeCode", "fullName", "position", "createdAt"]).default("createdAt"), order: z.enum(["asc", "desc"]).default("desc"),
});
export const personnelIdSchema = z.object({ id: z.string().min(1) });

export type CreatePersonnelInput = z.input<typeof createPersonnelSchema>;
export type CreatePersonnelOutput = z.output<typeof createPersonnelSchema>;
export type UpdatePersonnelOutput = z.output<typeof updatePersonnelSchema>;
export type PersonnelQueryInput = z.output<typeof personnelQuerySchema>;
