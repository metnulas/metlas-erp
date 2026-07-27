import { z } from "zod";

const stockMovementTypeEnum = z.enum(["PURCHASE", "RETURN", "ADJUSTMENT"]);

export const createProductSchema = z.object({
  code: z.string().trim().min(1, "Ürün kodu zorunludur").max(50),
  name: z.string().trim().min(1, "Ürün adı zorunludur").max(200),
  category: z.string().trim().max(100).optional().or(z.literal("")),
  unit: z.string().trim().min(1, "Birim zorunludur").max(30),
  description: z.string().max(2000).optional().or(z.literal("")),
  salePrice: z.coerce.number().min(0, "Satış fiyatı negatif olamaz"),
  purchasePrice: z.coerce.number().min(0, "Alış fiyatı negatif olamaz"),
  stockQuantity: z.coerce.number().int().min(0, "Stok negatif olamaz"),
  minStockLevel: z.coerce.number().int().min(0, "Minimum stok negatif olamaz"),
  hasDeposit: z.coerce.boolean().default(false),
  depositAmount: z.coerce.number().min(0, "Depozito tutarı negatif olamaz"),
});

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().min(1, "Geçersiz ürün ID"),
});

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  lowStock: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  sort: z.enum(["code", "name", "salePrice", "stockQuantity", "createdAt"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const productIdSchema = z.object({ id: z.string().min(1, "Geçersiz ürün ID") });

export const stockAdjustmentSchema = z.object({
  type: stockMovementTypeEnum,
  quantity: z.coerce.number().int().refine((value) => value !== 0, "Miktar sıfır olamaz"),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type CreateProductInput = z.input<typeof createProductSchema>;
export type CreateProductOutput = z.output<typeof createProductSchema>;
export type UpdateProductInput = z.input<typeof updateProductSchema>;
export type UpdateProductOutput = z.output<typeof updateProductSchema>;
export type ProductQueryInput = z.output<typeof productQuerySchema>;
export type StockAdjustmentInput = z.input<typeof stockAdjustmentSchema>;
export type StockAdjustmentOutput = z.output<typeof stockAdjustmentSchema>;
