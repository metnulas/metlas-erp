-- Legacy Vehicle tables may require a model year even though the application treats it as optional.
ALTER TABLE "Vehicle" ALTER COLUMN "modelYear" DROP NOT NULL;
