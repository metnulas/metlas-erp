import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { handleApiError } from "@/server/errors/handle-api-error";
import { requirePermission } from "@/server/auth/authorization";

const expenseSchema = z.object({ category: z.string().trim().min(2).max(60), type: z.enum(["FUEL", "OTHER"]).default("OTHER"), description: z.string().trim().min(2).max(200), amount: z.coerce.number().positive(), expenseDate: z.string(), paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "CARD", "OTHER"]).default("CASH"), bankAccountId: z.string().optional(), vehicleId: z.string().optional(), liters: z.coerce.number().positive().optional(), odometer: z.coerce.number().int().positive().optional(), notes: z.string().trim().max(2000).optional() });

export async function GET(request: NextRequest) {
  try {
    await requirePermission("finance.view"); const tenantId = await getCurrentTenantId(); const date = new URL(request.url).searchParams.get("date");
    const expenses = await prisma.expense.findMany({ where: { tenantId, ...(date ? { expenseDate: new Date(date) } : {}) }, orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }] });
    return NextResponse.json({ success: true, data: expenses });
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission("finance.manage"); const tenantId = await getCurrentTenantId(); const input = expenseSchema.parse(await request.json());
    const expense = await prisma.expense.create({ data: { ...input, tenantId, expenseDate: new Date(input.expenseDate), bankAccountId: input.bankAccountId || null, vehicleId: input.vehicleId || null, createdBy: session.user.id, updatedAt: new Date() } });
    return NextResponse.json({ success: true, data: expense }, { status: 201 });
  } catch (error) { return handleApiError(error); }
}
