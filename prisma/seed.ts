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

  const damacana = await prisma.product.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "URN-19L" } },
    update: {},
    create: {
      tenantId: tenant.id,
      code: "URN-19L",
      name: "19L Damacana Su",
      category: "Damacana",
      unit: "ADET",
      salePrice: 30,
      purchasePrice: 12,
      stockQuantity: 100,
      minStockLevel: 20,
      hasDeposit: true,
      depositAmount: 100,
      stockMovements: {
        create: { tenantId: tenant.id, type: "INITIAL", quantity: 100, balanceAfter: 100, notes: "Demo başlangıç stoğu" },
      },
    },
  });

  const pet = await prisma.product.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: "URN-5L" } },
    update: {},
    create: {
      tenantId: tenant.id,
      code: "URN-5L",
      name: "5L Su Şişesi",
      category: "Şişe",
      unit: "ADET",
      salePrice: 10,
      purchasePrice: 4,
      stockQuantity: 250,
      minStockLevel: 50,
      stockMovements: {
        create: { tenantId: tenant.id, type: "INITIAL", quantity: 250, balanceAfter: 250, notes: "Demo başlangıç stoğu" },
      },
    },
  });

  await prisma.vehicle.upsert({
    where: { tenantId_plate: { tenantId: tenant.id, plate: "34 MET 001" } },
    update: {},
    create: {
      tenantId: tenant.id,
      code: "ARAC-0001",
      plate: "34 MET 001",
      type: "Damacana Dağıtım Aracı",
      brand: "Ford",
      model: "Transit",
      modelYear: 2023,
      capacity: 120,
      capacityUnit: "ADET",
      mileage: 28500,
      status: "ACTIVE",
      inspectionDate: new Date("2026-12-15"),
      insuranceDate: new Date("2026-10-20"),
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
           { productId: damacana.id, productName: damacana.name, quantity: 20, unitPrice: 30, total: 600 },
           { productId: pet.id, productName: pet.name, quantity: 25, unitPrice: 10, total: 250 },
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
           { productId: damacana.id, productName: damacana.name, quantity: 15, unitPrice: 30, total: 450 },
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
