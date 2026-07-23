-- AlterTable
ALTER TABLE "Order" ADD COLUMN "vehicleId" TEXT,
ADD COLUMN "personnelId" TEXT,
ADD COLUMN "deliveryNotes" TEXT,
ADD COLUMN "deliveredAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Order_tenantId_vehicleId_idx" ON "Order"("tenantId", "vehicleId");
CREATE INDEX "Order_tenantId_personnelId_idx" ON "Order"("tenantId", "personnelId");
CREATE INDEX "Order_tenantId_deliveryDate_idx" ON "Order"("tenantId", "deliveryDate");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES "Personnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
