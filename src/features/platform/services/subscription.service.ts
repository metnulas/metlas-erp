import { prisma } from "@/lib/db/prisma";
import { recordAudit } from "@/server/audit/audit-log";
import type { PackageInput, PackageUpdateInput, SubscriptionInput } from "@/features/platform/validators/subscription.schema";
import { AppError } from "@/server/errors/app-error";

function dateOrNull(value?: string) {
  return value ? new Date(value) : null;
}

function calculateTotal(price: number, discount: number, taxRate: number) {
  const taxable = Math.max(0, price - discount);
  return Number((taxable + taxable * (taxRate / 100)).toFixed(2));
}

export async function listPackages() {
  return prisma.subscriptionPackage.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], include: { _count: { select: { subscriptions: true } } } });
}

export async function createPackage(input: PackageInput, actorId: string) {
  const item = await prisma.subscriptionPackage.create({ data: input });
  await recordAudit({ tenantId: null, actorId, action: "PACKAGE_CREATE", entityType: "SubscriptionPackage", entityId: item.id, metadata: input });
  return item;
}

export async function updatePackage(id: string, input: PackageUpdateInput, actorId: string) {
  const existing = await prisma.subscriptionPackage.findUnique({ where: { id } });
  if (!existing) throw new AppError("Paket bulunamadı", 404, "PACKAGE_NOT_FOUND");
  const item = await prisma.subscriptionPackage.update({ where: { id }, data: input });
  await recordAudit({ tenantId: null, actorId, action: "PACKAGE_UPDATE", entityType: "SubscriptionPackage", entityId: id, metadata: input });
  return item;
}

export async function deletePackage(id: string, actorId: string) {
  const packageWithSubscriptions = await prisma.subscriptionPackage.findUnique({ where: { id }, include: { _count: { select: { subscriptions: true } } } });
  if (!packageWithSubscriptions) throw new AppError("Paket bulunamadı", 404, "PACKAGE_NOT_FOUND");
  if (packageWithSubscriptions._count.subscriptions > 0) throw new AppError("Kullanılmış paket silinemez; pasifleştirin", 400, "PACKAGE_IN_USE");
  await prisma.subscriptionPackage.delete({ where: { id } });
  await recordAudit({ tenantId: null, actorId, action: "PACKAGE_DELETE", entityType: "SubscriptionPackage", entityId: id });
  return { deleted: true };
}

export async function listSubscriptions() {
  return prisma.tenantSubscription.findMany({ orderBy: { createdAt: "desc" }, include: { tenant: { select: { id: true, name: true, slug: true } }, package: { select: { id: true, code: true, name: true, monthlyPrice: true, annualPrice: true } } } });
}

export async function getTenantSubscription(tenantId: string) {
  return prisma.tenantSubscription.findFirst({ where: { tenantId, status: { not: "CANCELLED" } }, orderBy: { startsAt: "desc" }, include: { package: true } });
}

export async function upsertTenantSubscription(input: SubscriptionInput, actorId: string) {
  const packageItem = await prisma.subscriptionPackage.findUnique({ where: { id: input.packageId } });
  if (!packageItem) throw new AppError("Paket bulunamadı", 404, "PACKAGE_NOT_FOUND");
  const tenant = await prisma.tenant.findUnique({ where: { id: input.tenantId }, select: { id: true } });
  if (!tenant) throw new AppError("Tenant bulunamadı", 404, "TENANT_NOT_FOUND");
  const basePrice = input.manualPrice ?? Number(packageItem.monthlyPrice);
  const totalAmount = calculateTotal(basePrice, input.discountAmount, input.taxRate);
  const data = {
    package: { connect: { id: input.packageId } },
    startsAt: new Date(input.startsAt),
    endsAt: dateOrNull(input.endsAt),
    status: input.status,
    isTrial: input.isTrial,
    trialEndsAt: dateOrNull(input.trialEndsAt),
    lastPaymentAt: dateOrNull(input.lastPaymentAt),
    nextPaymentAt: dateOrNull(input.nextPaymentAt),
    monthlyPrice: packageItem.monthlyPrice,
    annualPrice: packageItem.annualPrice,
    discountAmount: input.discountAmount,
    manualPrice: input.manualPrice ?? null,
    taxRate: input.taxRate,
    totalAmount,
    notes: input.notes || null,
  };
  const current = await prisma.tenantSubscription.findFirst({ where: { tenantId: input.tenantId, status: { not: "CANCELLED" } }, orderBy: { startsAt: "desc" } });
  const subscription = current
    ? await prisma.tenantSubscription.update({ where: { id: current.id }, data })
    : await prisma.tenantSubscription.create({ data: { ...data, tenant: { connect: { id: input.tenantId } } } });
  await prisma.tenant.update({ where: { id: input.tenantId }, data: { plan: packageItem.code, subscriptionStatus: input.status, trialEndsAt: data.trialEndsAt, billingStartsAt: data.startsAt, lastPaymentAt: data.lastPaymentAt, nextPaymentAt: data.nextPaymentAt, monthlyPrice: data.manualPrice ?? data.monthlyPrice, discountAmount: data.discountAmount, manualCharge: data.manualPrice ?? 0 } });
  await recordAudit({ tenantId: input.tenantId, actorId, action: "SUBSCRIPTION_UPDATE", entityType: "TenantSubscription", entityId: subscription.id, metadata: { packageId: input.packageId, status: input.status, manualPrice: input.manualPrice ?? null, totalAmount } });
  return subscription;
}

export async function activateSelfServiceSubscription(tenantId: string, packageId: string, actorId: string) {
  const packageItem = await prisma.subscriptionPackage.findUnique({ where: { id: packageId, isActive: true } });
  if (!packageItem) throw new AppError("Paket bulunamadı", 404, "PACKAGE_NOT_FOUND");
  const startsAt = new Date();
  const nextPaymentAt = new Date(startsAt);
  nextPaymentAt.setUTCMonth(nextPaymentAt.getUTCMonth() + 1);
  return upsertTenantSubscription({ tenantId, packageId, startsAt: startsAt.toISOString(), status: "ACTIVE", isTrial: false, discountAmount: 0, manualPrice: null, taxRate: 20, nextPaymentAt: nextPaymentAt.toISOString() }, actorId);
}
