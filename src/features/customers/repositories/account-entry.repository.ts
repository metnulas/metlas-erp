import { Prisma, type CustomerAccountEntry, type CustomerAccountEntryType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export interface AccountEntryRepository {
  findMany(customerId: string, tenantId: string, skip: number, take: number): Promise<CustomerAccountEntry[]>;
  count(customerId: string, tenantId: string): Promise<number>;
  create(customerId: string, tenantId: string, input: { type: CustomerAccountEntryType; amount: number; depositQuantity: number; notes?: string; referenceType?: string; referenceId?: string; userId?: string }): Promise<CustomerAccountEntry>;
}

export function createAccountEntryRepository(): AccountEntryRepository {
  return {
    findMany(customerId, tenantId, skip, take) { return prisma.customerAccountEntry.findMany({ where: { customerId, tenantId }, orderBy: { createdAt: "desc" }, skip, take }); },
    count(customerId, tenantId) { return prisma.customerAccountEntry.count({ where: { customerId, tenantId } }); },
    async create(customerId, tenantId, input) {
      return prisma.$transaction(async (tx) => {
        const amount = new Prisma.Decimal(input.amount);
        const balanceDelta = input.type === "CHARGE" ? amount : input.type === "PAYMENT" ? amount.negated() : new Prisma.Decimal(0);
        const depositDelta = input.type === "DEPOSIT_IN" ? input.depositQuantity : input.type === "DEPOSIT_OUT" ? -input.depositQuantity : 0;
        const updated = await tx.customer.updateMany({ where: { id: customerId, tenantId, deletedAt: null, ...(balanceDelta.lessThan(0) && { balance: { gte: amount } }), ...(depositDelta < 0 && { depositBottleCount: { gte: input.depositQuantity } }) }, data: { balance: { increment: balanceDelta }, depositBottleCount: { increment: depositDelta } } });
        if (updated.count === 0) {
          const customer = await tx.customer.findFirst({ where: { id: customerId, tenantId, deletedAt: null } });
          if (!customer) throw new Error("CUSTOMER_NOT_FOUND");
          throw new Error("INSUFFICIENT_BALANCE_OR_DEPOSIT");
        }
        const customer = await tx.customer.findFirstOrThrow({ where: { id: customerId, tenantId, deletedAt: null } });
        return tx.customerAccountEntry.create({ data: { tenantId, customerId, type: input.type, amount, balanceAfter: customer.balance, depositChange: depositDelta, depositBalanceAfter: customer.depositBottleCount, notes: input.notes || null, referenceType: input.referenceType || null, referenceId: input.referenceId || null, createdBy: input.userId ?? null } });
      });
    },
  };
}
