import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { handleApiError } from "@/server/errors/handle-api-error";
import { requirePermission } from "@/server/auth/authorization";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("finance.view"); const tenantId = await getCurrentTenantId(); const date = new URL(request.url).searchParams.get("date") ?? new Date().toISOString().slice(0, 10); const start = new Date(`${date}T00:00:00.000Z`); const end = new Date(`${date}T23:59:59.999Z`);
    const upcomingEnd = new Date(start); upcomingEnd.setDate(upcomingEnd.getDate() + 7);
    const [payments, expenses, dueEntries] = await Promise.all([
      prisma.salesPayment.findMany({ where: { tenantId, paidAt: { gte: start, lte: end } }, select: { amount: true, method: true } }),
      prisma.expense.findMany({ where: { tenantId, expenseDate: new Date(date) }, select: { amount: true, type: true, paymentMethod: true } }),
      prisma.partnerLedgerEntry.findMany({ where: { tenantId, dueDate: { gte: start, lte: upcomingEnd }, type: "PURCHASE" }, include: { partner: { select: { name: true } } }, orderBy: { dueDate: "asc" } }),
    ]);
    const total = (items: { amount: unknown }[]) => items.reduce((sum, item) => sum + Number(item.amount), 0);
    const cashSales = total(payments.filter((payment) => payment.method === "CASH")); const ibanSales = total(payments.filter((payment) => payment.method === "IBAN")); const expenseTotal = total(expenses); const fuelTotal = total(expenses.filter((expense) => expense.type === "FUEL"));
    return NextResponse.json({ success: true, data: { date, cashSales, ibanSales, totalSales: total(payments), expenseTotal, fuelTotal, cashExpenses: total(expenses.filter((expense) => expense.paymentMethod === "CASH")), expectedCash: cashSales - total(expenses.filter((expense) => expense.paymentMethod === "CASH")), dueEntries } });
  } catch (error) { return handleApiError(error); }
}
