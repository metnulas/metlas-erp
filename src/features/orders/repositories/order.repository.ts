import { prisma } from "@/lib/db/prisma";
import { Prisma, type Order, type OrderItem } from "@prisma/client";

export type OrderWithItems = Order & { items: OrderItem[]; customer: { id: string; fullName: string; phone: string } };

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
  create(data: Prisma.OrderCreateInput, items: Prisma.OrderItemCreateWithoutOrderInput[]): Promise<OrderWithItems>;
  update(id: string, data: Prisma.OrderUpdateInput, items?: Prisma.OrderItemCreateWithoutOrderInput[]): Promise<OrderWithItems>;
  softDelete(id: string, tenantId: string): Promise<Order>;
  nextOrderCode(tenantId: string): Promise<string>;
}

export function createOrderRepository(): OrderRepository {
  const includeRelations = {
    items: true,
    customer: { select: { id: true, fullName: true, phone: true } },
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

    async create(data, items) {
      return prisma.order.create({
        data: {
          ...data,
          items: {
            create: items.map((item) => ({
              ...item,
              total: (item.quantity ?? 1) * Number(item.unitPrice),
            })),
          },
        },
        include: includeRelations,
      });
    },

    async update(id, data, items) {
      if (items) {
        await prisma.orderItem.deleteMany({ where: { orderId: id } });
        return prisma.order.update({
          where: { id },
          data: {
            ...data,
            items: {
              create: items.map((item) => ({
                ...item,
                total: (item.quantity ?? 1) * Number(item.unitPrice),
              })),
            },
          },
          include: includeRelations,
        });
      }

      return prisma.order.update({
        where: { id },
        data,
        include: includeRelations,
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

      const lastOrder = await prisma.order.findFirst({
        where: {
          tenantId,
          orderCode: { startsWith: prefix },
        },
        orderBy: { orderCode: "desc" },
        select: { orderCode: true },
      });

      if (lastOrder) {
        const lastNum = parseInt(lastOrder.orderCode.split("-")[2], 10);
        return `${prefix}${String(lastNum + 1).padStart(3, "0")}`;
      }

      return `${prefix}001`;
    },
  };
}
