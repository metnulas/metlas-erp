import { AppError } from "@/server/errors/app-error";
import {
  createCustomerRepository,
  type CustomerRepository,
} from "../repositories/customer.repository";
import type {
  CustomerQueryInput,
} from "../validators/customer.schema";
import { Prisma, type Customer } from "@prisma/client";

export interface PaginatedCustomers {
  data: Customer[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateCustomerData {
  customerCode: string;
  fullName: string;
  phone: string;
  phone2?: string;
  email?: string;
  address?: string;
  city?: string;
  district?: string;
  location?: string;
  balance?: number;
  depositBottleCount?: number;
  emptyBottleCount?: number;
  notes?: string;
}

export interface UpdateCustomerData {
  customerCode?: string;
  fullName?: string;
  phone?: string;
  phone2?: string;
  email?: string;
  address?: string;
  city?: string;
  district?: string;
  location?: string;
  balance?: number;
  depositBottleCount?: number;
  emptyBottleCount?: number;
  notes?: string;
}

export interface CustomerService {
  list(tenantId: string, query: CustomerQueryInput): Promise<PaginatedCustomers>;
  getById(id: string, tenantId: string): Promise<Customer>;
  create(tenantId: string, input: CreateCustomerData, userId?: string): Promise<Customer>;
  update(
    id: string,
    tenantId: string,
    input: UpdateCustomerData,
    userId?: string
  ): Promise<Customer>;
  softDelete(id: string, tenantId: string): Promise<Customer>;
}

function buildSortOrder(
  sort: CustomerQueryInput["sort"],
  order: CustomerQueryInput["order"]
): Prisma.CustomerOrderByWithRelationInput {
  const fieldMap: Record<string, Prisma.CustomerOrderByWithRelationInput> = {
    createdAt: { createdAt: order },
    fullName: { fullName: order },
    customerCode: { customerCode: order },
    balance: { balance: order },
  };
  return fieldMap[sort] ?? { createdAt: "desc" };
}

export function createCustomerService(
  repository: CustomerRepository = createCustomerRepository()
): CustomerService {
  return {
    async list(tenantId, { page, pageSize, search, isActive, city, sort, order }) {
      const where: Prisma.CustomerWhereInput = {
        tenantId,
        deletedAt: null,
      };

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (city) {
        where.city = city;
      }

      if (search) {
        where.OR = [
          { fullName: { contains: search, mode: "insensitive" } },
          { customerCode: { contains: search, mode: "insensitive" } },
          { phone: { contains: search } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      const orderBy = buildSortOrder(sort, order);
      const skip = (page - 1) * pageSize;

      const [data, total] = await Promise.all([
        repository.findMany({ where, orderBy, skip, take: pageSize }),
        repository.count(where),
      ]);

      return {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    },

    async getById(id, tenantId) {
      const customer = await repository.findById(id, tenantId);
      if (!customer) {
        throw new AppError("Müşteri bulunamadı", 404, "CUSTOMER_NOT_FOUND");
      }
      return customer;
    },

    async create(tenantId, input, userId) {
      const existing = await repository.findByCode(input.customerCode, tenantId);
      if (existing) {
        throw new AppError("Bu müşteri kodu zaten kullanılıyor", 409, "CUSTOMER_CODE_EXISTS");
      }

      return repository.create({
        customerCode: input.customerCode,
        fullName: input.fullName,
        phone: input.phone,
        phone2: input.phone2 || null,
        email: input.email || null,
        address: input.address || null,
        city: input.city || null,
        district: input.district || null,
        location: input.location || null,
        balance: input.balance ?? 0,
        depositBottleCount: input.depositBottleCount ?? 0,
        emptyBottleCount: input.emptyBottleCount ?? 0,
        notes: input.notes || null,
        tenant: { connect: { id: tenantId } },
        createdBy: userId ?? null,
        updatedBy: userId ?? null,
      });
    },

    async update(id, tenantId, input, userId) {
      const customer = await repository.findById(id, tenantId);
      if (!customer) {
        throw new AppError("Müşteri bulunamadı", 404, "CUSTOMER_NOT_FOUND");
      }

      if (input.customerCode && input.customerCode !== customer.customerCode) {
        const existing = await repository.findByCode(input.customerCode, tenantId);
        if (existing) {
          throw new AppError("Bu müşteri kodu zaten kullanılıyor", 409, "CUSTOMER_CODE_EXISTS");
        }
      }

      const updateData: Prisma.CustomerUpdateInput = {
        ...(input.customerCode !== undefined && { customerCode: input.customerCode }),
        ...(input.fullName !== undefined && { fullName: input.fullName }),
        ...(input.phone !== undefined && { phone: input.phone }),
        phone2: input.phone2 ?? null,
        email: input.email ?? null,
        address: input.address ?? null,
        city: input.city ?? null,
        district: input.district ?? null,
        location: input.location ?? null,
        notes: input.notes ?? null,
        updatedBy: userId ?? null,
      };

      return repository.update(id, updateData);
    },

    async softDelete(id, tenantId) {
      const customer = await repository.findById(id, tenantId);
      if (!customer) {
        throw new AppError("Müşteri bulunamadı", 404, "CUSTOMER_NOT_FOUND");
      }

      return repository.softDelete(id, tenantId);
    },
  };
}
