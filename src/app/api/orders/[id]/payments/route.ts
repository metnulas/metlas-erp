import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { requirePermission } from "@/server/auth/authorization";
import { handleApiError } from "@/server/errors/handle-api-error";

const schema = z.object({ amount: z.coerce.number().positive(), method: z.enum(["CASH", "IBAN", "CARD", "CREDIT", "OTHER"]), bankAccountId: z.string().optional(), partnerId: z.string().optional(), referenceNumber: z.string().trim().max(100).optional(), paidAt: z.string().optional(), notes: z.string().trim().max(1000).optional() });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission("finance.manage"); const tenantId = await getCurrentTenantId(); const { id: orderId } = await params; const input = schema.parse(await request.json());
    const order = await prisma.order.findFirst({ where: { id: orderId, tenantId, deletedAt: null }, select: { id: true, customerId: true } });
    if (!order) return NextResponse.json({ success: false, error: { code: "ORDER_NOT_FOUND", message: "Sipariş bulunamadı" } }, { status: 404 });
    const payment = await prisma.$transaction(async (tx) => {
      const saved = await tx.salesPayment.create({ data: { tenantId, orderId, customerId: order.customerId, amount: input.amount, method: input.method, bankAccountId: input.bankAccountId || null, partnerId: input.partnerId || null, referenceNumber: input.referenceNumber || null, paidAt: input.paidAt ? new Date(input.paidAt) : new Date(), notes: input.notes || null, createdBy: session.user.id } });
      if (input.partnerId) await tx.partnerLedgerEntry.create({ data: { tenantId, partnerId: input.partnerId, type: "SALE", amount: input.amount, referenceType: "SALES_PAYMENT", referenceId: saved.id, notes: "Sipariş tahsilatı" } });
      return saved;
    });
    return NextResponse.json({ success: true, data: payment }, { status: 201 });
  } catch (error) { return handleApiError(error); }
}
