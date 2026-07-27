import { prisma } from "@/lib/db/prisma";
import { Prisma, type Customer } from "@prisma/client";

export interface FindManyParams {
  where: Prisma.CustomerWhereInput;
  orderBy?: Prisma.CustomerOrderByWithRelationInput;
  skip?: number;
  take?: number;
}

export interface CustomerRepository {
  findMany(params: FindManyParams): Promise<Customer[]>;
  count(where: Prisma.CustomerWhereInput): Promise<number>;
  findById(id: string, tenantId: string): Promise<Customer | null>;
  findByCode(customerCode: string, tenantId: string): Promise<Customer | null>;
  create(data: Prisma.CustomerCreateInput): Promise<Customer>;
  update(id: string, tenantId: string, data: Prisma.CustomerUpdateInput): Promise<Customer>;
  softDelete(id: string, tenantId: string): Promise<Customer>;
  findOrderHistory(customerId: string, tenantId: string): Promise<CustomerOrderHistoryItem[]>;
}

export interface CustomerOrderHistoryItem {
  id: string;
  orderCode: string;
  orderDate: Date;
  deliveryDate: Date | null;
  deliveredAt: Date | null;
  deliveryNotes: string | null;
  status: string;
  grandTotal: unknown;
  items: Array<{ id: string; productId: string | null; productName: string; quantity: number; unitPrice: unknown; total: unknown; notes: string | null }>;
}

export function createCustomerRepository(): CustomerRepository {
  return {
    async findMany({ where, orderBy, skip, take }) {
      return prisma.customer.findMany({
        where,
        orderBy: orderBy ?? { createdAt: "desc" },
        skip,
        take,
      });
    },

    async count(where) {
      return prisma.customer.count({ where });
    },

    async findById(id, tenantId) {
      return prisma.customer.findFirst({
        where: { id, tenantId, deletedAt: null },
      });
    },

    async findByCode(customerCode, tenantId) {
      return prisma.customer.findFirst({
        where: { customerCode, tenantId, deletedAt: null },
      });
    },

    async create(data) {
      return prisma.customer.create({ data });
    },

    async update(id, tenantId, data) {
      return prisma.customer.update({
        where: { id, tenantId },
        data,
      });
    },

    async softDelete(id, tenantId) {
      return prisma.customer.update({
        where: { id, tenantId },
        data: { deletedAt: new Date(), isActive: false },
      });
    },

    async findOrderHistory(customerId, tenantId) {
      return prisma.order.findMany({
        where: { customerId, tenantId, deletedAt: null },
        orderBy: { orderDate: "desc" },
        take: 50,
        select: {
          id: true, orderCode: true, orderDate: true, deliveryDate: true, deliveredAt: true,
          deliveryNotes: true, status: true, grandTotal: true,
          items: { select: { id: true, productId: true, productName: true, quantity: true, unitPrice: true, total: true, notes: true } },
        },
      });
    },
  };
}
