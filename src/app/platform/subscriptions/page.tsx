import Link from "next/link";
import { CreditCard } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { requirePermission } from "@/server/auth/authorization";
import { listPlatformTenants } from "@/features/platform/services/tenant.service";
import { listPackages, listSubscriptions } from "@/features/platform/services/subscription.service";
import SubscriptionManager from "@/features/platform/components/SubscriptionManager";

export default async function PlatformSubscriptionsPage() {
  await requirePermission("subscriptions.view");
  const [tenantRows, packageRows, subscriptionRows] = await Promise.all([listPlatformTenants(), listPackages(), listSubscriptions()]);
  const tenants = tenantRows.map(({ id, name, slug }) => ({ id, name, slug }));
  const packages = packageRows.map(({ id, name, code, monthlyPrice, annualPrice }) => ({ id, name, code, monthlyPrice: Number(monthlyPrice), annualPrice: Number(annualPrice) }));
  const subscriptions = subscriptionRows.map((item) => ({ ...item, startsAt: item.startsAt.toISOString(), trialEndsAt: item.trialEndsAt?.toISOString() ?? null, monthlyPrice: Number(item.monthlyPrice), annualPrice: Number(item.annualPrice), discountAmount: Number(item.discountAmount), manualPrice: item.manualPrice === null ? null : Number(item.manualPrice), taxRate: Number(item.taxRate), totalAmount: Number(item.totalAmount), package: { ...item.package, monthlyPrice: Number(item.package.monthlyPrice), annualPrice: Number(item.package.annualPrice) } }));
  return <DashboardLayout><div className="space-y-6"><div><Link href="/platform" className="text-sm font-medium text-primary">← Platform Merkezi</Link><p className="mt-4 flex items-center gap-2 text-sm font-medium text-primary"><CreditCard className="size-4" /> Gelir yönetimi</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Abonelikler</h1><p className="mt-2 text-sm text-muted-foreground">Tenant paketlerini, trial durumunu ve kişiye özel fiyatları yönetin.</p></div><SubscriptionManager tenants={tenants} packages={packages} subscriptions={subscriptions} /></div></DashboardLayout>;
}
