import { Prisma, type Order } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export type DeliveryOrder = Order & {
  customer: { id: string; fullName: string; phone: string; address: string | null; district: string | null };
  vehicle: { id: string; code: string; plate: string; type: string } | null;
  personnel: { id: string; employeeCode: string; fullName: string; phone: string } | null;
};

export interface DeliveryRepository {
  findMany(tenantId: string, where: Prisma.OrderWhereInput): Promise<DeliveryOrder[]>;
  findById(id: string, tenantId: string): Promise<DeliveryOrder | null>;
  findVehicle(id: string, tenantId: string): Promise<{ id: string; code: string; plate: string; type: string } | null>;
  findPersonnel(id: string, tenantId: string): Promise<{ id: string; employeeCode: string; fullName: string; phone: string } | null>;
  update(id: string, tenantId: string, data: Prisma.OrderUpdateInput): Promise<DeliveryOrder>;
  deliver(id: string, tenantId: string, data: Prisma.OrderUpdateInput): Promise<DeliveryOrder>;
}

const includeRelations = {
  customer: { select: { id: true, fullName: true, phone: true, address: true, district: true } },
  vehicle: { select: { id: true, code: true, plate: true, type: true } },
  personnel: { select: { id: true, employeeCode: true, fullName: true, phone: true } },
};

export function createDeliveryRepository(): DeliveryRepository {
  return {
    findMany(tenantId, where) { return prisma.order.findMany({ where: { ...where, tenantId, deletedAt: null }, orderBy: [{ deliveryDate: "asc" }, { orderCode: "asc" }], include: includeRelations }); },
    findById(id, tenantId) { return prisma.order.findFirst({ where: { id, tenantId, deletedAt: null }, include: includeRelations }); },
    findVehicle(id, tenantId) { return prisma.vehicle.findFirst({ where: { id, tenantId, deletedAt: null, isActive: true, status: "ACTIVE" }, select: { id: true, code: true, plate: true, type: true } }); },
    findPersonnel(id, tenantId) { return prisma.personnel.findFirst({ where: { id, tenantId, deletedAt: null, isActive: true, status: "ACTIVE" }, select: { id: true, employeeCode: true, fullName: true, phone: true } }); },
    update(id, tenantId, data) { return prisma.order.update({ where: { id, tenantId }, data, include: includeRelations }); },
    async deliver(id, tenantId, data) {
      return prisma.$transaction(async (tx) => {
        const order = await tx.order.findFirst({ where: { id, tenantId, deletedAt: null }, include: { items: true } });
        if (!order) throw new Error("ORDER_NOT_FOUND");
        for (const item of order.items) {
          if (!item.productId || item.quantity <= 0) continue;
          const product = await tx.product.findFirst({ where: { id: item.productId, tenantId, deletedAt: null } });
          if (!product) throw new Error("PRODUCT_NOT_FOUND");
          const balanceAfter = product.stockQuantity - item.quantity;
          if (balanceAfter < 0) throw new Error("INSUFFICIENT_STOCK");
          await tx.product.update({ where: { id: product.id }, data: { stockQuantity: balanceAfter } });
          await tx.stockMovement.create({ data: { tenantId, productId: product.id, type: "ORDER", quantity: -item.quantity, balanceAfter, referenceType: "ORDER", referenceId: order.id, notes: "Sipariş teslimi" } });
        }
        return tx.order.update({ where: { id, tenantId }, data, include: includeRelations });
      });
    },
  };
}
