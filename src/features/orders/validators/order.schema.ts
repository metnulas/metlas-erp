import { z } from "zod";

const orderStatusEnum = z.enum(["PENDING", "CONFIRMED", "DELIVERING", "DELIVERED", "CANCELLED"]);

const orderItemSchema = z.object({
  id: z.string().optional(),
  productName: z.string().min(1, "Ürün adı zorunludur").max(200),
  quantity: z.coerce.number().int().min(1, "Miktar en az 1 olmalıdır"),
  unitPrice: z.coerce.number().min(0, "Birim fiyat negatif olamaz"),
  total: z.coerce.number().optional(),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export const createOrderSchema = z.object({
  customerId: z.string().min(1, "Müşteri seçimi zorunludur"),
  orderDate: z.string().min(1, "Sipariş tarihi zorunludur"),
  deliveryDate: z.string().optional().or(z.literal("")),
  status: orderStatusEnum.default("PENDING"),
  discount: z.coerce.number().min(0, "İndirim negatif olamaz").optional().default(0),
  notes: z.string().max(1000).optional().or(z.literal("")),
  items: z
    .array(orderItemSchema)
    .min(1, "En az bir ürün eklemelisiniz"),
});

export const updateOrderSchema = z.object({
  id: z.string().min(1),
  customerId: z.string().min(1).optional(),
  orderDate: z.string().optional(),
  deliveryDate: z.string().optional().or(z.literal("")),
  status: orderStatusEnum.optional(),
  discount: z.coerce.number().min(0).optional(),
  notes: z.string().max(1000).optional().or(z.literal("")),
  items: z.array(orderItemSchema).optional(),
});

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: orderStatusEnum.optional(),
  customerId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sort: z.enum(["orderDate", "orderCode", "grandTotal", "createdAt", "status"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const orderIdSchema = z.object({
  id: z.string().min(1, "Geçersiz sipariş ID"),
});

export type CreateOrderInput = z.input<typeof createOrderSchema>;
export type CreateOrderOutput = z.output<typeof createOrderSchema>;
export type UpdateOrderInput = z.input<typeof updateOrderSchema>;
export type OrderQueryInput = z.output<typeof orderQuerySchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
