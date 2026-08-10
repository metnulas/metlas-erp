import { Building2, ShieldCheck } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { requirePermission } from "@/server/auth/authorization";
import { prisma } from "@/lib/db/prisma";

export default async function PlatformPage() {
  await requirePermission("platform.view");
  const tenants = await prisma.tenant.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true, slug: true, isActive: true, createdAt: true, _count: { select: { users: true, customers: true, orders: true } } } });
  return <DashboardLayout><div className="space-y-6"><div><p className="flex items-center gap-2 text-sm font-medium text-primary"><ShieldCheck className="size-4" /> Global yönetim</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Platform Merkezi</h1><p className="mt-2 text-sm text-muted-foreground">Tenant, lisans, paket ve sistem ayarlarını platform seviyesinde yönetin.</p></div><div className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"><Building2 className="size-5 text-primary" /><p className="mt-4 text-sm text-muted-foreground">Tenant sayısı</p><p className="mt-1 text-3xl font-bold">{tenants.length}</p></div></div><div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"><h2 className="font-semibold">Tenantlar</h2><div className="mt-4 divide-y divide-border/70">{tenants.map((tenant) => <div key={tenant.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-medium">{tenant.name}</p><p className="text-xs text-muted-foreground">{tenant.slug} · {tenant._count.users} kullanıcı · {tenant._count.customers} müşteri · {tenant._count.orders} sipariş</p></div><span className={`rounded-full px-2 py-1 text-xs ${tenant.isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{tenant.isActive ? "Aktif" : "Pasif"}</span></div>)}</div></div></div></DashboardLayout>;
}
