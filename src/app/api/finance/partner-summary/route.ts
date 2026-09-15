import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { handleApiError } from "@/server/errors/handle-api-error";
import { requirePermission } from "@/server/auth/authorization";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("finance.view"); const tenantId = await getCurrentTenantId(); const date = new URL(request.url).searchParams.get("date") ?? new Date().toISOString().slice(0, 10); const start = new Date(`${date}T00:00:00.000Z`); const end = new Date(`${date}T23:59:59.999Z`);
    const partners = await prisma.partner.findMany({ where: { tenantId, deletedAt: null }, orderBy: { name: "asc" }, select: { id: true, code: true, name: true } });
    const data = await Promise.all(partners.map(async (partner) => {
      const payments = await prisma.salesPayment.findMany({ where: { tenantId, partnerId: partner.id, paidAt: { gte: start, lte: end } }, select: { amount: true, method: true } });
      const total = (method?: string) => payments.filter((payment) => !method || payment.method === method).reduce((sum, payment) => sum + Number(payment.amount), 0);
      return { ...partner, ibanSales: total("IBAN"), cashSales: total("CASH"), posSales: total("CARD"), totalSales: total(), paymentCount: payments.length };
    }));
    return NextResponse.json({ success: true, data: { date, partners: data } });
  } catch (error) { return handleApiError(error); }
}
