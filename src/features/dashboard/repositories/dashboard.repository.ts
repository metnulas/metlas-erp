import { prisma } from "@/lib/db/prisma";

export interface DashboardRepository {
  countTodayOrders(tenantId: string, start: Date, end: Date): Promise<number>;
  countActiveCustomers(tenantId: string): Promise<number>;
  countActiveVehicles(tenantId: string): Promise<number>;
  countActivePersonnel(tenantId: string): Promise<number>;
  sumTodayRevenue(tenantId: string, start: Date, end: Date): Promise<{ _sum: { grandTotal: unknown } }>;
  findWeekOrders(tenantId: string, start: Date, end: Date): Promise<Array<{ orderDate: Date }>>;
}

export function createDashboardRepository(): DashboardRepository {
  return {
    countTodayOrders(tenantId, start, end) { return prisma.order.count({ where: { tenantId, deletedAt: null, status: { not: "CANCELLED" }, orderDate: { gte: start, lt: end } } }); },
    countActiveCustomers(tenantId) { return prisma.customer.count({ where: { tenantId, deletedAt: null, isActive: true } }); },
    countActiveVehicles(tenantId) { return prisma.vehicle.count({ where: { tenantId, deletedAt: null, isActive: true, status: "ACTIVE" } }); },
    countActivePersonnel(tenantId) { return prisma.personnel.count({ where: { tenantId, deletedAt: null, isActive: true, status: "ACTIVE" } }); },
    sumTodayRevenue(tenantId, start, end) { return prisma.order.aggregate({ where: { tenantId, deletedAt: null, status: "DELIVERED", deliveredAt: { gte: start, lt: end } }, _sum: { grandTotal: true } }); },
    findWeekOrders(tenantId, start, end) { return prisma.order.findMany({ where: { tenantId, deletedAt: null, status: { not: "CANCELLED" }, orderDate: { gte: start, lt: end } }, select: { orderDate: true } }); },
  };
}
