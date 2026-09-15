import {
  createDashboardRepository,
  type DashboardRepository,
} from "../repositories/dashboard.repository";

export interface DashboardSummary {
  todayOrders: number;
  activeCustomers: number;
  activeVehicles: number;
  activePersonnel: number;
  todayRevenue: number;
  todayExpenses: number;
  todayNetRevenue: number;
  weeklyOrders: Array<{ gun: string; satis: number }>;
  pendingDeliveries: number;
  lowStockProducts: number;
  expiringDocuments: number;
  criticalStock: Array<{
    id: string;
    name: string;
    stockQuantity: number;
    minStockLevel: number;
    unit: string;
  }>;
  recentOrders: Array<{
    id: string;
    orderCode: string;
    status: string;
    grandTotal: number;
    orderDate: Date;
    customerName: string;
  }>;
  routeOrders: Array<{
    id: string;
    orderCode: string;
    status: string;
    deliveryDate: Date | null;
    customer: {
      id: string;
      fullName: string;
      address: string | null;
      district: string | null;
      latitude: number | null;
      longitude: number | null;
    };
    vehicle: { id: string; plate: string } | null;
    personnel: { id: string; fullName: string } | null;
  }>;
  partnerOrders: Array<{
    id: string;
    name: string;
    code: string;
    orderCount: number;
  }>;
}
const dayLabels = [
  "Pazar",
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
];
function startOfDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function createDashboardService(
  repository: DashboardRepository = createDashboardRepository(),
) {
  return {
    async getSummary(tenantId: string): Promise<DashboardSummary> {
      const today = startOfDay(new Date());
      const tomorrow = new Date(today);
      tomorrow.setUTCDate(today.getUTCDate() + 1);
      const weekStart = new Date(today);
      weekStart.setUTCDate(today.getUTCDate() - 6);
      const documentLimit = new Date(today);
      documentLimit.setUTCDate(today.getUTCDate() + 30);
      const orders = await Promise.all([
        repository.countTodayOrders(tenantId, today, tomorrow),
        repository.countActiveCustomers(tenantId),
        repository.countActiveVehicles(tenantId),
        repository.countActivePersonnel(tenantId),
        repository.sumTodayRevenue(tenantId, today, tomorrow),
        repository.sumTodayExpenses(tenantId, today, tomorrow),
        repository.findWeekOrders(tenantId, weekStart, tomorrow),
        repository.countPendingDeliveries(tenantId),
        repository.countLowStockProducts(tenantId),
        repository.countExpiringVehicleDocuments(
          tenantId,
          today,
          documentLimit,
        ),
        repository.countExpiringPersonnelDocuments(
          tenantId,
          today,
          documentLimit,
        ),
        repository.findLowStockProducts(tenantId),
        repository.findRecentOrders(tenantId),
        repository.findTodayRouteOrders(tenantId, today, tomorrow),
        repository.findTodayPartnerOrders(tenantId, today, tomorrow),
      ]);
      const weeklyOrders = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(weekStart);
        date.setUTCDate(weekStart.getUTCDate() + index);
        return {
          gun: dayLabels[date.getUTCDay()],
          satis: orders[6].filter(
            (order) => startOfDay(order.orderDate).getTime() === date.getTime(),
          ).length,
        };
      });
      return {
        todayOrders: orders[0],
        activeCustomers: orders[1],
        activeVehicles: orders[2],
        activePersonnel: orders[3],
        todayRevenue: Number(orders[4]._sum.grandTotal ?? 0),
        todayExpenses: Number(orders[5]._sum.amount ?? 0),
        todayNetRevenue:
          Number(orders[4]._sum.grandTotal ?? 0) -
          Number(orders[5]._sum.amount ?? 0),
        weeklyOrders,
        pendingDeliveries: orders[7],
        lowStockProducts: orders[8],
        expiringDocuments: orders[9] + orders[10],
        criticalStock: orders[11],
        recentOrders: orders[12].map((order) => ({
          ...order,
          grandTotal: Number(order.grandTotal),
          customerName: order.customer.fullName,
        })),
        routeOrders: orders[13],
        partnerOrders: orders[14],
      };
    },
  };
}
