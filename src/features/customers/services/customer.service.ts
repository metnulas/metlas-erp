import { AppError } from "@/server/errors/app-error";
import { recordAudit } from "@/server/audit/audit-log";
import { geocodeAddress } from "@/server/geocoding/nominatim";
import {
  createCustomerRepository,
  type CustomerRepository,
  type CustomerOrderHistoryItem,
} from "../repositories/customer.repository";
import type {
  CustomerQueryInput,
} from "../validators/customer.schema";
import { Prisma, type Customer } from "@prisma/client";
import { nextTenantCode } from "@/server/codes/auto-code";

export interface PaginatedCustomers {
  data: Customer[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateCustomerData {
  customerCode?: string;
  fullName: string;
  phone: string;
  phone2?: string;
  email?: string;
  address?: string;
  city?: string;
  district?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
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
  latitude?: number;
  longitude?: number;
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
  softDelete(id: string, tenantId: string, userId?: string): Promise<Customer>;
  geocode(id: string, tenantId: string, userId?: string): Promise<Customer>;
  getOrderHistory(id: string, tenantId: string): Promise<CustomerOrderHistoryItem[]>;
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
      const customerCode = input.customerCode || await nextTenantCode("MUS", await repository.count({ tenantId }), (code) => repository.findByCode(code, tenantId).then(Boolean));
      const existing = await repository.findByCode(customerCode, tenantId);
      if (existing) {
        throw new AppError("Bu müşteri kodu zaten kullanılıyor", 409, "CUSTOMER_CODE_EXISTS");
      }

      const coordinates = input.latitude === undefined || input.longitude === undefined ? await geocodeAddress(input.address, input.district, input.city, input.location) : null;
      const customer = await repository.create({
         customerCode,
        fullName: input.fullName,
        phone: input.phone,
        phone2: input.phone2 || null,
        email: input.email || null,
        address: input.address || null,
        city: input.city || null,
        district: input.district || null,
        location: input.location || null,
        latitude: input.latitude ?? coordinates?.latitude ?? null,
        longitude: input.longitude ?? coordinates?.longitude ?? null,
        balance: input.balance ?? 0,
        depositBottleCount: input.depositBottleCount ?? 0,
        emptyBottleCount: input.emptyBottleCount ?? 0,
        notes: input.notes || null,
        tenant: { connect: { id: tenantId } },
        createdBy: userId ?? null,
        updatedBy: userId ?? null,
      });
      await recordAudit({ tenantId, actorId: userId, action: "CREATE", entityType: "Customer", entityId: customer.id });
      return customer;
    },

    async update(id, tenantId, input, userId) {
      const existingCustomer = await repository.findById(id, tenantId);
      if (!existingCustomer) {
        throw new AppError("Müşteri bulunamadı", 404, "CUSTOMER_NOT_FOUND");
      }

      if (input.customerCode && input.customerCode !== existingCustomer.customerCode) {
        const existing = await repository.findByCode(input.customerCode, tenantId);
        if (existing) {
          throw new AppError("Bu müşteri kodu zaten kullanılıyor", 409, "CUSTOMER_CODE_EXISTS");
        }
      }

      const addressChanged = input.address !== undefined || input.district !== undefined || input.city !== undefined || input.location !== undefined;
      const coordinates = addressChanged || existingCustomer.latitude === null || existingCustomer.longitude === null ? await geocodeAddress(input.address ?? existingCustomer.address, input.district ?? existingCustomer.district, input.city ?? existingCustomer.city, input.location ?? existingCustomer.location) : null;
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
        ...(input.latitude !== undefined && { latitude: input.latitude ?? null }),
        ...(input.longitude !== undefined && { longitude: input.longitude ?? null }),
        ...(coordinates && input.latitude === undefined && { latitude: coordinates.latitude }),
        ...(coordinates && input.longitude === undefined && { longitude: coordinates.longitude }),
        ...(addressChanged && input.latitude === undefined && !coordinates && { latitude: null }),
        ...(addressChanged && input.longitude === undefined && !coordinates && { longitude: null }),
        notes: input.notes ?? null,
        updatedBy: userId ?? null,
      };

      const customer = await repository.update(id, tenantId, updateData);
      await recordAudit({ tenantId, actorId: userId, action: "UPDATE", entityType: "Customer", entityId: id });
      return customer;
    },

    async softDelete(id, tenantId, userId) {
      const customer = await repository.findById(id, tenantId);
      if (!customer) {
        throw new AppError("Müşteri bulunamadı", 404, "CUSTOMER_NOT_FOUND");
      }

      const deleted = await repository.softDelete(id, tenantId);
      await recordAudit({ tenantId, actorId: userId, action: "DELETE", entityType: "Customer", entityId: id });
      return deleted;
    },

    async geocode(id, tenantId, userId) {
      const customer = await this.getById(id, tenantId);
      const coordinates = await geocodeAddress(customer.address, customer.district, customer.city, customer.location);
      if (!coordinates) throw new AppError("Adres haritada bulunamadı. Adres, mahalle ve şehir bilgilerini kontrol edin", 400, "CUSTOMER_LOCATION_NOT_FOUND");
      const updated = await repository.update(id, tenantId, { latitude: coordinates.latitude, longitude: coordinates.longitude, updatedBy: userId ?? null });
      await recordAudit({ tenantId, actorId: userId, action: "GEOCODE", entityType: "Customer", entityId: id, metadata: { latitude: coordinates.latitude, longitude: coordinates.longitude } });
      return updated;
    },

    async getOrderHistory(id, tenantId) {
      await this.getById(id, tenantId);
      return repository.findOrderHistory(id, tenantId);
    },
  };
}
