import type { CustomerAccountEntry } from "@prisma/client";
import { AppError } from "@/server/errors/app-error";
import { recordAudit } from "@/server/audit/audit-log";
import { createAccountEntryRepository, type AccountEntryRepository } from "../repositories/account-entry.repository";
import type { AccountEntryQueryInput, CreateAccountEntryOutput } from "../validators/account-entry.schema";

export interface PaginatedAccountEntries { data: CustomerAccountEntry[]; total: number; page: number; pageSize: number; totalPages: number; }
export interface AccountEntryService { list(customerId: string, tenantId: string, query: AccountEntryQueryInput): Promise<PaginatedAccountEntries>; create(customerId: string, tenantId: string, input: CreateAccountEntryOutput, userId?: string): Promise<CustomerAccountEntry>; }

export function createAccountEntryService(repository: AccountEntryRepository = createAccountEntryRepository()): AccountEntryService {
  return {
    async list(customerId, tenantId, { page, pageSize }) { const [data, total] = await Promise.all([repository.findMany(customerId, tenantId, (page - 1) * pageSize, pageSize), repository.count(customerId, tenantId)]); return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }; },
    async create(customerId, tenantId, input, userId) {
      try {
        const entry = await repository.create(customerId, tenantId, { ...input, userId });
        await recordAudit({ tenantId, actorId: userId, action: "ACCOUNT_ENTRY", entityType: "Customer", entityId: customerId, metadata: { type: input.type, amount: input.amount, depositQuantity: input.depositQuantity } });
        return entry;
      } catch (error) {
        if (error instanceof Error && error.message === "CUSTOMER_NOT_FOUND") throw new AppError("Müşteri bulunamadı", 404, "CUSTOMER_NOT_FOUND");
        if (error instanceof Error && error.message === "INSUFFICIENT_BALANCE_OR_DEPOSIT") throw new AppError("Bakiye veya depozito adedi yetersiz", 400, "INSUFFICIENT_BALANCE_OR_DEPOSIT");
        throw error;
      }
    },
  };
}
