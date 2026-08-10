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
  findLeastBusyVehicle(tenantId: string, deliveryDate: Date, excludeOrderId: string): Promise<{ id: string; code: string; plate: string; type: string } | null>;
  findLeastBusyPersonnel(tenantId: string, deliveryDate: Date, excludeOrderId: string): Promise<{ id: string; employeeCode: string; fullName: string; phone: string } | null>;
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
    async findLeastBusyVehicle(tenantId, deliveryDate, excludeOrderId) {
      const candidates = await prisma.vehicle.findMany({ where: { tenantId, deletedAt: null, isActive: true, status: "ACTIVE" }, select: { id: true, code: true, plate: true, type: true } });
      if (candidates.length === 0) return null;
      const start = new Date(deliveryDate); start.setHours(0, 0, 0, 0);
      const end = new Date(start); end.setDate(end.getDate() + 1);
      const counts = await prisma.order.groupBy({ by: ["vehicleId"], where: { tenantId, deletedAt: null, id: { not: excludeOrderId }, vehicleId: { in: candidates.map((candidate) => candidate.id) }, deliveryDate: { gte: start, lt: end }, status: { notIn: ["DELIVERED", "CANCELLED"] } }, _count: { _all: true } });
      const countById = new Map(counts.map((row) => [row.vehicleId, row._count._all]));
      return candidates.sort((a, b) => (countById.get(a.id) ?? 0) - (countById.get(b.id) ?? 0))[0] ?? null;
    },
    async findLeastBusyPersonnel(tenantId, deliveryDate, excludeOrderId) {
      const candidates = await prisma.personnel.findMany({ where: { tenantId, deletedAt: null, isActive: true, status: "ACTIVE" }, select: { id: true, employeeCode: true, fullName: true, phone: true } });
      if (candidates.length === 0) return null;
      const start = new Date(deliveryDate); start.setHours(0, 0, 0, 0);
      const end = new Date(start); end.setDate(end.getDate() + 1);
      const counts = await prisma.order.groupBy({ by: ["personnelId"], where: { tenantId, deletedAt: null, id: { not: excludeOrderId }, personnelId: { in: candidates.map((candidate) => candidate.id) }, deliveryDate: { gte: start, lt: end }, status: { notIn: ["DELIVERED", "CANCELLED"] } }, _count: { _all: true } });
      const countById = new Map(counts.map((row) => [row.personnelId, row._count._all]));
      return candidates.sort((a, b) => (countById.get(a.id) ?? 0) - (countById.get(b.id) ?? 0))[0] ?? null;
    },
    update(id, tenantId, data) { return prisma.order.update({ where: { id, tenantId }, data, include: includeRelations }); },
    async deliver(id, tenantId, data) {
      return prisma.$transaction(async (tx) => {
        const order = await tx.order.findFirst({ where: { id, tenantId, deletedAt: null }, include: { items: true } });
        if (!order) throw new Error("ORDER_NOT_FOUND");
        for (const item of order.items) {
          if (!item.productId || item.quantity <= 0) continue;
          const result = await tx.product.updateMany({ where: { id: item.productId, tenantId, deletedAt: null, stockQuantity: { gte: item.quantity } }, data: { stockQuantity: { decrement: item.quantity } } });
          if (result.count === 0) {
            const product = await tx.product.findFirst({ where: { id: item.productId, tenantId, deletedAt: null } });
            if (!product) throw new Error("PRODUCT_NOT_FOUND");
            throw new Error("INSUFFICIENT_STOCK");
          }
          const product = await tx.product.findFirstOrThrow({ where: { id: item.productId, tenantId, deletedAt: null } });
          const balanceAfter = product.stockQuantity;
          await tx.stockMovement.create({ data: { tenantId, productId: product.id, type: "ORDER", quantity: -item.quantity, balanceAfter, referenceType: "ORDER", referenceId: order.id, notes: "Sipariş teslimi" } });
        }
        return tx.order.update({ where: { id, tenantId }, data, include: includeRelations });
      });
    },
  };
}
