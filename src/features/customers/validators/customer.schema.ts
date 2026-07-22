import { z } from "zod";

export const createCustomerSchema = z.object({
  customerCode: z
    .string()
    .min(1, "Müşteri kodu zorunludur")
    .max(50, "Müşteri kodu en fazla 50 karakter olabilir"),
  fullName: z
    .string()
    .min(1, "Ad Soyad zorunludur")
    .max(200, "Ad Soyad en fazla 200 karakter olabilir"),
  phone: z
    .string()
    .min(1, "Telefon zorunludur")
    .max(20, "Telefon en fazla 20 karakter olabilir"),
  phone2: z.string().max(20, "Telefon en fazla 20 karakter olabilir").optional().or(z.literal("")),
  email: z.string().email("Geçerli bir e-posta girin").optional().or(z.literal("")),
  address: z.string().max(500, "Adres en fazla 500 karakter olabilir").optional().or(z.literal("")),
  city: z.string().max(100, "Şehir en fazla 100 karakter olabilir").optional().or(z.literal("")),
  district: z.string().max(100, "İlçe en fazla 100 karakter olabilir").optional().or(z.literal("")),
  location: z.string().max(200, "Konum en fazla 200 karakter olabilir").optional().or(z.literal("")),
  balance: z.coerce.number().min(0, "Bakiye negatif olamaz").optional().default(0),
  depositBottleCount: z.coerce.number().int().min(0, "Depozito şişe sayısı negatif olamaz").optional().default(0),
  emptyBottleCount: z.coerce.number().int().min(0, "Boş şişe sayısı negatif olamaz").optional().default(0),
  notes: z.string().max(1000, "Notlar en fazla 1000 karakter olabilir").optional().or(z.literal("")),
});

export const updateCustomerSchema = createCustomerSchema.partial().extend({
  id: z.string().min(1),
});

export const customerQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  isActive: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === "string") {
        return val === "true";
      }
      return val;
    })
    .optional(),
  city: z.string().optional(),
  sort: z.enum(["createdAt", "fullName", "customerCode", "balance"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const customerIdSchema = z.object({
  id: z.string().min(1, "Geçersiz müşteri ID"),
});

export type CreateCustomerInput = z.input<typeof createCustomerSchema>;
export type CreateCustomerOutput = z.output<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.input<typeof updateCustomerSchema>;
export type CustomerQueryInput = z.output<typeof customerQuerySchema>;
