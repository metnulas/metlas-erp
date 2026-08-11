import Link from "next/link";
import { Package } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { requirePermission } from "@/server/auth/authorization";
import { listPackages } from "@/features/platform/services/subscription.service";
import PackageManager from "@/features/platform/components/PackageManager";

export default async function PlatformPackagesPage() {
  await requirePermission("packages.view");
  const packages = (await listPackages()).map((item) => ({ ...item, monthlyPrice: Number(item.monthlyPrice), annualPrice: Number(item.annualPrice) }));
  return <DashboardLayout><div className="space-y-6"><div><Link href="/platform" className="text-sm font-medium text-primary">← Platform Merkezi</Link><p className="mt-4 flex items-center gap-2 text-sm font-medium text-primary"><Package className="size-4" /> Paket kataloğu</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Paketler</h1><p className="mt-2 text-sm text-muted-foreground">Starter’dan Enterprise’a kadar limit ve fiyat politikalarını yönetin.</p></div><PackageManager packages={packages} /></div></DashboardLayout>;
}
