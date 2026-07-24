import { prisma } from "@/lib/db/prisma";

export interface DashboardRepository {
  countTodayOrders(tenantId: string, start: Date, end: Date): Promise<number>;
  countActiveCustomers(tenantId: string): Promise<number>;
  countActiveVehicles(tenantId: string): Promise<number>;
  countActivePersonnel(tenantId: string): Promise<number>;
  sumTodayRevenue(tenantId: string, start: Date, end: Date): Promise<{ _sum: { grandTotal: unknown } }>;
  findWeekOrders(tenantId: string, start: Date, end: Date): Promise<Array<{ orderDate: Date }>>;
  countPendingDeliveries(tenantId: string): Promise<number>;
  countLowStockProducts(tenantId: string): Promise<number>;
  countExpiringVehicleDocuments(tenantId: string, today: Date, limit: Date): Promise<number>;
  countExpiringPersonnelDocuments(tenantId: string, today: Date, limit: Date): Promise<number>;
  findLowStockProducts(tenantId: string): Promise<Array<{ id: string; name: string; stockQuantity: number; minStockLevel: number; unit: string }>>;
  findRecentOrders(tenantId: string): Promise<Array<{ id: string; orderCode: string; status: string; grandTotal: unknown; orderDate: Date; customer: { fullName: string } }>>;
}

export function createDashboardRepository(): DashboardRepository {
  return {
    countTodayOrders(tenantId, start, end) { return prisma.order.count({ where: { tenantId, deletedAt: null, status: { not: "CANCELLED" }, orderDate: { gte: start, lt: end } } }); },
    countActiveCustomers(tenantId) { return prisma.customer.count({ where: { tenantId, deletedAt: null, isActive: true } }); },
    countActiveVehicles(tenantId) { return prisma.vehicle.count({ where: { tenantId, deletedAt: null, isActive: true, status: "ACTIVE" } }); },
    countActivePersonnel(tenantId) { return prisma.personnel.count({ where: { tenantId, deletedAt: null, isActive: true, status: "ACTIVE" } }); },
    sumTodayRevenue(tenantId, start, end) { return prisma.order.aggregate({ where: { tenantId, deletedAt: null, status: "DELIVERED", deliveredAt: { gte: start, lt: end } }, _sum: { grandTotal: true } }); },
    findWeekOrders(tenantId, start, end) { return prisma.order.findMany({ where: { tenantId, deletedAt: null, status: { not: "CANCELLED" }, orderDate: { gte: start, lt: end } }, select: { orderDate: true } }); },
    countPendingDeliveries(tenantId) { return prisma.order.count({ where: { tenantId, deletedAt: null, status: { in: ["PENDING", "CONFIRMED", "DELIVERING"] } } }); },
    countLowStockProducts(tenantId) { return prisma.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*)::bigint AS count FROM "Product" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL AND "isActive" = true AND "stockQuantity" <= "minStockLevel"`.then(([row]) => Number(row?.count ?? 0)); },
    countExpiringVehicleDocuments(tenantId, today, limit) { return prisma.vehicle.count({ where: { tenantId, deletedAt: null, isActive: true, OR: [{ inspectionDate: { gte: today, lte: limit } }, { insuranceDate: { gte: today, lte: limit } }] } }); },
    countExpiringPersonnelDocuments(tenantId, today, limit) { return prisma.personnel.count({ where: { tenantId, deletedAt: null, isActive: true, licenseExpiryDate: { gte: today, lte: limit } } }); },
    findLowStockProducts(tenantId) { return prisma.$queryRaw<Array<{ id: string; name: string; stockQuantity: number; minStockLevel: number; unit: string }>>`SELECT id, name, "stockQuantity", "minStockLevel", unit FROM "Product" WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL AND "isActive" = true AND "stockQuantity" <= "minStockLevel" ORDER BY ("minStockLevel" - "stockQuantity") DESC, name ASC LIMIT 5`; },
    findRecentOrders(tenantId) { return prisma.order.findMany({ where: { tenantId, deletedAt: null }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, orderCode: true, status: true, grandTotal: true, orderDate: true, customer: { select: { fullName: true } } } }); },
  };
}
