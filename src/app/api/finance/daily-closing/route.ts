import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { requirePermission } from "@/server/auth/authorization";
import { handleApiError } from "@/server/errors/handle-api-error";

const schema = z.object({ closingDate: z.string(), openingCash: z.coerce.number().min(0), actualCash: z.coerce.number().min(0), notes: z.string().trim().max(1000).optional() });

export async function GET(request: NextRequest) {
  try { await requirePermission("finance.view"); const tenantId = await getCurrentTenantId(); const date = new URL(request.url).searchParams.get("date") ?? new Date().toISOString().slice(0, 10); return NextResponse.json({ success: true, data: await prisma.dailyClosing.findUnique({ where: { tenantId_closingDate: { tenantId, closingDate: new Date(date) } } }) }); } catch (error) { return handleApiError(error); }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission("finance.manage"); const tenantId = await getCurrentTenantId(); const input = schema.parse(await request.json()); const date = new Date(input.closingDate); const start = new Date(`${input.closingDate}T00:00:00.000Z`); const end = new Date(`${input.closingDate}T23:59:59.999Z`);
    const [payments, expenses] = await Promise.all([prisma.salesPayment.aggregate({ where: { tenantId, method: "CASH", paidAt: { gte: start, lte: end } }, _sum: { amount: true } }), prisma.expense.aggregate({ where: { tenantId, expenseDate: date, paymentMethod: "CASH" }, _sum: { amount: true } })]);
    const cashSales = Number(payments._sum.amount ?? 0); const cashExpenses = Number(expenses._sum.amount ?? 0); const expectedCash = input.openingCash + cashSales - cashExpenses; const saved = await prisma.dailyClosing.upsert({ where: { tenantId_closingDate: { tenantId, closingDate: date } }, update: { openingCash: input.openingCash, cashSales, cashExpenses, expectedCash, actualCash: input.actualCash, difference: input.actualCash - expectedCash, notes: input.notes || null, status: "CLOSED", closedAt: new Date(), closedBy: session.user.id }, create: { tenantId, closingDate: date, openingCash: input.openingCash, cashSales, cashExpenses, expectedCash, actualCash: input.actualCash, difference: input.actualCash - expectedCash, notes: input.notes || null, status: "CLOSED", closedAt: new Date(), closedBy: session.user.id } });
    return NextResponse.json({ success: true, data: saved });
  } catch (error) { return handleApiError(error); }
}
