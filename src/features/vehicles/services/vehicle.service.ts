import { Prisma, type Vehicle } from "@prisma/client";
import { AppError } from "@/server/errors/app-error";
import { createVehicleRepository, type VehicleRepository, type AssignedVehicleOrder } from "../repositories/vehicle.repository";
import type { CreateVehicleOutput, UpdateVehicleOutput, VehicleQueryInput } from "../validators/vehicle.schema";

export interface PaginatedVehicles { data: Vehicle[]; total: number; page: number; pageSize: number; totalPages: number; }

export interface VehicleService {
  list(tenantId: string, query: VehicleQueryInput): Promise<PaginatedVehicles>;
  getById(id: string, tenantId: string): Promise<Vehicle>;
  create(tenantId: string, input: CreateVehicleOutput, userId?: string): Promise<Vehicle>;
  update(id: string, tenantId: string, input: UpdateVehicleOutput, userId?: string): Promise<Vehicle>;
  softDelete(id: string, tenantId: string): Promise<Vehicle>;
  getAssignedOrders(id: string, tenantId: string): Promise<AssignedVehicleOrder[]>;
}

function buildSortOrder(sort: VehicleQueryInput["sort"], order: VehicleQueryInput["order"]): Prisma.VehicleOrderByWithRelationInput {
  const fieldMap: Record<string, Prisma.VehicleOrderByWithRelationInput> = {
    code: { code: order }, plate: { plate: order }, type: { type: order }, mileage: { mileage: order }, createdAt: { createdAt: order },
  };
  return fieldMap[sort] ?? { createdAt: "desc" };
}

export function createVehicleService(repository: VehicleRepository = createVehicleRepository()): VehicleService {
  return {
    async list(tenantId, { page, pageSize, search, type, status, sort, order }) {
      const where: Prisma.VehicleWhereInput = { tenantId, deletedAt: null };
      if (type) where.type = type;
      if (status) where.status = status;
      if (search) where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { plate: { contains: search, mode: "insensitive" } },
        { type: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
      ];
      const [data, total] = await Promise.all([
        repository.findMany({ where, orderBy: buildSortOrder(sort, order), skip: (page - 1) * pageSize, take: pageSize }),
        repository.count(where),
      ]);
      return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    },
    async getById(id, tenantId) {
      const vehicle = await repository.findById(id, tenantId);
      if (!vehicle) throw new AppError("Araç bulunamadı", 404, "VEHICLE_NOT_FOUND");
      return vehicle;
    },
    async create(tenantId, input, userId) {
      if (await repository.findByCode(input.code, tenantId)) throw new AppError("Bu araç kodu zaten kullanılıyor", 409, "VEHICLE_CODE_EXISTS");
      if (await repository.findByPlate(input.plate, tenantId)) throw new AppError("Bu plaka zaten kayıtlı", 409, "VEHICLE_PLATE_EXISTS");
      return repository.create({
        code: input.code, plate: input.plate.toUpperCase(), type: input.type, brand: input.brand || null, model: input.model || null,
        modelYear: input.modelYear ?? null, capacity: input.capacity, capacityUnit: input.capacityUnit,
        mileage: input.mileage, status: input.status, inspectionDate: input.inspectionDate ? new Date(input.inspectionDate) : null,
        insuranceDate: input.insuranceDate ? new Date(input.insuranceDate) : null, notes: input.notes || null,
        tenant: { connect: { id: tenantId } }, createdBy: userId ?? null, updatedBy: userId ?? null,
      });
    },
    async update(id, tenantId, input, userId) {
      const vehicle = await repository.findById(id, tenantId);
      if (!vehicle) throw new AppError("Araç bulunamadı", 404, "VEHICLE_NOT_FOUND");
      if (input.code && input.code !== vehicle.code && await repository.findByCode(input.code, tenantId)) throw new AppError("Bu araç kodu zaten kullanılıyor", 409, "VEHICLE_CODE_EXISTS");
      if (input.plate && input.plate.toUpperCase() !== vehicle.plate && await repository.findByPlate(input.plate.toUpperCase(), tenantId)) throw new AppError("Bu plaka zaten kayıtlı", 409, "VEHICLE_PLATE_EXISTS");
      const data: Prisma.VehicleUpdateInput = {
        ...(input.code !== undefined && { code: input.code }), ...(input.plate !== undefined && { plate: input.plate.toUpperCase() }),
        ...(input.type !== undefined && { type: input.type }), ...(input.brand !== undefined && { brand: input.brand || null }),
        ...(input.model !== undefined && { model: input.model || null }), ...(input.modelYear !== undefined && { modelYear: input.modelYear ?? null }),
        ...(input.capacity !== undefined && { capacity: input.capacity }), ...(input.capacityUnit !== undefined && { capacityUnit: input.capacityUnit }),
        ...(input.mileage !== undefined && { mileage: input.mileage }), ...(input.status !== undefined && { status: input.status }),
        ...(input.inspectionDate !== undefined && { inspectionDate: input.inspectionDate ? new Date(input.inspectionDate) : null }),
        ...(input.insuranceDate !== undefined && { insuranceDate: input.insuranceDate ? new Date(input.insuranceDate) : null }),
        ...(input.notes !== undefined && { notes: input.notes || null }), updatedBy: userId ?? null,
      };
      return repository.update(id, tenantId, data);
    },
    async softDelete(id, tenantId) {
      await this.getById(id, tenantId);
      return repository.softDelete(id, tenantId);
    },
    async getAssignedOrders(id, tenantId) {
      await this.getById(id, tenantId);
      return repository.findAssignedOrders(id, tenantId);
    },
  };
}
