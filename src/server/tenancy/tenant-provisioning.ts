import type { Prisma } from "@prisma/client";
import { LegacyUserRole } from "@prisma/client";
import type { RegisterInput } from "@/features/auth/validators/register.schema";
import { hashPassword } from "@/lib/auth-password";

const permissionGroups = [
  ["dashboard", "Dashboard"], ["orders", "Sipariş Yönetimi"], ["customers", "Müşteri Yönetimi"], ["products", "Ürün ve Stok"], ["finance", "Muhasebe"], ["routes", "Kurye ve Harita"], ["vehicles", "Araçlar"], ["personnel", "Personeller"], ["reports", "Raporlar"], ["users", "Kullanıcı Yönetimi"], ["roles", "Rol Yönetimi"], ["audit", "Denetim"],
] as const;

const permissionDefinitions = [
  ["dashboard", "dashboard.view", "Dashboard görüntüle"], ["orders", "orders.view", "Sipariş görüntüle"], ["orders", "orders.create", "Sipariş oluştur"], ["orders", "orders.edit", "Sipariş düzenle"], ["orders", "orders.delete", "Sipariş sil"],
  ["customers", "customers.view", "Müşteri görüntüle"], ["customers", "customers.create", "Müşteri oluştur"], ["customers", "customers.edit", "Müşteri düzenle"], ["customers", "customers.delete", "Müşteri sil"],
  ["products", "products.view", "Ürün görüntüle"], ["products", "products.create", "Ürün oluştur"], ["products", "products.edit", "Ürün düzenle"], ["products", "products.delete", "Ürün sil"], ["products", "products.stock.manage", "Stok yönet"],
  ["finance", "finance.view", "Finans görüntüle"], ["finance", "finance.manage", "Finans yönet"], ["routes", "routes.view", "Rota görüntüle"], ["routes", "routes.manage", "Rota yönet"], ["routes", "deliveries.view", "Dağıtım görüntüle"], ["routes", "deliveries.manage", "Dağıtım yönet"], ["vehicles", "vehicles.view", "Araç görüntüle"], ["vehicles", "vehicles.manage", "Araç yönet"], ["personnel", "personnel.view", "Personel görüntüle"], ["personnel", "personnel.manage", "Personel yönet"],
  ["reports", "reports.view", "Rapor görüntüle"], ["reports", "reports.export", "Rapor dışa aktar"], ["users", "users.view", "Kullanıcı görüntüle"], ["users", "users.manage", "Kullanıcı yönet"], ["roles", "roles.view", "Rol görüntüle"], ["roles", "roles.manage", "Rol yönet"], ["audit", "audit.view", "Denetim görüntüle"],
] as const;

const roleDefinitions: Record<string, { name: string; permissions: string[] }> = {
  SUPER_ADMIN: { name: "Tenant Yönetici", permissions: permissionDefinitions.map(([, key]) => key) },
  ADMIN: { name: "Yönetici", permissions: permissionDefinitions.map(([, key]) => key) },
  OPERATIONS: { name: "Operasyon", permissions: ["dashboard.view", "orders.view", "orders.create", "orders.edit", "customers.view", "customers.create", "customers.edit", "products.view", "products.create", "products.edit", "products.stock.manage", "vehicles.view", "vehicles.manage", "personnel.view", "personnel.manage", "routes.view", "routes.manage", "deliveries.view", "deliveries.manage", "reports.view"] },
  COURIER: { name: "Kurye", permissions: ["dashboard.view", "orders.view", "customers.view", "products.view", "vehicles.view", "routes.view", "routes.manage", "deliveries.view", "deliveries.manage"] },
  ACCOUNTING: { name: "Muhasebe", permissions: ["dashboard.view", "customers.view", "orders.view", "finance.view", "finance.manage", "reports.view", "reports.export"] },
  CALL_CENTER: { name: "Çağrı Merkezi", permissions: ["dashboard.view", "customers.view", "customers.create", "customers.edit", "orders.view", "orders.create", "orders.edit"] },
  MANAGER: { name: "Müdür", permissions: ["dashboard.view", "orders.view", "orders.create", "orders.edit", "customers.view", "customers.create", "customers.edit", "products.view", "vehicles.view", "personnel.view", "routes.view", "routes.manage", "deliveries.view", "deliveries.manage", "reports.view", "reports.export", "audit.view", "roles.view", "users.view"] },
  WAREHOUSE: { name: "Depo", permissions: ["dashboard.view", "orders.view", "products.view", "products.create", "products.edit", "products.stock.manage", "routes.view"] },
};

