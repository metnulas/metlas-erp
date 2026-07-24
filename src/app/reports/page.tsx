import Link from "next/link";
import { ArrowLeft, BarChart3, ClipboardList, Package, Truck, UsersRound } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { createDashboardService } from "@/features/dashboard/services/dashboard.service";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Raporlar | METLAS ERP", description: "Operasyon raporlarını inceleyin" };

export default async function ReportsPage() {
  const summary = await createDashboardService().getSummary(await getCurrentTenantId());
  return <DashboardLayout><div className="space-y-6"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" render={<Link href="/" />}><ArrowLeft className="size-4" /></Button><div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Raporlar</h1><p className="mt-1 text-sm text-muted-foreground">Operasyon performansını tek bakışta değerlendirin.</p></div></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><ReportCard icon={<ClipboardList />} label="Bugünkü sipariş" value={summary.todayOrders.toLocaleString("tr-TR")} href="/orders" /><ReportCard icon={<UsersRound />} label="Aktif müşteri" value={summary.activeCustomers.toLocaleString("tr-TR")} href="/customers" /><ReportCard icon={<Truck />} label="Aktif araç" value={summary.activeVehicles.toLocaleString("tr-TR")} href="/vehicles" /><ReportCard icon={<Package />} label="Aktif personel" value={summary.activePersonnel.toLocaleString("tr-TR")} href="/personnel" /></div><section className="rounded-2xl border border-border/70 bg-card p-6"><div className="flex items-center gap-3"><BarChart3 className="size-5 text-primary" /><div><h2 className="font-semibold">Son 7 gün sipariş hacmi</h2><p className="text-sm text-muted-foreground">Gün bazında oluşturulan aktif siparişler.</p></div></div><div className="mt-6 grid gap-3 sm:grid-cols-7">{summary.weeklyOrders.map((day) => <div key={day.gun} className="rounded-xl bg-muted/40 p-3 text-center"><p className="text-xs text-muted-foreground">{day.gun.slice(0, 3)}</p><p className="mt-2 text-xl font-bold text-primary">{day.satis}</p><p className="text-[11px] text-muted-foreground">sipariş</p></div>)}</div></section></div></DashboardLayout>;
}

function ReportCard({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href: string }) { return <Link href={href} className="group rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">{icon}</span><p className="mt-5 text-sm text-muted-foreground">{label}</p><p className="mt-1 text-3xl font-bold tracking-tight group-hover:text-primary">{value}</p></Link>; }
