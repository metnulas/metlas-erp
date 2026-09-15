import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { handleApiError } from "@/server/errors/handle-api-error";
import { requirePermission } from "@/server/auth/authorization";

const entrySchema = z.object({ type: z.enum(["PURCHASE", "SALE", "PAYMENT_TO_PARTNER", "COLLECTION_FROM_PARTNER", "ADJUSTMENT"]), amount: z.coerce.number().positive(), dueDate: z.string().optional(), notes: z.string().trim().max(2000).optional() });

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("finance.view");
    const tenantId = await getCurrentTenantId(); const { id } = await params;
    const entries = await prisma.partnerLedgerEntry.findMany({ where: { tenantId, partnerId: id }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, data: entries });
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission("finance.manage");
    const tenantId = await getCurrentTenantId(); const { id } = await params; const input = entrySchema.parse(await request.json());
    const partner = await prisma.partner.findFirst({ where: { id, tenantId, deletedAt: null }, select: { id: true } });
    if (!partner) return NextResponse.json({ success: false, error: { code: "PARTNER_NOT_FOUND", message: "Bayi bulunamadı" } }, { status: 404 });
    const entry = await prisma.partnerLedgerEntry.create({ data: { tenantId, partnerId: id, type: input.type, amount: input.amount, dueDate: input.dueDate ? new Date(input.dueDate) : null, notes: input.notes || null, createdBy: session.user.id } });
    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) { return handleApiError(error); }
}
