import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import { recordAudit } from "@/server/audit/audit-log";
import { AppError } from "@/server/errors/app-error";
import type { CreatePaymentInput, GenerateInvoiceInput } from "@/features/platform/validators/billing.schema";

function invoiceNumber() {
  return `INV-${new Date().toISOString().slice(0, 7).replace("-", "")}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

function periodEnd(start: Date) {
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);
  end.setUTCMilliseconds(-1);
  return end;
}

export async function listInvoices() {
  return prisma.invoice.findMany({ orderBy: { issueDate: "desc" }, include: { tenant: { select: { id: true, name: true, slug: true } }, subscription: { include: { package: { select: { name: true, code: true } } } }, payments: { select: { id: true, amount: true, status: true } }, lines: true } });
}

export async function getInvoice(id: string) {
  const invoice = await prisma.invoice.findUnique({ where: { id }, include: { tenant: true, subscription: { include: { package: true } }, lines: true, payments: true } });
  if (!invoice) throw new AppError("Fatura bulunamadı", 404, "INVOICE_NOT_FOUND");
  return invoice;
}

export async function generateInvoice(input: GenerateInvoiceInput, actorId: string) {
  const start = new Date(input.periodStart);
  const end = periodEnd(start);
  const subscription = await prisma.tenantSubscription.findFirst({ where: { tenantId: input.tenantId, status: { in: ["ACTIVE", "TRIAL", "PAST_DUE"] }, startsAt: { lte: end } }, orderBy: { startsAt: "desc" }, include: { package: true } });
  if (!subscription) throw new AppError("Tenant için aktif abonelik bulunamadı", 400, "SUBSCRIPTION_NOT_FOUND");
  const existing = await prisma.invoice.findUnique({ where: { tenantId_periodStart_periodEnd: { tenantId: input.tenantId, periodStart: start, periodEnd: end } } });
  if (existing) return existing;
  const subtotal = Number(subscription.manualPrice ?? subscription.monthlyPrice);
  const discountAmount = Number(subscription.discountAmount);
  const taxBase = Math.max(0, subtotal - discountAmount);
  const taxAmount = Number((taxBase * (Number(subscription.taxRate) / 100)).toFixed(2));
  const totalAmount = Number((taxBase + taxAmount).toFixed(2));
  const invoice = await prisma.invoice.create({ data: { tenantId: input.tenantId, subscriptionId: subscription.id, invoiceNumber: invoiceNumber(), pdfNumber: `PDF-${Date.now()}`, issueDate: new Date(), dueDate: new Date(input.dueDate), periodStart: start, periodEnd: end, subtotal, discountAmount, taxAmount, totalAmount, lines: { create: [{ description: `${subscription.package.name} aylık abonelik`, quantity: 1, unitPrice: subtotal, totalAmount: subtotal }] } } });
  await recordAudit({ tenantId: input.tenantId, actorId, action: "INVOICE_CREATE", entityType: "Invoice", entityId: invoice.id, metadata: { invoiceNumber: invoice.invoiceNumber, totalAmount } });
  return invoice;
}

export async function listPayments() {
  return prisma.payment.findMany({ orderBy: { createdAt: "desc" }, include: { tenant: { select: { id: true, name: true, slug: true } }, invoice: { select: { id: true, invoiceNumber: true, totalAmount: true } } } });
}

export async function createPayment(input: CreatePaymentInput, actorId: string) {
  const tenant = await prisma.tenant.findUnique({ where: { id: input.tenantId }, select: { id: true } });
  if (!tenant) throw new AppError("Tenant bulunamadı", 404, "TENANT_NOT_FOUND");
  let invoice = null;
  if (input.invoiceId) {
    invoice = await prisma.invoice.findFirst({ where: { id: input.invoiceId, tenantId: input.tenantId } });
    if (!invoice) throw new AppError("Fatura bulunamadı", 404, "INVOICE_NOT_FOUND");
  }
  const payment = await prisma.payment.create({ data: { tenantId: input.tenantId, invoiceId: input.invoiceId || null, amount: input.amount, method: input.method, referenceNumber: input.referenceNumber || null, description: input.description || null, status: input.status, paidAt: input.status === "SUCCEEDED" ? new Date() : null, failureReason: input.failureReason || null } });
  if (invoice && input.status === "SUCCEEDED") await prisma.invoice.update({ where: { id: invoice.id }, data: { status: input.amount >= Number(invoice.totalAmount) ? "PAID" : "PARTIALLY_PAID" } });
  await recordAudit({ tenantId: input.tenantId, actorId, action: "PAYMENT_CREATE", entityType: "Payment", entityId: payment.id, metadata: { invoiceId: input.invoiceId || null, amount: input.amount, status: input.status } });
  return payment;
}

export async function refundPayment(id: string, amount: number | undefined, actorId: string) {
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) throw new AppError("Ödeme bulunamadı", 404, "PAYMENT_NOT_FOUND");
  if (payment.status !== "SUCCEEDED") throw new AppError("Yalnızca başarılı ödeme iade edilebilir", 400, "PAYMENT_NOT_REFUNDABLE");
  const refundAmount = amount ?? Number(payment.amount);
  if (refundAmount <= 0 || refundAmount > Number(payment.amount) - Number(payment.refundAmount)) throw new AppError("İade tutarı geçersiz", 400, "INVALID_REFUND_AMOUNT");
  const updated = await prisma.payment.update({ where: { id }, data: { status: "REFUNDED", refundAmount: { increment: refundAmount }, refundedAt: new Date() } });
  if (payment.invoiceId) await prisma.invoice.update({ where: { id: payment.invoiceId }, data: { status: "ISSUED" } });
  await recordAudit({ tenantId: payment.tenantId, actorId, action: "PAYMENT_REFUND", entityType: "Payment", entityId: id, metadata: { refundAmount } });
  return updated;
}
