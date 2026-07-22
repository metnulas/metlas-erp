import { prisma } from "@/lib/db/prisma";
import { Prisma, type Product, type StockMovement, type StockMovementType } from "@prisma/client";

export type ProductWithMovements = Product & { stockMovements: StockMovement[] };

export interface FindManyParams {
  where: Prisma.ProductWhereInput;
  orderBy?: Prisma.ProductOrderByWithRelationInput;
  skip?: number;
  take?: number;
}

export interface ProductRepository {
  findMany(params: FindManyParams): Promise<Product[]>;
  count(where: Prisma.ProductWhereInput): Promise<number>;
  findById(id: string, tenantId: string): Promise<ProductWithMovements | null>;
  findByCode(code: string, tenantId: string): Promise<Product | null>;
  create(data: Prisma.ProductCreateInput): Promise<Product>;
  update(id: string, tenantId: string, data: Prisma.ProductUpdateInput): Promise<Product>;
  softDelete(id: string, tenantId: string): Promise<Product>;
  adjustStock(params: {
    id: string;
    tenantId: string;
    type: StockMovementType;
    quantity: number;
    notes?: string;
    userId?: string;
  }): Promise<Product>;
}

export function createProductRepository(): ProductRepository {
  return {
    async findMany({ where, orderBy, skip, take }) {
      return prisma.product.findMany({
        where,
        orderBy: orderBy ?? { createdAt: "desc" },
        skip,
        take,
      });
    },

    async count(where) {
      return prisma.product.count({ where });
    },

    async findById(id, tenantId) {
      return prisma.product.findFirst({
        where: { id, tenantId, deletedAt: null },
        include: { stockMovements: { orderBy: { createdAt: "desc" }, take: 20 } },
      });
    },

    async findByCode(code, tenantId) {
      return prisma.product.findFirst({ where: { code, tenantId, deletedAt: null } });
    },

    async create(data) {
      return prisma.product.create({ data });
    },

    async update(id, tenantId, data) {
      return prisma.product.update({ where: { id, tenantId }, data });
    },

    async softDelete(id, tenantId) {
      return prisma.product.update({ where: { id, tenantId }, data: { deletedAt: new Date(), isActive: false } });
    },

    async adjustStock({ id, tenantId, type, quantity, notes, userId }) {
      return prisma.$transaction(async (tx) => {
        const product = await tx.product.findFirst({ where: { id, tenantId, deletedAt: null } });
        if (!product) throw new Error("PRODUCT_NOT_FOUND");

        const nextBalance = product.stockQuantity + quantity;
        if (nextBalance < 0) throw new Error("INSUFFICIENT_STOCK");

        const updated = await tx.product.update({
          where: { id },
          data: { stockQuantity: nextBalance, updatedBy: userId ?? null },
        });

        await tx.stockMovement.create({
          data: {
            tenantId,
            productId: id,
            type,
            quantity,
            balanceAfter: nextBalance,
            notes: notes || null,
            createdBy: userId ?? null,
          },
        });

        return updated;
      });
    },
  };
}
