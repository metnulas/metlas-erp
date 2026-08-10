import { PrismaClient, OrderStatus, LegacyUserRole } from "@prisma/client";
import { hashPassword } from "../src/lib/auth-password";

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

  const admin = await prisma.user.upsert({
    where: { email: "admin@metlas.local" },
    update: { tenantId: tenant.id, name: "Metin Yılmaz", role: LegacyUserRole.ADMIN, isActive: true, passwordHash: await hashPassword(process.env.METLAS_SEED_ADMIN_PASSWORD ?? "Metlas123!") },
    create: { tenantId: tenant.id, email: "admin@metlas.local", name: "Metin Yılmaz", role: LegacyUserRole.ADMIN, passwordHash: await hashPassword(process.env.METLAS_SEED_ADMIN_PASSWORD ?? "Metlas123!") },
  });

  const groupDefinitions = [
    ["platform", "Platform Yönetimi"], ["dashboard", "Dashboard"], ["orders", "Sipariş Yönetimi"], ["customers", "Müşteri Yönetimi"], ["products", "Ürün ve Stok"],
    ["finance", "Muhasebe"], ["routes", "Kurye ve Harita"], ["reports", "Raporlar"], ["users", "Kullanıcı Yönetimi"], ["roles", "Rol Yönetimi"], ["audit", "Denetim"],
  ] as const;
  const groups = new Map<string, string>();
  for (const [key, name] of groupDefinitions) {
    const group = await prisma.permissionGroup.findFirst({ where: { tenantId: null, key, deletedAt: null } });
    const saved = group ?? await prisma.permissionGroup.create({ data: { key, name, isSystem: true } });
    groups.set(key, saved.id);
  }

  const permissionDefinitions = [
    ["platform", "platform.view", "Platform görüntüle"], ["platform", "tenants.manage", "Tenant yönet"], ["platform", "billing.manage", "Lisans ve paket yönet"], ["platform", "settings.manage", "Sistem ayarlarını yönet"], ["dashboard", "dashboard.view", "Dashboard görüntüle"], ["orders", "orders.view", "Sipariş görüntüle"], ["orders", "orders.create", "Sipariş oluştur"], ["orders", "orders.edit", "Sipariş düzenle"], ["orders", "orders.delete", "Sipariş sil"],
    ["customers", "customers.view", "Müşteri görüntüle"], ["customers", "customers.create", "Müşteri oluştur"], ["customers", "customers.edit", "Müşteri düzenle"], ["customers", "customers.delete", "Müşteri sil"],
    ["products", "products.view", "Ürün görüntüle"], ["products", "products.create", "Ürün oluştur"], ["products", "products.edit", "Ürün düzenle"], ["products", "products.delete", "Ürün sil"], ["products", "products.stock.manage", "Stok yönet"],
    ["finance", "finance.view", "Finans görüntüle"], ["finance", "finance.manage", "Finans yönet"], ["routes", "routes.view", "Rota görüntüle"], ["routes", "routes.manage", "Rota yönet"], ["routes", "deliveries.view", "Dağıtım görüntüle"], ["routes", "deliveries.manage", "Dağıtım yönet"],
    ["reports", "reports.view", "Rapor görüntüle"], ["reports", "reports.export", "Rapor dışa aktar"], ["users", "users.view", "Kullanıcı görüntüle"], ["users", "users.manage", "Kullanıcı yönet"], ["roles", "roles.view", "Rol görüntüle"], ["roles", "roles.manage", "Rol yönet"], ["audit", "audit.view", "Denetim görüntüle"],
  ] as const;
  const permissions = new Map<string, string>();
  for (const [groupKey, key, name] of permissionDefinitions) {
    const permission = await prisma.permission.findFirst({ where: { tenantId: null, key, deletedAt: null } });
    const saved = permission ?? await prisma.permission.create({ data: { groupId: groups.get(groupKey)!, key, name, isSystem: true } });
    permissions.set(key, saved.id);
  }

  async function ensureRole(key: string, name: string, tenantId: string | null, isSuperAdmin = false) {
    const existing = await prisma.role.findFirst({ where: { tenantId, key } });
    return existing ?? prisma.role.create({ data: { tenantId, key, name, isSystem: true, isSuperAdmin } });
  }
  async function setRolePermissions(roleId: string, keys: string[]) {
    const role = await prisma.role.findUnique({ where: { id: roleId }, select: { tenantId: true } });
    for (const key of keys) {
      if (!permissions.has(key)) continue;
      const existing = await prisma.rolePermission.findFirst({ where: { roleId, permissionId: permissions.get(key), tenantId: role?.tenantId ?? null } });
      if (!existing) await prisma.rolePermission.create({ data: { tenantId: role?.tenantId ?? null, roleId, permissionId: permissions.get(key)! } });
    }
  }
  const allPermissionKeys = permissionDefinitions.map(([, key]) => key);
  const superAdmin = await ensureRole("SUPER_ADMIN", "Super Admin", null, true);
  await setRolePermissions(superAdmin.id, allPermissionKeys);
  const adminRole = await ensureRole("ADMIN", "Yönetici", tenant.id);
  await setRolePermissions(adminRole.id, allPermissionKeys);
  const operations = await ensureRole("OPERATIONS", "Operasyon", tenant.id);
  const courier = await ensureRole("COURIER", "Kurye", tenant.id);
  const accounting = await ensureRole("ACCOUNTING", "Muhasebe", tenant.id);
  const callCenter = await ensureRole("CALL_CENTER", "Çağrı Merkezi", tenant.id);
  const manager = await ensureRole("MANAGER", "Müdür", tenant.id);
  const warehouse = await ensureRole("WAREHOUSE", "Depo", tenant.id);
  await setRolePermissions(operations.id, ["dashboard.view", "orders.view", "orders.create", "orders.edit", "customers.view", "customers.create", "customers.edit", "products.view", "products.create", "products.edit", "products.stock.manage", "vehicles.view", "vehicles.manage", "personnel.view", "personnel.manage", "routes.view", "routes.manage", "deliveries.view", "deliveries.manage", "reports.view"]);
  await setRolePermissions(courier.id, ["dashboard.view", "orders.view", "customers.view", "products.view", "vehicles.view", "routes.view", "routes.manage", "deliveries.view", "deliveries.manage"]);
  await setRolePermissions(accounting.id, ["dashboard.view", "customers.view", "orders.view", "finance.view", "finance.manage", "reports.view", "reports.export"]);
  await setRolePermissions(callCenter.id, ["dashboard.view", "customers.view", "customers.create", "customers.edit", "orders.view", "orders.create", "orders.edit"]);
  await setRolePermissions(manager.id, ["dashboard.view", "orders.view", "orders.create", "orders.edit", "customers.view", "customers.create", "customers.edit", "products.view", "vehicles.view", "personnel.view", "routes.view", "routes.manage", "deliveries.view", "deliveries.manage", "reports.view", "reports.export", "audit.view"]);
  await setRolePermissions(warehouse.id, ["dashboard.view", "orders.view", "products.view", "products.create", "products.edit", "products.stock.manage", "routes.view"]);
  const adminAssignment = await prisma.userRole.findFirst({ where: { userId: admin.id, tenantId: tenant.id, roleId: adminRole.id } });
  if (!adminAssignment) await prisma.userRole.create({ data: { tenantId: tenant.id, userId: admin.id, roleId: adminRole.id } });

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
