import { z } from "zod";

const emptyToUndefined = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? undefined : val),
  z.string().optional()
);
const optionalLatitude = z.preprocess((value) => value === "" || value === null || value === undefined ? undefined : value, z.coerce.number().min(-90).max(90).optional());
const optionalLongitude = z.preprocess((value) => value === "" || value === null || value === undefined ? undefined : value, z.coerce.number().min(-180).max(180).optional());

export const createCustomerSchema = z.object({
  partnerId: z.string().min(1, "Bayi seçimi zorunludur"),
  customerCode: z.string().max(50, "Müşteri kodu en fazla 50 karakter olabilir").optional().or(z.literal("")),
  fullName: z
    .string()
    .min(1, "Ad Soyad zorunludur")
    .max(200, "Ad Soyad en fazla 200 karakter olabilir"),
  phone: z
    .string()
    .min(1, "Telefon zorunludur")
    .max(20, "Telefon en fazla 20 karakter olabilir"),
  phone2: z.string().max(20, "Telefon en fazla 20 karakter olabilir").optional().or(z.literal("")),
  email: z.union([z.string().email("Geçerli bir e-posta girin"), z.literal("")]),
  address: z.string().max(500, "Adres en fazla 500 karakter olabilir").optional().or(z.literal("")),
  city: z.string().max(100, "Şehir en fazla 100 karakter olabilir").optional().or(z.literal("")),
  district: z.string().max(100, "İlçe en fazla 100 karakter olabilir").optional().or(z.literal("")),
  location: z.string().max(200, "Konum en fazla 200 karakter olabilir").optional().or(z.literal("")),
  latitude: optionalLatitude,
  longitude: optionalLongitude,
  balance: z.coerce.number().min(0, "Bakiye negatif olamaz").optional().default(0),
  depositBottleCount: z.coerce.number().int().min(0, "Depozito şişe sayısı negatif olamaz").optional().default(0),
  emptyBottleCount: z.coerce.number().int().min(0, "Boş şişe sayısı negatif olamaz").optional().default(0),
  notes: emptyToUndefined,
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
