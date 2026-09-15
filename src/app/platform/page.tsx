import Link from "next/link";
import { Building2, ClipboardCheck, CreditCard, FileText, LifeBuoy, Package, ShieldCheck } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { requirePermission } from "@/server/auth/authorization";
import { getPlatformDashboardSummary, listPlatformTenants } from "@/features/platform/services/tenant.service";
import PlatformTenantActions from "@/features/platform/components/PlatformTenantActions";
import ImpersonateTenantButton from "@/features/platform/components/ImpersonateTenantButton";

const quickLinks = [
  { label: "Abonelikler", description: "Paket ve tenant aboneliklerini yönetin.", href: "/platform/subscriptions", icon: CreditCard },
  { label: "Paketler", description: "Fiyat ve kullanım limitlerini düzenleyin.", href: "/platform/packages", icon: Package },
  { label: "Faturalar", description: "Dönem faturası oluşturup takip edin.", href: "/platform/invoices", icon: FileText },
  { label: "Ödemeler", description: "Ödeme ve iadeleri yönetin.", href: "/platform/payments", icon: CreditCard },
  { label: "Destek Talepleri", description: "Müşteri taleplerini yanıtlayın.", href: "/platform/support", icon: LifeBuoy },
  { label: "Audit Kayıtları", description: "Kritik işlemleri izleyin.", href: "/platform/audit-logs", icon: ClipboardCheck },
  { label: "Sistem Ayarları", description: "Platform çalışma ayarlarını yönetin.", href: "/platform/settings", icon: ShieldCheck },
];

export default async function PlatformPage() {
  await requirePermission("platform.view");
  const [tenants, summary] = await Promise.all([listPlatformTenants(), getPlatformDashboardSummary()]);
  const metrics = [
    ["Toplam tenant", summary.tenantCount],
    ["Aktif tenant", summary.activeTenants],
    ["Trial tenant", summary.trialTenants],
    ["Bu ay yeni tenant", summary.newTenants],
    ["Toplam kullanıcı", summary.totalUsers],
    ["Toplam sipariş", summary.totalOrders],
    ["Toplam ciro", summary.totalRevenue.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })],
    ["MRR / ARR", `${summary.mrr.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })} / ${summary.arr.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}`],
  ] as const;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header>
          <p className="flex items-center gap-2 text-sm font-medium text-primary"><ShieldCheck className="size-4" /> Global yönetim</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Platform Merkezi</h1>
          <p className="mt-2 text-sm text-muted-foreground">Tenant, abonelik, faturalama, destek ve sistem ayarlarını tek merkezden yönetin.</p>
        </header>

        <section aria-label="Platform çalışma alanları" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map(({ label, description, href, icon: Icon }) => (
            <Link key={href} href={href} className="group rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
              <Icon className="size-5 text-primary" />
              <p className="mt-3 font-semibold">{label}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
            </Link>
          ))}
        </section>

        <section aria-label="Platform özet metrikleri" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(([label, value]) => <div key={label} className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-3 text-2xl font-bold tabular-nums">{value}</p></div>)}
        </section>

        <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold">Tenant yönetimi</h2><p className="mt-1 text-sm text-muted-foreground">Yeni firma oluşturun, durumunu değiştirin veya tenant görünümüne geçin.</p></div><Building2 className="size-5 text-primary" /></div>
          <div className="mt-4"><PlatformTenantActions /></div>
          <div className="mt-4 divide-y divide-border/70">
            {tenants.map((tenant) => <div key={tenant.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><Building2 className="size-5 text-muted-foreground" /><div><p className="font-semibold">{tenant.name}</p><p className="text-xs text-muted-foreground">{tenant.slug} · {tenant._count.users} kullanıcı · {tenant._count.orders} sipariş</p></div></div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2 py-1 text-xs ${tenant.isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{tenant.isActive ? "Aktif" : "Pasif"}</span><span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">{tenant.subscriptionStatus ?? "Abonelik yok"}</span><ImpersonateTenantButton tenantId={tenant.id} /><PlatformTenantActions tenantId={tenant.id} isActive={tenant.isActive} /></div></div>)}
          </div>
          {tenants.length === 0 && <p className="mt-4 rounded-xl bg-muted p-4 text-sm text-muted-foreground">Henüz tenant bulunmuyor.</p>}
        </section>
      </div>
    </DashboardLayout>
  );
}