function slugify(value: string) {
  return value.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70) || "firma";
}

export async function createUniqueTenantSlug(tx: Prisma.TransactionClient, companyName: string, preferredSlug?: string) {
  const base = slugify(preferredSlug || companyName);
  let slug = base;
  let suffix = 2;
  while (await tx.tenant.findUnique({ where: { slug }, select: { id: true } })) slug = `${base}-${suffix++}`;
  return slug;
}

async function ensurePermissionCatalog(tx: Prisma.TransactionClient) {
  const groups = new Map<string, string>();
  for (const [key, name] of permissionGroups) {
    const group = await tx.permissionGroup.findFirst({ where: { tenantId: null, key, deletedAt: null } }) ?? await tx.permissionGroup.create({ data: { key, name, isSystem: true } });
    groups.set(key, group.id);
  }
  const permissions = new Map<string, string>();
  for (const [groupKey, key, name] of permissionDefinitions) {
    const permission = await tx.permission.findFirst({ where: { tenantId: null, key, deletedAt: null } }) ?? await tx.permission.create({ data: { groupId: groups.get(groupKey)!, key, name, isSystem: true } });
    permissions.set(key, permission.id);
  }
  return permissions;
}

export async function provisionTenant(tx: Prisma.TransactionClient, input: RegisterInput) {
  const startsAt = new Date();
  const trialEndsAt = new Date(startsAt);
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);
  const tenant = await tx.tenant.create({ data: { name: input.companyName, slug: await createUniqueTenantSlug(tx, input.companyName, input.companySlug), onboardingStep: 1 } });
  const permissions = await ensurePermissionCatalog(tx);
  const roles = new Map<string, string>();
  for (const [key, definition] of Object.entries(roleDefinitions)) {
    const role = await tx.role.create({ data: { tenantId: tenant.id, key, name: definition.name, isSystem: true, isSuperAdmin: key === "SUPER_ADMIN" } });
    roles.set(key, role.id);
    await tx.rolePermission.createMany({ data: definition.permissions.map((permissionKey) => ({ tenantId: tenant.id, roleId: role.id, permissionId: permissions.get(permissionKey)! })) });
  }
  const user = await tx.user.create({ data: { tenantId: tenant.id, email: input.email, phone: input.phone, name: input.fullName, passwordHash: await hashPassword(input.password), role: LegacyUserRole.ADMIN } });
  await tx.userRole.create({ data: { tenantId: tenant.id, userId: user.id, roleId: roles.get("SUPER_ADMIN")! } });
  const professional = await tx.subscriptionPackage.upsert({ where: { code: "PROFESSIONAL" }, update: {}, create: { code: "PROFESSIONAL", name: "Professional", monthlyPrice: 999, annualPrice: 9990, maxUsers: 30, maxOrders: 10000, maxWarehouses: 5, maxVehicles: 15, storageGb: 100, apiLimit: 250000, aiUsage: 2500, sortOrder: 3 } });
  await tx.tenantSubscription.create({ data: { tenantId: tenant.id, packageId: professional.id, startsAt, status: "TRIAL", isTrial: true, trialEndsAt, monthlyPrice: professional.monthlyPrice, annualPrice: professional.annualPrice, totalAmount: professional.monthlyPrice } });
  const trialPeriodEnd = new Date(startsAt);
  trialPeriodEnd.setDate(trialPeriodEnd.getDate() + 14);
  await tx.invoice.create({ data: { tenantId: tenant.id, invoiceNumber: `TRIAL-${tenant.slug}-${Date.now()}`, pdfNumber: `TRIAL-PDF-${Date.now()}`, subscriptionId: (await tx.tenantSubscription.findFirstOrThrow({ where: { tenantId: tenant.id } })).id, issueDate: startsAt, dueDate: trialEndsAt, periodStart: startsAt, periodEnd: trialPeriodEnd, status: "DRAFT", subtotal: 0, discountAmount: 0, taxAmount: 0, totalAmount: 0, lines: { create: [{ description: "Professional 14 günlük trial", quantity: 1, unitPrice: 0, totalAmount: 0 }] } } });
  const updatedTenant = await tx.tenant.update({ where: { id: tenant.id }, data: { plan: professional.code, subscriptionStatus: "TRIAL", trialEndsAt, billingStartsAt: startsAt, monthlyPrice: professional.monthlyPrice } });
  return { tenant: updatedTenant, user };
}

export { roleDefinitions };
