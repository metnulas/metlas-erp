ALTER TABLE "Customer" ADD COLUMN "partnerId" TEXT;
CREATE INDEX "Customer_partnerId_idx" ON "Customer"("partnerId");
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
