import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/server/errors/app-error";
import { createUniqueTenantSlug } from "@/server/tenancy/tenant-provisioning";

export async function listPlatformTenants() {
  return prisma.tenant.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true, slug: true, isActive: true, plan: true, subscriptionStatus: true, trialEndsAt: true, lastPaymentAt: true, nextPaymentAt: true, monthlyPrice: true, discountAmount: true, manualCharge: true, createdAt: true, _count: { select: { users: true, customers: true, orders: true } } } });
}

export async function getPlatformDashboardSummary() {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const [tenantCount, activeTenants, trialTenants, newTenants, totalUsers, totalOrders, revenue, mrr] = await Promise.all([
    prisma.tenant.count(), prisma.tenant.count({ where: { isActive: true } }), prisma.tenant.count({ where: { subscriptionStatus: "TRIAL" } }), prisma.tenant.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.user.count({ where: { deletedAt: null } }), prisma.order.count({ where: { deletedAt: null } }), prisma.order.aggregate({ where: { deletedAt: null, status: "DELIVERED" }, _sum: { grandTotal: true } }), prisma.tenant.aggregate({ where: { isActive: true }, _sum: { monthlyPrice: true } }),
  ]);
  return { tenantCount, activeTenants, passiveTenants: tenantCount - activeTenants, trialTenants, newTenants, totalUsers, totalOrders, totalRevenue: Number(revenue._sum.grandTotal ?? 0), mrr: Number(mrr._sum.monthlyPrice ?? 0), arr: Number(mrr._sum.monthlyPrice ?? 0) * 12 };
}

export async function createPlatformTenant(name: string) {
  return prisma.$transaction(async (tx) => tx.tenant.create({ data: { name, slug: await createUniqueTenantSlug(tx, name) } }));
}

export async function updatePlatformTenant(id: string, input: { name?: string; isActive?: boolean }) {
  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) throw new AppError("Tenant bulunamadı", 404, "TENANT_NOT_FOUND");
  return prisma.tenant.update({ where: { id }, data: input });
}

export async function deletePlatformTenant(id: string) {
  const tenant = await prisma.tenant.findUnique({ where: { id }, select: { id: true, users: { select: { id: true }, take: 1 }, customers: { select: { id: true }, take: 1 }, orders: { select: { id: true }, take: 1 } } });
  if (!tenant) throw new AppError("Tenant bulunamadı", 404, "TENANT_NOT_FOUND");
  if (tenant.users.length || tenant.customers.length || tenant.orders.length) throw new AppError("Verisi bulunan tenant silinemez; pasifleştirin", 400, "TENANT_NOT_EMPTY");
  await prisma.tenant.delete({ where: { id } });
  return { deleted: true };
}
