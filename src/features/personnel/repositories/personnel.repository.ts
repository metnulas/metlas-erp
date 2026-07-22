import { prisma } from "@/lib/db/prisma";
import { Prisma, type Personnel } from "@prisma/client";

export interface PersonnelRepository {
  findMany(params: { where: Prisma.PersonnelWhereInput; orderBy?: Prisma.PersonnelOrderByWithRelationInput; skip?: number; take?: number }): Promise<Personnel[]>;
  count(where: Prisma.PersonnelWhereInput): Promise<number>;
  findById(id: string, tenantId: string): Promise<Personnel | null>;
  findByCode(employeeCode: string, tenantId: string): Promise<Personnel | null>;
  create(data: Prisma.PersonnelCreateInput): Promise<Personnel>;
  update(id: string, tenantId: string, data: Prisma.PersonnelUpdateInput): Promise<Personnel>;
  softDelete(id: string, tenantId: string): Promise<Personnel>;
}

export function createPersonnelRepository(): PersonnelRepository {
  return {
    async findMany({ where, orderBy, skip, take }) { return prisma.personnel.findMany({ where, orderBy: orderBy ?? { createdAt: "desc" }, skip, take }); },
    async count(where) { return prisma.personnel.count({ where }); },
    async findById(id, tenantId) { return prisma.personnel.findFirst({ where: { id, tenantId, deletedAt: null } }); },
    async findByCode(employeeCode, tenantId) { return prisma.personnel.findFirst({ where: { employeeCode, tenantId, deletedAt: null } }); },
    async create(data) { return prisma.personnel.create({ data }); },
    async update(id, tenantId, data) { return prisma.personnel.update({ where: { id, tenantId }, data }); },
    async softDelete(id, tenantId) { return prisma.personnel.update({ where: { id, tenantId }, data: { deletedAt: new Date(), isActive: false, status: "INACTIVE" } }); },
  };
}
