import { prisma } from "@/lib/db/prisma";
import { Prisma, type Order, type OrderItem } from "@prisma/client";

export type OrderWithItems = Order & { items: (OrderItem & { product: { id: string; code: string; name: string } | null })[]; customer: { id: string; fullName: string; phone: string; partner: { id: string; name: string; code: string } | null }; vehicle: { id: string; code: string; plate: string; type: string } | null; personnel: { id: string; employeeCode: string; fullName: string; phone: string } | null };

export interface FindManyParams {
  where: Prisma.OrderWhereInput;
  orderBy?: Prisma.OrderOrderByWithRelationInput;
  skip?: number;
  take?: number;
}

export interface OrderRepository {
  findMany(params: FindManyParams): Promise<OrderWithItems[]>;
  count(where: Prisma.OrderWhereInput): Promise<number>;
  findById(id: string, tenantId: string): Promise<OrderWithItems | null>;
  findByCode(orderCode: string, tenantId: string): Promise<Order | null>;
  findCustomer(id: string, tenantId: string): Promise<boolean>;
  findProducts(ids: string[], tenantId: string): Promise<string[]>;
  findProductCosts(ids: string[], tenantId: string): Promise<Map<string, number>>;
  create(tenantId: string, data: Prisma.OrderCreateInput, items: Prisma.OrderItemCreateWithoutOrderInput[], stockItems?: StockItem[]): Promise<OrderWithItems>;
  update(id: string, tenantId: string, data: Prisma.OrderUpdateInput, items?: Prisma.OrderItemCreateWithoutOrderInput[], stockItems?: StockItem[]): Promise<OrderWithItems>;
  softDelete(id: string, tenantId: string): Promise<Order>;
  nextOrderCode(tenantId: string): Promise<string>;
}

export interface StockItem {
  productId?: string | null;
  quantity: number;
}

export function createOrderRepository(): OrderRepository {
  const includeRelations = {
    items: { include: { product: { select: { id: true, code: true, name: true } } } },
    customer: { select: { id: true, fullName: true, phone: true, partner: { select: { id: true, name: true, code: true } } } },
    vehicle: { select: { id: true, code: true, plate: true, type: true } },
    personnel: { select: { id: true, employeeCode: true, fullName: true, phone: true } },
  };

  return {
    async findMany({ where, orderBy, skip, take }) {
      return prisma.order.findMany({
        where,
        orderBy: orderBy ?? { createdAt: "desc" },
        skip,
        take,
        include: includeRelations,
      });
    },

    async count(where) {
      return prisma.order.count({ where });
    },

    async findById(id, tenantId) {
      return prisma.order.findFirst({
        where: { id, tenantId, deletedAt: null },
        include: includeRelations,
      });
    },

    async findByCode(orderCode, tenantId) {
      return prisma.order.findFirst({
        where: { orderCode, tenantId, deletedAt: null },
      });
    },

    async create(tenantId, data, items, stockItems = []) {
      return prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            ...data,
            items: {
              create: items.map((item) => ({ ...item, total: (item.quantity ?? 1) * Number(item.unitPrice) })),
            },
          },
          include: includeRelations,
        });
        await applyStockOut(tx, tenantId, order.id, stockItems);
        return order;
      });
    },

    async findCustomer(id, tenantId) {
      const customer = await prisma.customer.findFirst({ where: { id, tenantId, deletedAt: null, isActive: true }, select: { id: true } });
      return Boolean(customer);
    },

    async findProducts(ids, tenantId) {
      if (ids.length === 0) return [];
      const products = await prisma.product.findMany({ where: { id: { in: ids }, tenantId, deletedAt: null, isActive: true }, select: { id: true } });
      return products.map((product) => product.id);
    },

    async findProductCosts(ids, tenantId) {
      const products = await prisma.product.findMany({ where: { id: { in: ids }, tenantId, deletedAt: null, isActive: true }, select: { id: true, purchasePrice: true } });
      return new Map(products.map((product) => [product.id, Number(product.purchasePrice)]));
    },

    async update(id, tenantId, data, items, stockItems = []) {
      return prisma.$transaction(async (tx) => {
        if (items) {
          await tx.orderItem.deleteMany({ where: { orderId: id } });
        }
        const order = await tx.order.update({
          where: { id },
          data: items ? { ...data, items: { create: items.map((item) => ({ ...item, total: (item.quantity ?? 1) * Number(item.unitPrice) })) } } : data,
          include: includeRelations,
        });
        await applyStockOut(tx, tenantId, order.id, stockItems);
        return order;
      });
    },

    async softDelete(id, tenantId) {
      return prisma.order.update({
        where: { id, tenantId },
        data: { deletedAt: new Date(), status: "CANCELLED" },
      });
    },

    async nextOrderCode(tenantId) {
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
      const prefix = `SIP-${dateStr}-`;
      const sequence = await prisma.orderSequence.upsert({
        where: { tenantId },
        update: { nextValue: { increment: 1 } },
        create: { tenant: { connect: { id: tenantId } }, nextValue: 2 },
        select: { nextValue: true },
      });
      return `${prefix}${String(sequence.nextValue - 1).padStart(3, "0")}`;
    },
  };
}

async function applyStockOut(tx: Prisma.TransactionClient, tenantId: string, orderId: string, stockItems: StockItem[]) {
  for (const item of stockItems) {
    if (!item.productId || item.quantity <= 0) continue;
    const result = await tx.product.updateMany({ where: { id: item.productId, tenantId, deletedAt: null, stockQuantity: { gte: item.quantity } }, data: { stockQuantity: { decrement: item.quantity } } });
    if (result.count === 0) {
      const product = await tx.product.findFirst({ where: { id: item.productId, tenantId, deletedAt: null } });
      if (!product) throw new Error("PRODUCT_NOT_FOUND");
      throw new Error("INSUFFICIENT_STOCK");
    }
    const product = await tx.product.findFirstOrThrow({ where: { id: item.productId, tenantId, deletedAt: null } });
    const balanceAfter = product.stockQuantity;
    await tx.stockMovement.create({
      data: { tenantId, productId: product.id, type: "ORDER", quantity: -item.quantity, balanceAfter, referenceType: "ORDER", referenceId: orderId, notes: "Sipariş teslimi" },
    });
  }
}
