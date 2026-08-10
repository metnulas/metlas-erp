import { Prisma, type Personnel } from "@prisma/client";
import { AppError } from "@/server/errors/app-error";
import { createPersonnelRepository, type PersonnelRepository } from "../repositories/personnel.repository";
import type { CreatePersonnelOutput, PersonnelQueryInput, UpdatePersonnelOutput } from "../validators/personnel.schema";
import { recordAudit } from "@/server/audit/audit-log";
import { nextTenantCode } from "@/server/codes/auto-code";

export interface PaginatedPersonnel { data: Personnel[]; total: number; page: number; pageSize: number; totalPages: number; }
export interface PersonnelService {
  list(tenantId: string, query: PersonnelQueryInput): Promise<PaginatedPersonnel>;
  getById(id: string, tenantId: string): Promise<Personnel>;
  create(tenantId: string, input: CreatePersonnelOutput, userId?: string): Promise<Personnel>;
  update(id: string, tenantId: string, input: UpdatePersonnelOutput, userId?: string): Promise<Personnel>;
  softDelete(id: string, tenantId: string, userId?: string): Promise<Personnel>;
}

function buildSortOrder(sort: PersonnelQueryInput["sort"], order: PersonnelQueryInput["order"]): Prisma.PersonnelOrderByWithRelationInput {
  const fields: Record<string, Prisma.PersonnelOrderByWithRelationInput> = { employeeCode: { employeeCode: order }, fullName: { fullName: order }, position: { position: order }, createdAt: { createdAt: order } };
  return fields[sort] ?? { createdAt: "desc" };
}

function optionalDate(value?: string) { return value ? new Date(value) : null; }

export function createPersonnelService(repository: PersonnelRepository = createPersonnelRepository()): PersonnelService {
  return {
    async list(tenantId, { page, pageSize, search, position, status, sort, order }) {
      const where: Prisma.PersonnelWhereInput = { tenantId, deletedAt: null };
      if (position) where.position = position;
      if (status) where.status = status;
      if (search) where.OR = [{ employeeCode: { contains: search, mode: "insensitive" } }, { fullName: { contains: search, mode: "insensitive" } }, { phone: { contains: search } }, { position: { contains: search, mode: "insensitive" } }];
      const [data, total] = await Promise.all([repository.findMany({ where, orderBy: buildSortOrder(sort, order), skip: (page - 1) * pageSize, take: pageSize }), repository.count(where)]);
      return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    },
    async getById(id, tenantId) { const personnel = await repository.findById(id, tenantId); if (!personnel) throw new AppError("Personel bulunamadı", 404, "PERSONNEL_NOT_FOUND"); return personnel; },
    async create(tenantId, input, userId) {
      const employeeCode = input.employeeCode || await nextTenantCode("PER", await repository.count({ tenantId }), (candidate) => repository.findByCode(candidate, tenantId).then(Boolean));
      if (await repository.findByCode(employeeCode, tenantId)) throw new AppError("Bu personel kodu zaten kullanılıyor", 409, "PERSONNEL_CODE_EXISTS");
      const personnel = await repository.create({ employeeCode, fullName: input.fullName, phone: input.phone, email: input.email || null, position: input.position, licenseNumber: input.licenseNumber || null, licenseClass: input.licenseClass || null, licenseExpiryDate: optionalDate(input.licenseExpiryDate), hireDate: optionalDate(input.hireDate), status: input.status, notes: input.notes || null, tenant: { connect: { id: tenantId } }, createdBy: userId ?? null, updatedBy: userId ?? null });
      await recordAudit({ tenantId, actorId: userId, action: "CREATE", entityType: "Personnel", entityId: personnel.id });
      return personnel;
    },
    async update(id, tenantId, input, userId) {
      const personnel = await this.getById(id, tenantId);
      if (input.employeeCode && input.employeeCode !== personnel.employeeCode && await repository.findByCode(input.employeeCode, tenantId)) throw new AppError("Bu personel kodu zaten kullanılıyor", 409, "PERSONNEL_CODE_EXISTS");
      const data: Prisma.PersonnelUpdateInput = {
        ...(input.employeeCode !== undefined && { employeeCode: input.employeeCode }), ...(input.fullName !== undefined && { fullName: input.fullName }), ...(input.phone !== undefined && { phone: input.phone }),
        ...(input.email !== undefined && { email: input.email || null }), ...(input.position !== undefined && { position: input.position }), ...(input.licenseNumber !== undefined && { licenseNumber: input.licenseNumber || null }),
        ...(input.licenseClass !== undefined && { licenseClass: input.licenseClass || null }), ...(input.licenseExpiryDate !== undefined && { licenseExpiryDate: optionalDate(input.licenseExpiryDate) }),
        ...(input.hireDate !== undefined && { hireDate: optionalDate(input.hireDate) }), ...(input.status !== undefined && { status: input.status }), ...(input.notes !== undefined && { notes: input.notes || null }), updatedBy: userId ?? null,
      };
      const updated = await repository.update(id, tenantId, data);
      await recordAudit({ tenantId, actorId: userId, action: "UPDATE", entityType: "Personnel", entityId: id });
      return updated;
    },
    async softDelete(id, tenantId, userId) { await this.getById(id, tenantId); const deleted = await repository.softDelete(id, tenantId); await recordAudit({ tenantId, actorId: userId, action: "DELETE", entityType: "Personnel", entityId: id }); return deleted; },
  };
}
