CREATE TABLE "SubscriptionPackage" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "monthlyPrice" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "annualPrice" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "maxUsers" INTEGER,
    "maxOrders" INTEGER,
    "maxWarehouses" INTEGER,
    "maxVehicles" INTEGER,
    "storageGb" INTEGER,
    "apiLimit" INTEGER,
    "aiUsage" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPackage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TenantSubscription" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "isTrial" BOOLEAN NOT NULL DEFAULT false,
    "trialEndsAt" TIMESTAMP(3),
    "lastPaymentAt" TIMESTAMP(3),
    "nextPaymentAt" TIMESTAMP(3),
    "monthlyPrice" DECIMAL(14,2) NOT NULL,
    "annualPrice" DECIMAL(14,2) NOT NULL,
    "discountAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "manualPrice" DECIMAL(14,2),
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SubscriptionPackage_code_key" ON "SubscriptionPackage"("code");
CREATE INDEX "SubscriptionPackage_isActive_sortOrder_idx" ON "SubscriptionPackage"("isActive", "sortOrder");
CREATE INDEX "TenantSubscription_tenantId_status_startsAt_idx" ON "TenantSubscription"("tenantId", "status", "startsAt");
CREATE INDEX "TenantSubscription_packageId_status_idx" ON "TenantSubscription"("packageId", "status");

ALTER TABLE "TenantSubscription" ADD CONSTRAINT "TenantSubscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TenantSubscription" ADD CONSTRAINT "TenantSubscription_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "SubscriptionPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
