import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: "metlas-demo" },
    update: {},
    create: { id: "metlas-demo", name: "METLAS Demo", slug: "metlas-demo" },
  });

  await prisma.customer.upsert({
    where: { tenantId_customerCode: { tenantId: tenant.id, customerCode: "MUS-0001" } },
    update: {},
    create: {
      tenantId: tenant.id,
      customerCode: "MUS-0001",
      fullName: "Demo Müşteri",
      phone: "0555 000 00 00",
      city: "İstanbul",
      district: "Kadıköy",
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
