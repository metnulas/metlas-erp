CREATE TYPE "CustomerAccountEntryType" AS ENUM ('CHARGE', 'PAYMENT', 'DEPOSIT_IN', 'DEPOSIT_OUT');

CREATE TABLE "CustomerAccountEntry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" "CustomerAccountEntryType" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "balanceAfter" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "depositChange" INTEGER NOT NULL DEFAULT 0,
    "depositBalanceAfter" INTEGER NOT NULL DEFAULT 0,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustomerAccountEntry_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "CustomerAccountEntry" ADD CONSTRAINT "CustomerAccountEntry_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CustomerAccountEntry" ADD CONSTRAINT "CustomerAccountEntry_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "CustomerAccountEntry_tenantId_customerId_createdAt_idx" ON "CustomerAccountEntry"("tenantId", "customerId", "createdAt");
CREATE INDEX "CustomerAccountEntry_tenantId_type_createdAt_idx" ON "CustomerAccountEntry"("tenantId", "type", "createdAt");
CREATE INDEX "CustomerAccountEntry_referenceType_referenceId_idx" ON "CustomerAccountEntry"("referenceType", "referenceId");
