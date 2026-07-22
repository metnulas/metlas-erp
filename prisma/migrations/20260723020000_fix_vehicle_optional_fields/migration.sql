-- Legacy Vehicle tables may have required brand/model columns.
ALTER TABLE "Vehicle" ALTER COLUMN "brand" DROP NOT NULL;
ALTER TABLE "Vehicle" ALTER COLUMN "model" DROP NOT NULL;
