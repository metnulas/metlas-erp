-- AlterTable: Customer tablosuna soft delete ve audit alanları eklendi
ALTER TABLE "Customer" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Customer" ADD COLUMN "createdBy" TEXT;
ALTER TABLE "Customer" ADD COLUMN "updatedBy" TEXT;

-- Index: deletedAt alanı için indeks eklendi
CREATE INDEX "Customer_tenantId_deletedAt_idx" ON "Customer"("tenantId", "deletedAt");
