import { Prisma, type OrderStatus } from "@prisma/client";
import { AppError } from "@/server/errors/app-error";
import { createDeliveryRepository, type DeliveryOrder, type DeliveryRepository } from "../repositories/delivery.repository";
import type { AssignDeliveryInput, DeliveryQueryInput } from "../validators/delivery.schema";
import { recordAudit } from "@/server/audit/audit-log";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TRANSITIONS } from "@/shared/constants/order-status";

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
       if (input.status && !ORDER_STATUS_TRANSITIONS[order.status].includes(input.status)) { const allowed = ORDER_STATUS_TRANSITIONS[order.status].filter((status) => status !== order.status).map((status) => ORDER_STATUS_LABELS[status]).join(", "); throw new AppError(allowed ? `Bu sipariş için geçerli sonraki durumlar: ${allowed}` : "Bu sipariş artık durum değişikliğine kapalı", 400, "ORDER_STATUS_TRANSITION_INVALID"); }
      if (input.vehicleId && !(await repository.findVehicle(input.vehicleId, tenantId))) throw new AppError("Aktif araç bulunamadı", 400, "VEHICLE_NOT_AVAILABLE");
      if (input.personnelId && !(await repository.findPersonnel(input.personnelId, tenantId))) throw new AppError("Aktif personel bulunamadı", 400, "PERSONNEL_NOT_AVAILABLE");
       const shouldAutoAssign = input.status === "CONFIRMED" || input.status === "DELIVERING" || input.status === "DELIVERED";
      const targetDate = input.deliveryDate ? new Date(input.deliveryDate) : order.deliveryDate ?? new Date();
      let finalVehicleId = input.vehicleId === undefined ? order.vehicleId : input.vehicleId;
      let finalPersonnelId = input.personnelId === undefined ? order.personnelId : input.personnelId;
      let autoAssignedVehicle = false;
      let autoAssignedPersonnel = false;
      if (shouldAutoAssign && input.vehicleId === undefined && !finalVehicleId) {
        const vehicle = await repository.findLeastBusyVehicle(tenantId, targetDate, id);
        if (!vehicle) throw new AppError("Müsait aktif araç bulunamadı", 400, "VEHICLE_NOT_AVAILABLE");
        finalVehicleId = vehicle.id;
        autoAssignedVehicle = true;
      }
      if (shouldAutoAssign && input.personnelId === undefined && !finalPersonnelId) {
        const person = await repository.findLeastBusyPersonnel(tenantId, targetDate, id);
        if (!person) throw new AppError("Müsait aktif personel bulunamadı", 400, "PERSONNEL_NOT_AVAILABLE");
        finalPersonnelId = person.id;
        autoAssignedPersonnel = true;
      }
      if ((input.status === "DELIVERING" || input.status === "DELIVERED") && (!finalVehicleId || !finalPersonnelId)) throw new AppError("Teslimat için aktif araç ve personel atamalısınız", 400, "DELIVERY_ASSIGNMENT_REQUIRED");
      if (input.status === "DELIVERING" || input.status === "DELIVERED") {
        if (!(await repository.findVehicle(finalVehicleId as string, tenantId))) throw new AppError("Aktif araç bulunamadı", 400, "VEHICLE_NOT_AVAILABLE");
        if (!(await repository.findPersonnel(finalPersonnelId as string, tenantId))) throw new AppError("Aktif personel bulunamadı", 400, "PERSONNEL_NOT_AVAILABLE");
      }
      const data: Prisma.OrderUpdateInput = {
        ...((input.vehicleId !== undefined || autoAssignedVehicle) && { vehicle: finalVehicleId ? { connect: { id: finalVehicleId } } : { disconnect: true } }),
        ...((input.personnelId !== undefined || autoAssignedPersonnel) && { personnel: finalPersonnelId ? { connect: { id: finalPersonnelId } } : { disconnect: true } }),
        ...(input.deliveryDate !== undefined && { deliveryDate: input.deliveryDate ? new Date(input.deliveryDate) : null }),
        ...(input.deliveryNotes !== undefined && { deliveryNotes: input.deliveryNotes || null }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.status === "DELIVERED" && { deliveredAt: new Date() }),
        ...(input.status && input.status !== "DELIVERED" && { deliveredAt: null }),
        updatedBy: userId ?? null,
      };
      try {
        const updated = input.status === "DELIVERED" ? await repository.deliver(id, tenantId, data) : await repository.update(id, tenantId, data);
         await recordAudit({ tenantId, actorId: userId, action: input.status === "DELIVERED" ? "DELIVER" : "ASSIGN", entityType: "Order", entityId: id, metadata: { vehicleId: finalVehicleId ?? null, personnelId: finalPersonnelId ?? null, status: input.status ?? null, autoAssignedVehicle, autoAssignedPersonnel } });
        return updated;
      } catch (error) {
        if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") throw new AppError("Teslimat için geçerli ürün bulunamadı", 400, "PRODUCT_NOT_FOUND");
        if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") throw new AppError("Teslimat için yeterli stok bulunmuyor", 400, "INSUFFICIENT_STOCK");
        throw error;
      }
    },
  };
}
