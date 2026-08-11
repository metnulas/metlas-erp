import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { handleApiError } from "@/server/errors/handle-api-error";
import { listPackages } from "@/features/platform/services/subscription.service";
import { activateSelfServiceSubscription } from "@/features/platform/services/subscription.service";
import { generateInvoice } from "@/features/platform/services/billing.service";
import { createPayment } from "@/features/platform/services/billing.service";
import { demoPaymentProvider } from "@/features/billing/providers/payment-provider";

export async function GET() { try { const session = await getServerSession(authOptions); if (!session?.user?.tenantId) throw new Error("Tenant oturumu gerekli"); const [packages, subscription] = await Promise.all([listPackages(), prisma.tenantSubscription.findFirst({ where: { tenantId: session.user.tenantId }, orderBy: { startsAt: "desc" }, include: { package: true } })]); return NextResponse.json({ success: true, data: { packages, subscription } }); } catch (error) { return handleApiError(error); } }
export async function POST(request: Request) { try { const session = await getServerSession(authOptions); if (!session?.user?.tenantId || !session.user.email) throw new Error("Tenant oturumu gerekli"); const body = await request.json() as { packageId?: string }; if (!body.packageId) return NextResponse.json({ success: false, error: { code: "PACKAGE_REQUIRED", message: "Paket seçimi gerekli" } }, { status: 400 }); const subscription = await activateSelfServiceSubscription(session.user.tenantId, body.packageId, session.user.id); const start = new Date(); const due = new Date(start); due.setDate(due.getDate() + 7); const invoice = await generateInvoice({ tenantId: session.user.tenantId, periodStart: start.toISOString(), dueDate: due.toISOString() }, session.user.id); const paymentResult = await demoPaymentProvider.createPayment({ amount: Number(invoice.totalAmount), currency: "TRY", reference: invoice.invoiceNumber, email: session.user.email }); const payment = await createPayment({ tenantId: session.user.tenantId, invoiceId: invoice.id, amount: Number(invoice.totalAmount), method: "OTHER", referenceNumber: paymentResult.providerReference, description: "Demo ödeme", status: paymentResult.status }, session.user.id); return NextResponse.json({ success: true, data: { subscription, invoice, payment } }); } catch (error) { return handleApiError(error); } }
