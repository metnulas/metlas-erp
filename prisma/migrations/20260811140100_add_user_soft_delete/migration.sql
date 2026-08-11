ALTER TABLE "User" ADD COLUMN "deletedAt" TIMESTAMP(3);
CREATE INDEX "User_tenantId_deletedAt_idx" ON "User"("tenantId", "deletedAt");
