import { createDashboardRepository, type DashboardRepository } from "../repositories/dashboard.repository";

export interface DashboardSummary { todayOrders: number; activeCustomers: number; activeVehicles: number; activePersonnel: number; todayRevenue: number; weeklyOrders: Array<{ gun: string; satis: number }>; }
const dayLabels = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
function startOfDay(date: Date) { return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())); }

export function createDashboardService(repository: DashboardRepository = createDashboardRepository()) {
  return {
    async getSummary(tenantId: string): Promise<DashboardSummary> {
      const today = startOfDay(new Date());
      const tomorrow = new Date(today); tomorrow.setUTCDate(today.getUTCDate() + 1);
      const weekStart = new Date(today); weekStart.setUTCDate(today.getUTCDate() - 6);
      const orders = await Promise.all([repository.countTodayOrders(tenantId, today, tomorrow), repository.countActiveCustomers(tenantId), repository.countActiveVehicles(tenantId), repository.countActivePersonnel(tenantId), repository.sumTodayRevenue(tenantId, today, tomorrow), repository.findWeekOrders(tenantId, weekStart, tomorrow)]);
      const weeklyOrders = Array.from({ length: 7 }, (_, index) => { const date = new Date(weekStart); date.setUTCDate(weekStart.getUTCDate() + index); return { gun: dayLabels[date.getUTCDay()], satis: orders[5].filter((order) => startOfDay(order.orderDate).getTime() === date.getTime()).length }; });
      return { todayOrders: orders[0], activeCustomers: orders[1], activeVehicles: orders[2], activePersonnel: orders[3], todayRevenue: Number(orders[4]._sum.grandTotal ?? 0), weeklyOrders };
    },
  };
}
