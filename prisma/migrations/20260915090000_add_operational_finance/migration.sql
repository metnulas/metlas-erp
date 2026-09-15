CREATE TYPE "PartnerType" AS ENUM ('SUPPLIER', 'DEALER', 'BOTH');
CREATE TYPE "PartnerLedgerEntryType" AS ENUM ('PURCHASE', 'SALE', 'PAYMENT_TO_PARTNER', 'COLLECTION_FROM_PARTNER', 'ADJUSTMENT');
CREATE TYPE "BankAccountType" AS ENUM ('BANK', 'CASH');
CREATE TYPE "SalesPaymentMethod" AS ENUM ('CASH', 'IBAN', 'CARD', 'CREDIT', 'OTHER');
CREATE TYPE "ExpenseType" AS ENUM ('FUEL', 'OTHER');
CREATE TYPE "ExpensePaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'CARD', 'OTHER');
CREATE TYPE "DailyClosingStatus" AS ENUM ('OPEN', 'CLOSED');

ALTER TABLE "OrderItem" ADD COLUMN "unitCost" DECIMAL(14,2) NOT NULL DEFAULT 0;
ALTER TABLE "OrderItem" ADD COLUMN "costTotal" DECIMAL(14,2) NOT NULL DEFAULT 0;

CREATE TABLE "Partner" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "PartnerType" NOT NULL DEFAULT 'BOTH',
  "phone" TEXT,
  "email" TEXT,
  "taxNumber" TEXT,
  "iban" TEXT,
  "paymentTermDays" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Partner_tenantId_code_key" ON "Partner"("tenantId", "code");
CREATE INDEX "Partner_tenantId_name_idx" ON "Partner"("tenantId", "name");
CREATE INDEX "Partner_tenantId_type_isActive_idx" ON "Partner"("tenantId", "type", "isActive");
ALTER TABLE "Partner" ADD CONSTRAINT "Partner_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "PartnerLedgerEntry" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "partnerId" TEXT NOT NULL,
  "type" "PartnerLedgerEntryType" NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "dueDate" DATE,
  "referenceType" TEXT,
  "referenceId" TEXT,
  "notes" TEXT,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PartnerLedgerEntry_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PartnerLedgerEntry_tenantId_partnerId_createdAt_idx" ON "PartnerLedgerEntry"("tenantId", "partnerId", "createdAt");
CREATE INDEX "PartnerLedgerEntry_tenantId_type_dueDate_idx" ON "PartnerLedgerEntry"("tenantId", "type", "dueDate");
CREATE INDEX "PartnerLedgerEntry_referenceType_referenceId_idx" ON "PartnerLedgerEntry"("referenceType", "referenceId");
ALTER TABLE "PartnerLedgerEntry" ADD CONSTRAINT "PartnerLedgerEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PartnerLedgerEntry" ADD CONSTRAINT "PartnerLedgerEntry_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "PartnerPurchase" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "partnerId" TEXT NOT NULL,
  "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "totalAmount" DECIMAL(14,2) NOT NULL,
  "depositAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PartnerPurchase_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PartnerPurchase_tenantId_purchaseDate_idx" ON "PartnerPurchase"("tenantId", "purchaseDate");
CREATE INDEX "PartnerPurchase_tenantId_partnerId_purchaseDate_idx" ON "PartnerPurchase"("tenantId", "partnerId", "purchaseDate");
ALTER TABLE "PartnerPurchase" ADD CONSTRAINT "PartnerPurchase_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PartnerPurchase" ADD CONSTRAINT "PartnerPurchase_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "PartnerPurchaseItem" (
  "id" TEXT NOT NULL,
  "purchaseId" TEXT NOT NULL,
  "productId" TEXT,
  "productName" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "unitCost" DECIMAL(14,2) NOT NULL,
  "depositAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "total" DECIMAL(14,2) NOT NULL,
  CONSTRAINT "PartnerPurchaseItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PartnerPurchaseItem_purchaseId_idx" ON "PartnerPurchaseItem"("purchaseId");
CREATE INDEX "PartnerPurchaseItem_productId_idx" ON "PartnerPurchaseItem"("productId");
ALTER TABLE "PartnerPurchaseItem" ADD CONSTRAINT "PartnerPurchaseItem_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "PartnerPurchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PartnerPurchaseItem" ADD CONSTRAINT "PartnerPurchaseItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "BankAccount" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "bankName" TEXT,
  "iban" TEXT,
  "type" "BankAccountType" NOT NULL DEFAULT 'BANK',
  "openingBalance" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "BankAccount_tenantId_name_key" ON "BankAccount"("tenantId", "name");
CREATE INDEX "BankAccount_tenantId_isActive_idx" ON "BankAccount"("tenantId", "isActive");
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "SalesPayment" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "partnerId" TEXT,
  "bankAccountId" TEXT,
  "amount" DECIMAL(14,2) NOT NULL,
  "method" "SalesPaymentMethod" NOT NULL,
  "referenceNumber" TEXT,
  "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SalesPayment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SalesPayment_tenantId_paidAt_idx" ON "SalesPayment"("tenantId", "paidAt");
CREATE INDEX "SalesPayment_tenantId_method_paidAt_idx" ON "SalesPayment"("tenantId", "method", "paidAt");
CREATE INDEX "SalesPayment_tenantId_customerId_idx" ON "SalesPayment"("tenantId", "customerId");
CREATE INDEX "SalesPayment_tenantId_partnerId_idx" ON "SalesPayment"("tenantId", "partnerId");
ALTER TABLE "SalesPayment" ADD CONSTRAINT "SalesPayment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesPayment" ADD CONSTRAINT "SalesPayment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesPayment" ADD CONSTRAINT "SalesPayment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesPayment" ADD CONSTRAINT "SalesPayment_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SalesPayment" ADD CONSTRAINT "SalesPayment_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "Expense" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "type" "ExpenseType" NOT NULL DEFAULT 'OTHER',
  "description" TEXT NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "expenseDate" DATE NOT NULL,
  "paymentMethod" "ExpensePaymentMethod" NOT NULL DEFAULT 'CASH',
  "bankAccountId" TEXT,
  "vehicleId" TEXT,
  "liters" DECIMAL(10,2),
  "odometer" INTEGER,
  "receiptNumber" TEXT,
  "notes" TEXT,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Expense_tenantId_expenseDate_idx" ON "Expense"("tenantId", "expenseDate");
CREATE INDEX "Expense_tenantId_type_expenseDate_idx" ON "Expense"("tenantId", "type", "expenseDate");
CREATE INDEX "Expense_tenantId_bankAccountId_idx" ON "Expense"("tenantId", "bankAccountId");
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "DailyClosing" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "closingDate" DATE NOT NULL,
  "openingCash" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "cashSales" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "cashExpenses" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "expectedCash" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "actualCash" DECIMAL(14,2),
  "difference" DECIMAL(14,2),
  "notes" TEXT,
  "status" "DailyClosingStatus" NOT NULL DEFAULT 'OPEN',
  "closedAt" TIMESTAMP(3),
  "closedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DailyClosing_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DailyClosing_tenantId_closingDate_key" ON "DailyClosing"("tenantId", "closingDate");
CREATE INDEX "DailyClosing_tenantId_status_closingDate_idx" ON "DailyClosing"("tenantId", "status", "closingDate");
ALTER TABLE "DailyClosing" ADD CONSTRAINT "DailyClosing_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
