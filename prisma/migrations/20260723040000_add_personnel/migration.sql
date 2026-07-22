-- CreateEnum
CREATE TYPE "PersonnelStatus" AS ENUM ('ACTIVE', 'ON_LEAVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "Personnel" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "position" TEXT NOT NULL,
    "licenseNumber" TEXT,
    "licenseClass" TEXT,
    "licenseExpiryDate" TIMESTAMP(3),
    "hireDate" TIMESTAMP(3),
    "status" "PersonnelStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Personnel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Personnel_tenantId_employeeCode_key" ON "Personnel"("tenantId", "employeeCode");
CREATE INDEX "Personnel_tenantId_fullName_idx" ON "Personnel"("tenantId", "fullName");
CREATE INDEX "Personnel_tenantId_position_idx" ON "Personnel"("tenantId", "position");
CREATE INDEX "Personnel_tenantId_status_idx" ON "Personnel"("tenantId", "status");
CREATE INDEX "Personnel_tenantId_isActive_idx" ON "Personnel"("tenantId", "isActive");
CREATE INDEX "Personnel_tenantId_deletedAt_idx" ON "Personnel"("tenantId", "deletedAt");

-- AddForeignKey
ALTER TABLE "Personnel" ADD CONSTRAINT "Personnel_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
