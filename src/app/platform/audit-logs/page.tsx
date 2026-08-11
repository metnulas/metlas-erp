import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { requirePermission } from "@/server/auth/authorization";
import PlatformAuditLogList from "@/features/platform/components/PlatformAuditLogList";

export default async function PlatformAuditLogsPage() {
  await requirePermission("platform.audit.view");
  return <DashboardLayout><div className="space-y-6"><div><Link href="/platform" className="text-sm font-medium text-primary">← Platform Merkezi</Link><p className="mt-4 flex items-center gap-2 text-sm font-medium text-primary"><ClipboardCheck className="size-4" /> Güvenlik ve izlenebilirlik</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Platform Audit Log</h1><p className="mt-2 text-sm text-muted-foreground">Global yönetim, tenant değişimi, fatura ve ödeme işlemlerini inceleyin.</p></div><PlatformAuditLogList /></div></DashboardLayout>;
}
