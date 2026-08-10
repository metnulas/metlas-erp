import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import type { RouteHistoryInput } from "../validators/route-history.schema";

const DEFAULT_FUEL_PRICE = 50;
const DEFAULT_CONSUMPTION = 12;

function routeDateRange(routeDate: string) {
  const start = new Date(`${routeDate}T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export async function saveRouteHistory(tenantId: string, input: RouteHistoryInput) {
  const { start, end } = routeDateRange(input.routeDate);
  const fuelPricePerLiter = input.fuelPricePerLiter ?? Number(process.env.ROUTE_FUEL_PRICE_PER_LITER ?? DEFAULT_FUEL_PRICE);
  const consumption = Number(process.env.ROUTE_FUEL_CONSUMPTION_L_PER_100KM ?? DEFAULT_CONSUMPTION);
  const existing = await prisma.routeHistory.findUnique({ where: { tenantId_routeDate: { tenantId, routeDate: start } }, select: { distanceKm: true, stops: true } });
  const previousStops = Array.isArray(existing?.stops) ? existing.stops as RouteHistoryInput["stops"] : [];
  const stops = [...previousStops, ...input.stops].filter((stop, index, all) => all.findIndex((candidate) => candidate.orderId === stop.orderId) === index);
  const distanceKm = Math.max(existing?.distanceKm ?? 0, input.distanceKm);
  const finalFuelLiters = distanceKm * consumption / 100;
  const finalFuelCost = finalFuelLiters * fuelPricePerLiter;
  const revenue = await prisma.order.aggregate({
    where: { tenantId, deletedAt: null, status: "DELIVERED", deliveredAt: { gte: start, lt: end } },
    _sum: { grandTotal: true },
  });

  return prisma.routeHistory.upsert({
    where: { tenantId_routeDate: { tenantId, routeDate: start } },
    create: {
      tenantId,
      routeDate: start,
      distanceKm,
      estimatedFuelLiters: finalFuelLiters,
      fuelPricePerLiter,
      estimatedFuelCost: finalFuelCost,
      revenue: revenue._sum.grandTotal ?? 0,
      orderCount: stops.length,
      stops: stops as Prisma.InputJsonValue,
    },
    update: {
      distanceKm,
      estimatedFuelLiters: finalFuelLiters,
      fuelPricePerLiter,
      estimatedFuelCost: finalFuelCost,
      revenue: revenue._sum.grandTotal ?? 0,
      orderCount: stops.length,
      stops: stops as Prisma.InputJsonValue,
    },
  });
}

export function listRouteHistories(tenantId: string) {
  return prisma.routeHistory.findMany({ where: { tenantId }, orderBy: { routeDate: "desc" }, take: 365 });
}
