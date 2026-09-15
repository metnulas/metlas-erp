import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { handleApiError } from "@/server/errors/handle-api-error";
import { requirePermission } from "@/server/auth/authorization";

const partnerSchema = z.object({
  code: z.string().trim().min(2).max(30),
  name: z.string().trim().min(2).max(120),
  type: z.enum(["SUPPLIER", "DEALER", "BOTH"]).default("BOTH"),
  phone: z.string().trim().max(30).optional(),
  email: z.string().email().optional().or(z.literal("")),
  taxNumber: z.string().trim().max(30).optional(),
  iban: z.string().trim().max(50).optional(),
  paymentTermDays: z.coerce.number().int().min(0).max(365).default(0),
  notes: z.string().trim().max(2000).optional(),
});

export async function GET() {
  try {
    await requirePermission("customers.view");
    const tenantId = await getCurrentTenantId();
    const partners = await prisma.partner.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { name: "asc" },
      include: {
        ledgerEntries: { select: { type: true, amount: true } },
        salesPayments: { select: { amount: true, method: true } },
      },
    });
    const data = partners.map(
      ({ ledgerEntries, salesPayments, ...partner }) => {
        const balance = ledgerEntries.reduce((sum, entry) => {
          const amount = Number(entry.amount);
          return (
            sum +
            (["PURCHASE", "COLLECTION_FROM_PARTNER", "ADJUSTMENT"].includes(
              entry.type,
            )
              ? amount
              : -amount)
          );
        }, 0);
        const purchases = ledgerEntries
          .filter((entry) => entry.type === "PURCHASE")
          .reduce((sum, entry) => sum + Number(entry.amount), 0);
        const paidToPartner = ledgerEntries
          .filter((entry) => entry.type === "PAYMENT_TO_PARTNER")
          .reduce((sum, entry) => sum + Number(entry.amount), 0);
        const ibanSales = salesPayments
          .filter((payment) => payment.method === "IBAN")
          .reduce((sum, payment) => sum + Number(payment.amount), 0);
        return {
          ...partner,
          balance,
          purchases,
          paidToPartner,
          ibanSales,
          ibanCovered: Math.min(Math.max(0, balance), ibanSales),
          remainingDebtAfterIban: Math.max(0, balance - ibanSales),
        };
      },
    );
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission("finance.manage");
    const tenantId = await getCurrentTenantId();
    const input = partnerSchema.parse(await request.json());
    const partner = await prisma.partner.create({
      data: {
        ...input,
        tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return NextResponse.json({ success: true, data: partner }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
