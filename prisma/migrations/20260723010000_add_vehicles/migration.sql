-- This migration also upgrades the legacy Vehicle table if it already exists.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'VehicleStatus') THEN
    CREATE TYPE "VehicleStatus" AS ENUM ('ACTIVE', 'MAINTENANCE', 'INACTIVE');
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public."Vehicle"') IS NULL THEN
    CREATE TABLE "Vehicle" (
      "id" TEXT NOT NULL,
      "tenantId" TEXT NOT NULL,
      "code" TEXT NOT NULL,
      "plate" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "brand" TEXT,
      "model" TEXT,
      "modelYear" INTEGER,
      "capacity" INTEGER NOT NULL DEFAULT 0,
      "capacityUnit" TEXT NOT NULL DEFAULT 'ADET',
      "mileage" INTEGER NOT NULL DEFAULT 0,
      "status" "VehicleStatus" NOT NULL DEFAULT 'ACTIVE',
      "inspectionDate" TIMESTAMP(3),
      "insuranceDate" TIMESTAMP(3),
      "notes" TEXT,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "deletedAt" TIMESTAMP(3),
      "createdBy" TEXT,
      "updatedBy" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
    );
  ELSE
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Vehicle' AND column_name = 'plateNumber')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Vehicle' AND column_name = 'plate') THEN
      ALTER TABLE "Vehicle" RENAME COLUMN "plateNumber" TO "plate";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Vehicle' AND column_name = 'year')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Vehicle' AND column_name = 'modelYear') THEN
      ALTER TABLE "Vehicle" RENAME COLUMN "year" TO "modelYear";
    END IF;
    ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "code" TEXT;
    ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'Dağıtım Aracı';
    ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "capacityUnit" TEXT NOT NULL DEFAULT 'ADET';
    ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "mileage" INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "status" "VehicleStatus" NOT NULL DEFAULT 'ACTIVE';
    ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "inspectionDate" TIMESTAMP(3);
    ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "insuranceDate" TIMESTAMP(3);
    UPDATE "Vehicle" SET "code" = 'ARAC-' || UPPER(SUBSTRING("id", 1, 8)) WHERE "code" IS NULL;
    UPDATE "Vehicle" SET "status" = CASE WHEN "isActive" THEN 'ACTIVE'::"VehicleStatus" ELSE 'INACTIVE'::"VehicleStatus" END;
    ALTER TABLE "Vehicle" ALTER COLUMN "code" SET NOT NULL;
    ALTER TABLE "Vehicle" ALTER COLUMN "type" SET NOT NULL;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "Vehicle_tenantId_code_key" ON "Vehicle"("tenantId", "code");
CREATE UNIQUE INDEX IF NOT EXISTS "Vehicle_tenantId_plate_key" ON "Vehicle"("tenantId", "plate");
CREATE INDEX IF NOT EXISTS "Vehicle_tenantId_status_idx" ON "Vehicle"("tenantId", "status");
CREATE INDEX IF NOT EXISTS "Vehicle_tenantId_type_idx" ON "Vehicle"("tenantId", "type");
CREATE INDEX IF NOT EXISTS "Vehicle_tenantId_isActive_idx" ON "Vehicle"("tenantId", "isActive");
CREATE INDEX IF NOT EXISTS "Vehicle_tenantId_deletedAt_idx" ON "Vehicle"("tenantId", "deletedAt");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Vehicle_tenantId_fkey') THEN
    ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
