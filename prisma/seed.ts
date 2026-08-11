import { PrismaClient, OrderStatus, LegacyUserRole } from "@prisma/client";
import { hashPassword } from "../src/lib/auth-password";

const prisma = new PrismaClient();

async function main() {
  const seedAdminPassword = process.env.METLAS_SEED_ADMIN_PASSWORD;
  if (!seedAdminPassword || seedAdminPassword.length < 8) throw new Error("METLAS_SEED_ADMIN_PASSWORD zorunlu ve en az 8 karakter olmalıdır");
  const globalAdminEmail = process.env.METLAS_GLOBAL_ADMIN_EMAIL;
  const globalAdminPassword = process.env.METLAS_GLOBAL_ADMIN_PASSWORD;
  const tenant = await prisma.tenant.upsert({
    where: { slug: "metlas-demo" },
    update: { onboardingCompletedAt: new Date(), onboardingStep: 9 },
    create: { id: "metlas-demo", name: "METLAS Demo", slug: "metlas-demo", onboardingCompletedAt: new Date(), onboardingStep: 9 },
  });

  const packageDefinitions = [
    { code: "STARTER", name: "Starter", monthlyPrice: 299, annualPrice: 2990, maxUsers: 3, maxOrders: 500, maxWarehouses: 1, maxVehicles: 2, storageGb: 5, apiLimit: 10000, aiUsage: 100, sortOrder: 1 },
    { code: "STANDARD", name: "Standard", monthlyPrice: 599, annualPrice: 5990, maxUsers: 10, maxOrders: 2500, maxWarehouses: 2, maxVehicles: 5, storageGb: 25, apiLimit: 50000, aiUsage: 500, sortOrder: 2 },
    { code: "PROFESSIONAL", name: "Professional", monthlyPrice: 999, annualPrice: 9990, maxUsers: 30, maxOrders: 10000, maxWarehouses: 5, maxVehicles: 15, storageGb: 100, apiLimit: 250000, aiUsage: 2500, sortOrder: 3 },
    { code: "ENTERPRISE", name: "Enterprise", monthlyPrice: 2499, annualPrice: 24990, maxUsers: null, maxOrders: null, maxWarehouses: null, maxVehicles: null, storageGb: 500, apiLimit: 1000000, aiUsage: 10000, sortOrder: 4 },
  ] as const;
  for (const definition of packageDefinitions) {
    await prisma.subscriptionPackage.upsert({ where: { code: definition.code }, update: definition, create: definition });
  }
  const starter = await prisma.subscriptionPackage.findUniqueOrThrow({ where: { code: "STARTER" }, select: { id: true, monthlyPrice: true, annualPrice: true } });
  const existingSubscription = await prisma.tenantSubscription.findFirst({ where: { tenantId: tenant.id, status: "ACTIVE" } });
  if (!existingSubscription) {
    const startsAt = new Date();
    const trialEndsAt = new Date(startsAt);
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);
    await prisma.tenantSubscription.create({ data: { tenantId: tenant.id, packageId: starter.id, startsAt, status: "TRIAL", isTrial: true, trialEndsAt, monthlyPrice: starter.monthlyPrice, annualPrice: starter.annualPrice, totalAmount: starter.monthlyPrice } });
  }

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
    update: { tenantId: tenant.id, name: "Metin Yılmaz", role: LegacyUserRole.ADMIN, isActive: true, emailVerifiedAt: new Date(), passwordHash: await hashPassword(seedAdminPassword) },
    create: { tenantId: tenant.id, email: "admin@metlas.local", name: "Metin Yılmaz", role: LegacyUserRole.ADMIN, emailVerifiedAt: new Date(), passwordHash: await hashPassword(seedAdminPassword) },
  });

  const groupDefinitions = [
    ["platform", "Platform Yönetimi"], ["dashboard", "Dashboard"], ["orders", "Sipariş Yönetimi"], ["customers", "Müşteri Yönetimi"], ["products", "Ürün ve Stok"],
    ["finance", "Muhasebe"], ["billing", "Faturalama ve Ödemeler"], ["routes", "Kurye ve Harita"], ["reports", "Raporlar"], ["users", "Kullanıcı Yönetimi"], ["roles", "Rol Yönetimi"], ["audit", "Denetim"], ["subscriptions", "Abonelik ve Paket Yönetimi"],
  ] as const;
  const groups = new Map<string, string>();
  for (const [key, name] of groupDefinitions) {
    const group = await prisma.permissionGroup.findFirst({ where: { tenantId: null, key, deletedAt: null } });
    const saved = group ?? await prisma.permissionGroup.create({ data: { key, name, isSystem: true } });
    groups.set(key, saved.id);
  }

  const permissionDefinitions = [
    ["platform", "platform.view", "Platform görüntüle"], ["platform", "platform.audit.view", "Platform audit görüntüle"], ["platform", "platform.support.manage", "Destek taleplerini yönet"], ["platform", "tenants.manage", "Tenant yönet"], ["platform", "billing.manage", "Lisans ve paket yönet"], ["platform", "settings.manage", "Sistem ayarlarını yönet"], ["subscriptions", "subscriptions.view", "Abonelik görüntüle"], ["subscriptions", "subscriptions.manage", "Abonelik yönet"], ["subscriptions", "packages.view", "Paket görüntüle"], ["subscriptions", "packages.manage", "Paket yönet"], ["billing", "invoices.view", "Fatura görüntüle"], ["billing", "invoices.manage", "Fatura yönet"], ["billing", "payments.view", "Ödeme görüntüle"], ["billing", "payments.manage", "Ödeme yönet"], ["dashboard", "dashboard.view", "Dashboard görüntüle"], ["orders", "orders.view", "Sipariş görüntüle"], ["orders", "orders.create", "Sipariş oluştur"], ["orders", "orders.edit", "Sipariş düzenle"], ["orders", "orders.delete", "Sipariş sil"],
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
    const desiredPermissionIds = keys.map((key) => permissions.get(key)).filter((id): id is string => Boolean(id));
    await prisma.rolePermission.updateMany({ where: { roleId, tenantId: role?.tenantId ?? null, deletedAt: null, permissionId: { notIn: desiredPermissionIds } }, data: { deletedAt: new Date() } });
    for (const key of keys) {
      if (!permissions.has(key)) continue;
      const existing = await prisma.rolePermission.findFirst({ where: { roleId, permissionId: permissions.get(key), tenantId: role?.tenantId ?? null } });
      if (!existing) await prisma.rolePermission.create({ data: { tenantId: role?.tenantId ?? null, roleId, permissionId: permissions.get(key)! } });
    }
  }
  const allPermissionKeys = permissionDefinitions.map(([, key]) => key);
  const tenantPermissionKeys = allPermissionKeys.filter((key) => !key.startsWith("platform.") && !key.startsWith("subscriptions.") && !key.startsWith("billing."));
  const superAdmin = await ensureRole("SUPER_ADMIN", "Super Admin", null, true);
  await setRolePermissions(superAdmin.id, allPermissionKeys);
  if (globalAdminEmail && globalAdminPassword) {
    const globalAdmin = await prisma.user.upsert({ where: { email: globalAdminEmail.toLowerCase() }, update: { tenantId: null, name: "Global Super Admin", role: LegacyUserRole.ADMIN, isActive: true, deletedAt: null, emailVerifiedAt: new Date(), mustChangePassword: true, passwordHash: await hashPassword(globalAdminPassword) }, create: { tenantId: null, email: globalAdminEmail.toLowerCase(), name: "Global Super Admin", role: LegacyUserRole.ADMIN, emailVerifiedAt: new Date(), mustChangePassword: true, passwordHash: await hashPassword(globalAdminPassword) } });
    const assignment = await prisma.userRole.findFirst({ where: { userId: globalAdmin.id, tenantId: null, roleId: superAdmin.id, deletedAt: null } });
    if (!assignment) await prisma.userRole.create({ data: { tenantId: null, userId: globalAdmin.id, roleId: superAdmin.id } });
  }
  const adminRole = await ensureRole("ADMIN", "Yönetici", tenant.id);
  await setRolePermissions(adminRole.id, tenantPermissionKeys);
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
