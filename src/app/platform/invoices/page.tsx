import Link from "next/link";
import { FileText } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { requirePermission } from "@/server/auth/authorization";
import { listPlatformTenants } from "@/features/platform/services/tenant.service";
import { listInvoices } from "@/features/platform/services/billing.service";
import InvoiceManager from "@/features/platform/components/InvoiceManager";

export default async function PlatformInvoicesPage() {
  await requirePermission("invoices.view");
  const [tenantRows, invoiceRows] = await Promise.all([listPlatformTenants(), listInvoices()]);
  const tenants = tenantRows.map(({ id, name }) => ({ id, name }));
  const invoices = invoiceRows.map((item) => ({ ...item, issueDate: item.issueDate.toISOString(), dueDate: item.dueDate.toISOString(), totalAmount: Number(item.totalAmount) }));
  return <DashboardLayout><div className="space-y-6"><div><Link href="/platform" className="text-sm font-medium text-primary">← Platform Merkezi</Link><p className="mt-4 flex items-center gap-2 text-sm font-medium text-primary"><FileText className="size-4" /> Finans merkezi</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Faturalar</h1><p className="mt-2 text-sm text-muted-foreground">Tenant dönem faturalarını ve ödeme durumlarını yönetin.</p></div><InvoiceManager tenants={tenants} invoices={invoices} /></div></DashboardLayout>;
}
