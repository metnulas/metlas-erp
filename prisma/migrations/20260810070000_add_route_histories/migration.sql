CREATE TABLE "RouteHistory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "routeDate" DATE NOT NULL,
    "distanceKm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimatedFuelLiters" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fuelPricePerLiter" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "estimatedFuelCost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "revenue" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "orderCount" INTEGER NOT NULL DEFAULT 0,
    "stops" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RouteHistory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RouteHistory_tenantId_routeDate_key" ON "RouteHistory"("tenantId", "routeDate");
CREATE INDEX "RouteHistory_tenantId_routeDate_idx" ON "RouteHistory"("tenantId", "routeDate");
ALTER TABLE "RouteHistory" ADD CONSTRAINT "RouteHistory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
