CREATE TABLE "OrderSequence" (
    "tenantId" TEXT NOT NULL,
    "nextValue" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OrderSequence_pkey" PRIMARY KEY ("tenantId")
);

ALTER TABLE "OrderSequence" ADD CONSTRAINT "OrderSequence_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "OrderSequence" ("tenantId", "nextValue", "createdAt", "updatedAt")
SELECT t."id",
       COALESCE(MAX(CASE
         WHEN o."orderCode" ~ '^SIP-[0-9]{8}-[0-9]+$'
         THEN CAST(split_part(o."orderCode", '-', 3) AS INTEGER) + 1
         ELSE 1
       END), 1),
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP
FROM "Tenant" t
LEFT JOIN "Order" o ON o."tenantId" = t."id"
GROUP BY t."id";
