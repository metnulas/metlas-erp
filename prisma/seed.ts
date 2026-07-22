import { PrismaClient, OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: "metlas-demo" },
    update: {},
    create: { id: "metlas-demo", name: "METLAS Demo", slug: "metlas-demo" },
  });

  const customer = await prisma.customer.upsert({
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

  const orderDate = new Date("2026-07-22");
  const deliveryDate = new Date("2026-07-25");

  const order1 = await prisma.order.upsert({
    where: { tenantId_orderCode: { tenantId: tenant.id, orderCode: "SIP-20260722-001" } },
    update: {},
    create: {
      tenantId: tenant.id,
      orderCode: "SIP-20260722-001",
      customerId: customer.id,
      orderDate,
      deliveryDate,
      status: OrderStatus.CONFIRMED,
      totalAmount: 850,
      discount: 50,
      grandTotal: 800,
      notes: "Örnek sipariş - su bidonu",
      items: {
        create: [
          { productName: "19L Su Bidonu", quantity: 20, unitPrice: 30, total: 600 },
          { productName: "5L Su Şişesi", quantity: 25, unitPrice: 10, total: 250 },
        ],
      },
    },
  });

  await prisma.order.upsert({
    where: { tenantId_orderCode: { tenantId: tenant.id, orderCode: "SIP-20260722-002" } },
    update: {},
    create: {
      tenantId: tenant.id,
      orderCode: "SIP-20260722-002",
      customerId: customer.id,
      orderDate,
      status: OrderStatus.PENDING,
      totalAmount: 450,
      discount: 0,
      grandTotal: 450,
      notes: "Acil sipariş",
      items: {
        create: [
          { productName: "19L Su Bidonu", quantity: 15, unitPrice: 30, total: 450 },
        ],
      },
    },
  });

  console.log("Seed tamamlandı:", { tenant: tenant.id, customer: customer.id, orders: [order1.orderCode] });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
