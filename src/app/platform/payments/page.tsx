import Link from "next/link";
import { WalletCards } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { requirePermission } from "@/server/auth/authorization";
import { listPlatformTenants } from "@/features/platform/services/tenant.service";
import { listInvoices, listPayments } from "@/features/platform/services/billing.service";
import PaymentManager from "@/features/platform/components/PaymentManager";

export default async function PlatformPaymentsPage() {
  await requirePermission("payments.view");
  const [tenantRows, invoiceRows, paymentRows] = await Promise.all([listPlatformTenants(), listInvoices(), listPayments()]);
  const tenants = tenantRows.map(({ id, name }) => ({ id, name }));
  const invoices = invoiceRows.map(({ id, invoiceNumber, tenantId, totalAmount }) => ({ id, invoiceNumber, tenantId, totalAmount: Number(totalAmount) }));
  const payments = paymentRows.map((item) => ({ ...item, amount: Number(item.amount), refundAmount: Number(item.refundAmount), createdAt: item.createdAt.toISOString(), invoice: item.invoice ? { ...item.invoice, totalAmount: Number(item.invoice.totalAmount) } : null }));
  return <DashboardLayout><div className="space-y-6"><div><Link href="/platform" className="text-sm font-medium text-primary">← Platform Merkezi</Link><p className="mt-4 flex items-center gap-2 text-sm font-medium text-primary"><WalletCards className="size-4" /> Finans merkezi</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Ödemeler</h1><p className="mt-2 text-sm text-muted-foreground">Ödeme geçmişi, başarısız işlemler ve iadeleri yönetin.</p></div><PaymentManager tenants={tenants} invoices={invoices} payments={payments} /></div></DashboardLayout>;
}
