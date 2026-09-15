import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { handleApiError } from "@/server/errors/handle-api-error";
import { requirePermission } from "@/server/auth/authorization";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("finance.view"); const tenantId = await getCurrentTenantId(); const params = new URL(request.url).searchParams; const date = params.get("date") ?? new Date().toISOString().slice(0, 10); const from = params.get("from") ?? date; const to = params.get("to") ?? date; const partnerId = params.get("partnerId") || undefined; const start = new Date(`${from}T00:00:00.000Z`); const end = new Date(`${to}T23:59:59.999Z`);
    if (partnerId && !(await prisma.partner.findFirst({ where: { id: partnerId, tenantId, deletedAt: null }, select: { id: true } }))) return NextResponse.json({ success: false, error: { code: "PARTNER_NOT_FOUND", message: "Seçilen bayi bulunamadı" } }, { status: 404 });
    const upcomingEnd = new Date(end); upcomingEnd.setDate(upcomingEnd.getDate() + 7);
    const [payments, expenses, dueEntries] = await Promise.all([
      prisma.salesPayment.findMany({ where: { tenantId, partnerId, paidAt: { gte: start, lte: end } }, select: { id: true, amount: true, method: true, paidAt: true, referenceNumber: true, order: { select: { orderCode: true } }, customer: { select: { fullName: true } }, partner: { select: { id: true, name: true } } }, orderBy: { paidAt: "asc" } }),
      prisma.expense.findMany({ where: { tenantId, expenseDate: { gte: new Date(`${from}T00:00:00.000Z`), lte: new Date(`${to}T23:59:59.999Z`) } }, select: { amount: true, type: true, paymentMethod: true, category: true, description: true, expenseDate: true } }),
      prisma.partnerLedgerEntry.findMany({ where: { tenantId, dueDate: { gte: end, lte: upcomingEnd }, type: "PURCHASE" }, include: { partner: { select: { name: true } } }, orderBy: { dueDate: "asc" } }),
    ]);
    const total = (items: { amount: unknown }[]) => items.reduce((sum, item) => sum + Number(item.amount), 0);
    const cashSales = total(payments.filter((payment) => payment.method === "CASH")); const ibanSales = total(payments.filter((payment) => payment.method === "IBAN")); const posSales = total(payments.filter((payment) => payment.method === "CARD")); const expenseTotal = total(expenses); const fuelTotal = total(expenses.filter((expense) => expense.type === "FUEL"));
    return NextResponse.json({ success: true, data: { from, to, date, partnerId: partnerId ?? null, cashSales, ibanSales, posSales, totalSales: total(payments), paymentCount: payments.length, expenseTotal, fuelTotal, cashExpenses: total(expenses.filter((expense) => expense.paymentMethod === "CASH")), expectedCash: cashSales - total(expenses.filter((expense) => expense.paymentMethod === "CASH")), payments, expenses, dueEntries } });
  } catch (error) { return handleApiError(error); }
}
