import { createDashboardRepository, type DashboardRepository } from "../repositories/dashboard.repository";

export interface DashboardSummary {
  todayOrders: number;
  activeCustomers: number;
  activeVehicles: number;
  activePersonnel: number;
  todayRevenue: number;
  weeklyOrders: Array<{ gun: string; satis: number }>;
  pendingDeliveries: number;
  lowStockProducts: number;
  expiringDocuments: number;
  criticalStock: Array<{ id: string; name: string; stockQuantity: number; minStockLevel: number; unit: string }>;
   recentOrders: Array<{ id: string; orderCode: string; status: string; grandTotal: number; orderDate: Date; customerName: string }>;
  routeOrders: Array<{ id: string; orderCode: string; status: string; deliveryDate: Date | null; customer: { id: string; fullName: string; address: string | null; district: string | null; latitude: number | null; longitude: number | null }; vehicle: { id: string; plate: string } | null; personnel: { id: string; fullName: string } | null }>;
}
const dayLabels = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
function startOfDay(date: Date) { return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())); }

export function createDashboardService(repository: DashboardRepository = createDashboardRepository()) {
  return {
    async getSummary(tenantId: string): Promise<DashboardSummary> {
      const today = startOfDay(new Date());
      const tomorrow = new Date(today); tomorrow.setUTCDate(today.getUTCDate() + 1);
      const weekStart = new Date(today); weekStart.setUTCDate(today.getUTCDate() - 6);
      const documentLimit = new Date(today); documentLimit.setUTCDate(today.getUTCDate() + 30);
      const orders = await Promise.all([
        repository.countTodayOrders(tenantId, today, tomorrow),
        repository.countActiveCustomers(tenantId),
        repository.countActiveVehicles(tenantId),
        repository.countActivePersonnel(tenantId),
        repository.sumTodayRevenue(tenantId, today, tomorrow),
        repository.findWeekOrders(tenantId, weekStart, tomorrow),
        repository.countPendingDeliveries(tenantId),
        repository.countLowStockProducts(tenantId),
        repository.countExpiringVehicleDocuments(tenantId, today, documentLimit),
        repository.countExpiringPersonnelDocuments(tenantId, today, documentLimit),
        repository.findLowStockProducts(tenantId),
        repository.findRecentOrders(tenantId),
        repository.findTodayRouteOrders(tenantId, today, tomorrow),
      ]);
      const weeklyOrders = Array.from({ length: 7 }, (_, index) => { const date = new Date(weekStart); date.setUTCDate(weekStart.getUTCDate() + index); return { gun: dayLabels[date.getUTCDay()], satis: orders[5].filter((order) => startOfDay(order.orderDate).getTime() === date.getTime()).length }; });
      return {
        todayOrders: orders[0], activeCustomers: orders[1], activeVehicles: orders[2], activePersonnel: orders[3],
        todayRevenue: Number(orders[4]._sum.grandTotal ?? 0), weeklyOrders,
        pendingDeliveries: orders[6], lowStockProducts: orders[7], expiringDocuments: orders[8] + orders[9],
        criticalStock: orders[10], recentOrders: orders[11].map((order) => ({ ...order, grandTotal: Number(order.grandTotal), customerName: order.customer.fullName })), routeOrders: orders[12],
      };
    },
  };
}
