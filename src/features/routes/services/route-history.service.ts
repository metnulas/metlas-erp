import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import type { RouteHistoryInput } from "../validators/route-history.schema";
import { AppError } from "@/server/errors/app-error";

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
  const existing = await prisma.routeHistory.findUnique({ where: { tenantId_routeDate: { tenantId, routeDate: start } }, select: { distanceKm: true, actualDistanceKm: true, stops: true } });
  const previousStops = Array.isArray(existing?.stops) ? existing.stops as RouteHistoryInput["stops"] : [];
  const stops = [...previousStops, ...input.stops].filter((stop, index, all) => all.findIndex((candidate) => candidate.orderId === stop.orderId) === index);
  const distanceKm = existing?.actualDistanceKm ?? Math.max(existing?.distanceKm ?? 0, input.distanceKm);
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

type DeliveryLocation = { latitude: number; longitude: number };

function haversineKm(from: DeliveryLocation, to: DeliveryLocation) {
  const earthRadius = 6371;
  const latitudeDelta = (to.latitude - from.latitude) * Math.PI / 180;
  const longitudeDelta = (to.longitude - from.longitude) * Math.PI / 180;
  const value = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(from.latitude * Math.PI / 180) * Math.cos(to.latitude * Math.PI / 180) * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

async function drivingDistanceKm(from: DeliveryLocation, to: DeliveryLocation) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?overview=false`, { signal: controller.signal });
    if (!response.ok) throw new Error(`OSRM_${response.status}`);
    const result = await response.json() as { routes?: Array<{ distance?: number }> };
    const distance = result.routes?.[0]?.distance;
    if (!distance || distance < 0) throw new Error("OSRM_DISTANCE_MISSING");
    return distance / 1000;
  } catch {
    return haversineKm(from, to);
  } finally {
    clearTimeout(timeout);
  }
}

export async function recordActualDeliveryDistance(tenantId: string, input: {
  orderId: string;
  orderCode: string;
  customerName: string;
  customerLatitude: number | null;
  customerLongitude: number | null;
  deliveryLocation?: DeliveryLocation;
  routeStartLocation?: DeliveryLocation;
  routeDate: Date;
}) {
  const destination = input.deliveryLocation ?? (input.customerLatitude !== null && input.customerLongitude !== null ? { latitude: input.customerLatitude, longitude: input.customerLongitude } : null);
  if (!destination) return null;
  const routeDate = new Date(Date.UTC(input.routeDate.getUTCFullYear(), input.routeDate.getUTCMonth(), input.routeDate.getUTCDate()));
  const existing = await prisma.routeHistory.findUnique({ where: { tenantId_routeDate: { tenantId, routeDate } } });
  const previous = existing?.lastLatitude !== null && existing?.lastLatitude !== undefined && existing.lastLongitude !== null && existing.lastLongitude !== undefined
    ? { latitude: existing.lastLatitude, longitude: existing.lastLongitude }
    : input.routeStartLocation ?? destination;
  const segmentDistance = await drivingDistanceKm(previous, destination);
  const actualDistanceKm = (existing?.actualDistanceKm ?? 0) + segmentDistance;
  const fuelPricePerLiter = Number(existing?.fuelPricePerLiter ?? process.env.ROUTE_FUEL_PRICE_PER_LITER ?? DEFAULT_FUEL_PRICE);
  const consumption = Number(process.env.ROUTE_FUEL_CONSUMPTION_L_PER_100KM ?? DEFAULT_CONSUMPTION);
  const stops = Array.isArray(existing?.stops) ? existing.stops as Array<Record<string, unknown>> : [];
  const actualStop = { orderId: input.orderId, orderCode: input.orderCode, customerName: input.customerName, latitude: destination.latitude, longitude: destination.longitude, actualLatitude: destination.latitude, actualLongitude: destination.longitude, deliveredAt: new Date().toISOString() };
  const mergedStops = [...stops.filter((stop) => stop.orderId !== input.orderId), actualStop];
  return prisma.routeHistory.upsert({
    where: { tenantId_routeDate: { tenantId, routeDate } },
    create: { tenantId, routeDate, distanceKm: actualDistanceKm, actualDistanceKm, actualStartLatitude: input.routeStartLocation?.latitude ?? destination.latitude, actualStartLongitude: input.routeStartLocation?.longitude ?? destination.longitude, lastLatitude: destination.latitude, lastLongitude: destination.longitude, distanceSource: "GPS_OSRM", estimatedFuelLiters: actualDistanceKm * consumption / 100, fuelPricePerLiter, estimatedFuelCost: actualDistanceKm * consumption / 100 * fuelPricePerLiter, revenue: 0, orderCount: mergedStops.length, stops: mergedStops as Prisma.InputJsonValue },
    update: { distanceKm: actualDistanceKm, actualDistanceKm, lastLatitude: destination.latitude, lastLongitude: destination.longitude, distanceSource: "GPS_OSRM", estimatedFuelLiters: actualDistanceKm * consumption / 100, estimatedFuelCost: actualDistanceKm * consumption / 100 * fuelPricePerLiter, orderCount: mergedStops.length, stops: mergedStops as Prisma.InputJsonValue },
  });
}

export function listRouteHistories(tenantId: string) {
  return prisma.routeHistory.findMany({ where: { tenantId }, orderBy: { routeDate: "desc" }, take: 365 });
}

export async function updateRouteFuelPrice(tenantId: string, id: string, fuelPricePerLiter: number) {
  const history = await prisma.routeHistory.findFirst({ where: { id, tenantId } });
  if (!history) throw new AppError("Rota geçmişi bulunamadı", 404, "ROUTE_HISTORY_NOT_FOUND");
  const estimatedFuelCost = history.estimatedFuelLiters * fuelPricePerLiter;
  return prisma.routeHistory.update({ where: { id }, data: { fuelPricePerLiter, estimatedFuelCost } });
}
