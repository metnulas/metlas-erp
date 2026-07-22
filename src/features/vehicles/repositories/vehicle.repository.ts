import { prisma } from "@/lib/db/prisma";
import { Prisma, type Vehicle } from "@prisma/client";

export interface FindManyParams {
  where: Prisma.VehicleWhereInput;
  orderBy?: Prisma.VehicleOrderByWithRelationInput;
  skip?: number;
  take?: number;
}

export interface VehicleRepository {
  findMany(params: FindManyParams): Promise<Vehicle[]>;
  count(where: Prisma.VehicleWhereInput): Promise<number>;
  findById(id: string, tenantId: string): Promise<Vehicle | null>;
  findByCode(code: string, tenantId: string): Promise<Vehicle | null>;
  findByPlate(plate: string, tenantId: string): Promise<Vehicle | null>;
  create(data: Prisma.VehicleCreateInput): Promise<Vehicle>;
  update(id: string, tenantId: string, data: Prisma.VehicleUpdateInput): Promise<Vehicle>;
  softDelete(id: string, tenantId: string): Promise<Vehicle>;
}

export function createVehicleRepository(): VehicleRepository {
  return {
    async findMany({ where, orderBy, skip, take }) {
      return prisma.vehicle.findMany({ where, orderBy: orderBy ?? { createdAt: "desc" }, skip, take });
    },
    async count(where) { return prisma.vehicle.count({ where }); },
    async findById(id, tenantId) { return prisma.vehicle.findFirst({ where: { id, tenantId, deletedAt: null } }); },
    async findByCode(code, tenantId) { return prisma.vehicle.findFirst({ where: { code, tenantId, deletedAt: null } }); },
    async findByPlate(plate, tenantId) { return prisma.vehicle.findFirst({ where: { plate, tenantId, deletedAt: null } }); },
    async create(data) { return prisma.vehicle.create({ data }); },
    async update(id, tenantId, data) { return prisma.vehicle.update({ where: { id, tenantId }, data }); },
    async softDelete(id, tenantId) { return prisma.vehicle.update({ where: { id, tenantId }, data: { deletedAt: new Date(), isActive: false, status: "INACTIVE" } }); },
  };
}
