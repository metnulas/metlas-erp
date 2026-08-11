import Link from "next/link";
import { LifeBuoy } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { requirePermission } from "@/server/auth/authorization";
import { listPlatformTenants } from "@/features/platform/services/tenant.service";
import SupportTicketManager from "@/features/platform/components/SupportTicketManager";

export default async function PlatformSupportPage() {
  await requirePermission("platform.support.manage");
  const tenants = (await listPlatformTenants()).map(({ id, name }) => ({ id, name }));
  return <DashboardLayout><div className="space-y-6"><div><Link href="/platform" className="text-sm font-medium text-primary">← Platform Merkezi</Link><p className="mt-4 flex items-center gap-2 text-sm font-medium text-primary"><LifeBuoy className="size-4" /> Müşteri başarı merkezi</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Destek Talepleri</h1><p className="mt-2 text-sm text-muted-foreground">Tenant taleplerini yönetin, yanıtlayın ve durumlarını takip edin.</p></div><SupportTicketManager tenants={tenants} /></div></DashboardLayout>;
}
