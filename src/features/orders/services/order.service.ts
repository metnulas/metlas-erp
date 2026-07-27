import { AppError } from "@/server/errors/app-error";
import {
  createOrderRepository,
  type OrderRepository,
  type OrderWithItems,
  type StockItem,
} from "../repositories/order.repository";
import type { OrderQueryInput } from "../validators/order.schema";
import { Prisma, type OrderStatus } from "@prisma/client";

export interface PaginatedOrders {
  data: OrderWithItems[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateOrderData {
  customerId: string;
  orderDate: string;
  deliveryDate?: string;
  status?: OrderStatus;
  discount?: number;
  notes?: string;
  items: Array<{
    productId?: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }>;
}

export interface UpdateOrderData {
  customerId?: string;
  orderDate?: string;
  deliveryDate?: string;
  status?: OrderStatus;
  discount?: number;
  notes?: string;
  items?: Array<{
    productId?: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }>;
}

export interface OrderService {
  list(tenantId: string, query: OrderQueryInput): Promise<PaginatedOrders>;
  getById(id: string, tenantId: string): Promise<OrderWithItems>;
  create(tenantId: string, input: CreateOrderData, userId?: string): Promise<OrderWithItems>;
  update(id: string, tenantId: string, input: UpdateOrderData, userId?: string): Promise<OrderWithItems>;
  softDelete(id: string, tenantId: string): Promise<void>;
}

function calculateTotals(
  items: Array<{ quantity: number; unitPrice: number }>,
  discount: number
): { totalAmount: number; grandTotal: number } {
  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const grandTotal = Math.max(0, totalAmount - discount);
  return { totalAmount, grandTotal };
}

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PENDING", "CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CONFIRMED", "DELIVERING", "CANCELLED"],
  DELIVERING: ["DELIVERING", "DELIVERED", "CANCELLED"],
  DELIVERED: ["DELIVERED"],
  CANCELLED: ["CANCELLED"],
};

function assertStatusTransition(current: OrderStatus, next?: OrderStatus) {
  if (next && !allowedTransitions[current].includes(next)) {
    throw new AppError("Sipariş durumu bu aşamadan geriye alınamaz", 400, "ORDER_STATUS_TRANSITION_INVALID");
  }
}

async function validateReferences(repository: OrderRepository, tenantId: string, customerId: string, items: Array<{ productId?: string | null }>) {
  if (!(await repository.findCustomer(customerId, tenantId))) throw new AppError("Müşteri bulunamadı veya bu işletmeye ait değil", 400, "CUSTOMER_NOT_AVAILABLE");
  const requestedProductIds = [...new Set(items.flatMap((item) => item.productId ? [item.productId] : []))];
  const validProductIds = await repository.findProducts(requestedProductIds, tenantId);
  if (validProductIds.length !== requestedProductIds.length) throw new AppError("Siparişte geçersiz veya pasif ürün bulundu", 400, "PRODUCT_NOT_AVAILABLE");
}

function buildSortOrder(
  sort: OrderQueryInput["sort"],
  order: OrderQueryInput["order"]
): Prisma.OrderOrderByWithRelationInput {
  const fieldMap: Record<string, Prisma.OrderOrderByWithRelationInput> = {
    orderDate: { orderDate: order },
    orderCode: { orderCode: order },
    grandTotal: { grandTotal: order },
    createdAt: { createdAt: order },
    status: { status: order },
  };
  return fieldMap[sort] ?? { createdAt: "desc" };
}

export function createOrderService(
  repository: OrderRepository = createOrderRepository()
): OrderService {
  return {
    async list(tenantId, { page, pageSize, search, status, customerId, dateFrom, dateTo, sort, order }) {
      const where: Prisma.OrderWhereInput = {
        tenantId,
        deletedAt: null,
      };

      if (status) {
        where.status = status;
      }

      if (customerId) {
        where.customerId = customerId;
      }

      if (dateFrom || dateTo) {
        where.orderDate = {};
        if (dateFrom) where.orderDate.gte = new Date(dateFrom);
        if (dateTo) where.orderDate.lte = new Date(dateTo + "T23:59:59.999Z");
      }

      if (search) {
        where.OR = [
          { orderCode: { contains: search, mode: "insensitive" } },
          { customer: { fullName: { contains: search, mode: "insensitive" } } },
          { customer: { phone: { contains: search } } },
        ];
      }

      const orderBy = buildSortOrder(sort, order);
      const skip = (page - 1) * pageSize;

      const [data, total] = await Promise.all([
        repository.findMany({ where, orderBy, skip, take: pageSize }),
        repository.count(where),
      ]);

      return {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    },

    async getById(id, tenantId) {
      const order = await repository.findById(id, tenantId);
      if (!order) {
        throw new AppError("Sipariş bulunamadı", 404, "ORDER_NOT_FOUND");
      }
      return order;
    },

    async create(tenantId, input, userId) {
      if (input.items.length === 0) {
        throw new AppError("En az bir ürün eklemelisiniz", 400, "ORDER_NO_ITEMS");
      }
      if (input.status === "DELIVERED") throw new AppError("Teslim edilen sipariş dağıtım ekranından tamamlanmalıdır", 400, "DELIVERY_WORKFLOW_REQUIRED");
      await validateReferences(repository, tenantId, input.customerId, input.items);

      const orderCode = await repository.nextOrderCode(tenantId);
      const { totalAmount, grandTotal } = calculateTotals(input.items, input.discount ?? 0);

      const stockItems: StockItem[] = [];

      try {
        return await repository.create(
          tenantId,
        {
          orderCode,
          orderDate: new Date(input.orderDate),
          deliveryDate: input.deliveryDate ? new Date(input.deliveryDate) : null,
          status: input.status ?? "PENDING",
          totalAmount,
          discount: input.discount ?? 0,
          grandTotal,
          notes: input.notes || null,
          tenant: { connect: { id: tenantId } },
          customer: { connect: { id: input.customerId } },
          createdBy: userId ?? null,
          updatedBy: userId ?? null,
        },
        input.items.map((item) => ({
          ...(item.productId && { product: { connect: { id: item.productId } } }),
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
          notes: item.notes || null,
        })),
        stockItems
        );
      } catch (error) {
        if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") throw new AppError("Siparişte geçersiz ürün bulundu", 400, "PRODUCT_NOT_FOUND");
        if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") throw new AppError("Sipariş için yeterli stok bulunmuyor", 400, "INSUFFICIENT_STOCK");
        throw error;
      }
    },

    async update(id, tenantId, input, userId) {
      const existing = await repository.findById(id, tenantId);
      if (!existing) {
        throw new AppError("Sipariş bulunamadı", 404, "ORDER_NOT_FOUND");
      }

      if (existing.status === "DELIVERED" || existing.status === "CANCELLED") {
        throw new AppError("Teslim edilmiş veya iptal edilmiş sipariş düzenlenemez", 400, "ORDER_IMMUTABLE");
      }
      assertStatusTransition(existing.status, input.status);
      if (input.status === "DELIVERED") throw new AppError("Teslim edilen sipariş dağıtım ekranından tamamlanmalıdır", 400, "DELIVERY_WORKFLOW_REQUIRED");
      if (input.customerId || input.items) await validateReferences(repository, tenantId, input.customerId ?? existing.customer.id, input.items ?? existing.items);

      const updateData: Prisma.OrderUpdateInput = {};

      if (input.customerId) {
        updateData.customer = { connect: { id: input.customerId } };
      }
      if (input.orderDate) {
        updateData.orderDate = new Date(input.orderDate);
      }
      if (input.deliveryDate !== undefined) {
        updateData.deliveryDate = input.deliveryDate ? new Date(input.deliveryDate) : null;
      }
      if (input.status) {
        updateData.status = input.status;
      }
      if (input.discount !== undefined) {
        updateData.discount = input.discount;
      }
      if (input.notes !== undefined) {
        updateData.notes = input.notes || null;
      }
      updateData.updatedBy = userId ?? null;

      const items = input.items?.map((item) => ({
        ...(item.productId && { product: { connect: { id: item.productId } } }),
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
        notes: item.notes || null,
      }));

      const finalDiscount = input.discount ?? Number(existing.discount);
      const finalItems = items ?? existing.items.map((i) => ({ quantity: i.quantity, unitPrice: Number(i.unitPrice) }));
      const { totalAmount, grandTotal } = calculateTotals(finalItems, finalDiscount);

      updateData.totalAmount = totalAmount;
      updateData.grandTotal = grandTotal;

      const stockItems: StockItem[] = [];

      try {
        return await repository.update(id, tenantId, updateData, items, stockItems);
      } catch (error) {
        if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") throw new AppError("Siparişte geçersiz ürün bulundu", 400, "PRODUCT_NOT_FOUND");
        if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") throw new AppError("Sipariş için yeterli stok bulunmuyor", 400, "INSUFFICIENT_STOCK");
        throw error;
      }
    },

    async softDelete(id, tenantId) {
      const existing = await repository.findById(id, tenantId);
      if (!existing) {
        throw new AppError("Sipariş bulunamadı", 404, "ORDER_NOT_FOUND");
      }

      if (existing.status === "DELIVERED") {
        throw new AppError("Teslim edilmiş sipariş silinemez", 400, "ORDER_DELIVERED");
      }

      await repository.softDelete(id, tenantId);
    },
  };
}
