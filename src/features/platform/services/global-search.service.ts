import { prisma } from "@/lib/db/prisma";
import type { GlobalSearchInput } from "@/features/platform/validators/global-search.schema";

export async function searchPlatform({ q }: GlobalSearchInput) {
  const search = { contains: q, mode: "insensitive" as const };
  const [tenants, users, orders, customers] = await Promise.all([
    prisma.tenant.findMany({ where: { OR: [{ name: search }, { slug: search }] }, select: { id: true, name: true, slug: true, isActive: true }, take: 8, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { deletedAt: null, OR: [{ name: search }, { email: search }, { phone: search }] }, select: { id: true, name: true, email: true, phone: true, tenant: { select: { id: true, name: true } } }, take: 8, orderBy: { name: "asc" } }),
    prisma.order.findMany({ where: { deletedAt: null, OR: [{ orderCode: search }, { customer: { fullName: search } }, { customer: { phone: search } }] }, select: { id: true, orderCode: true, status: true, grandTotal: true, tenant: { select: { id: true, name: true } }, customer: { select: { fullName: true, phone: true } } }, take: 8, orderBy: { createdAt: "desc" } }),
    prisma.customer.findMany({ where: { deletedAt: null, OR: [{ fullName: search }, { phone: search }, { customerCode: search }] }, select: { id: true, customerCode: true, fullName: true, phone: true, tenant: { select: { id: true, name: true } } }, take: 8, orderBy: { fullName: "asc" } }),
  ]);
  return { tenants, users, orders: orders.map((order) => ({ ...order, grandTotal: Number(order.grandTotal) })), customers };
}
