import { Prisma, type OrderStatus } from "@prisma/client";
import { AppError } from "@/server/errors/app-error";
import { createDeliveryRepository, type DeliveryOrder, type DeliveryRepository } from "../repositories/delivery.repository";
import type { AssignDeliveryInput, DeliveryQueryInput } from "../validators/delivery.schema";

export interface DeliveryService {
  list(tenantId: string, query: DeliveryQueryInput): Promise<DeliveryOrder[]>;
  getById(id: string, tenantId: string): Promise<DeliveryOrder>;
  assign(id: string, tenantId: string, input: AssignDeliveryInput, userId?: string): Promise<DeliveryOrder>;
}

function dateRange(date: string) {
  return { gte: new Date(`${date}T00:00:00.000Z`), lte: new Date(`${date}T23:59:59.999Z`) };
}

export function createDeliveryService(repository: DeliveryRepository = createDeliveryRepository()): DeliveryService {
  return {
    async list(tenantId, { date, status, includeUnscheduled }) {
      const where: Prisma.OrderWhereInput = { status: status ?? { in: ["PENDING", "CONFIRMED", "DELIVERING"] as OrderStatus[] } };
      if (date && includeUnscheduled) where.OR = [{ deliveryDate: dateRange(date) }, { deliveryDate: null }];
      else if (date) where.deliveryDate = dateRange(date);
      return repository.findMany(tenantId, where);
    },
    async getById(id, tenantId) {
      const order = await repository.findById(id, tenantId);
      if (!order) throw new AppError("Sipariş bulunamadı", 404, "ORDER_NOT_FOUND");
      return order;
    },
    async assign(id, tenantId, input, userId) {
      const order = await this.getById(id, tenantId);
      if (order.status === "DELIVERED" || order.status === "CANCELLED") throw new AppError("Teslim edilmiş veya iptal edilmiş siparişin dağıtımı değiştirilemez", 400, "DELIVERY_IMMUTABLE");
      if (input.vehicleId && !(await repository.findVehicle(input.vehicleId, tenantId))) throw new AppError("Aktif araç bulunamadı", 400, "VEHICLE_NOT_AVAILABLE");
      if (input.personnelId && !(await repository.findPersonnel(input.personnelId, tenantId))) throw new AppError("Aktif personel bulunamadı", 400, "PERSONNEL_NOT_AVAILABLE");
      const finalVehicleId = input.vehicleId === undefined ? order.vehicleId : input.vehicleId;
      const finalPersonnelId = input.personnelId === undefined ? order.personnelId : input.personnelId;
      if ((input.status === "DELIVERING" || input.status === "DELIVERED") && (!finalVehicleId || !finalPersonnelId)) throw new AppError("Teslimat için aktif araç ve personel atamalısınız", 400, "DELIVERY_ASSIGNMENT_REQUIRED");
      if (input.status === "DELIVERING" || input.status === "DELIVERED") {
        if (!(await repository.findVehicle(finalVehicleId as string, tenantId))) throw new AppError("Aktif araç bulunamadı", 400, "VEHICLE_NOT_AVAILABLE");
        if (!(await repository.findPersonnel(finalPersonnelId as string, tenantId))) throw new AppError("Aktif personel bulunamadı", 400, "PERSONNEL_NOT_AVAILABLE");
      }
      const data: Prisma.OrderUpdateInput = {
        ...(input.vehicleId !== undefined && { vehicle: input.vehicleId ? { connect: { id: input.vehicleId } } : { disconnect: true } }),
        ...(input.personnelId !== undefined && { personnel: input.personnelId ? { connect: { id: input.personnelId } } : { disconnect: true } }),
        ...(input.deliveryDate !== undefined && { deliveryDate: input.deliveryDate ? new Date(input.deliveryDate) : null }),
        ...(input.deliveryNotes !== undefined && { deliveryNotes: input.deliveryNotes || null }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.status === "DELIVERED" && { deliveredAt: new Date() }),
        ...(input.status && input.status !== "DELIVERED" && { deliveredAt: null }),
        updatedBy: userId ?? null,
      };
      try {
        return input.status === "DELIVERED" ? await repository.deliver(id, tenantId, data) : await repository.update(id, tenantId, data);
      } catch (error) {
        if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") throw new AppError("Teslimat için geçerli ürün bulunamadı", 400, "PRODUCT_NOT_FOUND");
        if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") throw new AppError("Teslimat için yeterli stok bulunmuyor", 400, "INSUFFICIENT_STOCK");
        throw error;
      }
    },
  };
}
