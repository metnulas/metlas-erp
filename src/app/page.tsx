import Link from "next/link";
import { Activity, CalendarDays, CloudSun, Package, Plus, ShoppingCart, Truck, Users, Wallet, Wind } from "lucide-react";
import RouteCenter from "@/components/dashboard/RouteCenter";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "@/shared/constants/order-status";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { createDashboardService } from "@/features/dashboard/services/dashboard.service";

export default async function Home() {
  const summary = await createDashboardService().getSummary(await getCurrentTenantId());
  return <DashboardLayout>
    <div className="space-y-6 sm:space-y-8">
      <header className="flex flex-col justify-between gap-4 rounded-2xl border border-border/70 bg-card/80 px-5 py-5 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center sm:px-7">
        <div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary"><span className="size-2 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" /> Operasyon merkezi</p><h1 className="mt-1 text-3xl font-bold tracking-[-0.045em] text-foreground sm:text-4xl">Genel Bakış</h1><p className="mt-1 text-sm text-muted-foreground">Bugünün operasyonunu tek ekrandan yönetin.</p></div>
        <div className="flex flex-wrap gap-2"><Button variant="outline" render={<Link href="/reports" />}><CalendarDays className="size-4" /> Raporlar</Button><Button render={<Link href="/orders/new" />}><Plus className="size-4" /> Yeni sipariş</Button></div>
      </header>

      <RouteCenter orders={summary.routeOrders} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={<Users />} tone="blue" label="Toplam müşteri" value={summary.activeCustomers.toLocaleString("tr-TR")} detail="Aktif müşteri" />
        <MetricCard icon={<ShoppingCart />} tone="violet" label="Bugünkü sipariş" value={summary.todayOrders.toLocaleString("tr-TR")} detail={`${summary.pendingDeliveries} bekleyen dağıtım`} />
        <MetricCard icon={<Wallet />} tone="orange" label="Bugünkü ciro" value={summary.todayRevenue.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })} detail="Teslim edilen siparişler" />
        <MetricCard icon={<Truck />} tone="green" label="Aktif araç" value={summary.activeVehicles.toLocaleString("tr-TR")} detail={`${summary.activePersonnel} aktif personel`} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Son hareketler</p><h2 className="mt-1 text-xl font-bold tracking-tight">Son siparişler</h2></div><Button size="sm" variant="outline" render={<Link href="/orders" />}>Tümünü gör</Button></div><div className="mt-4 divide-y divide-border/70">{summary.recentOrders.length === 0 ? <p className="py-6 text-sm text-muted-foreground">Henüz sipariş bulunmuyor.</p> : summary.recentOrders.map((order) => <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between gap-3 py-3 transition-colors hover:text-primary"><div className="min-w-0"><p className="truncate font-mono text-sm font-semibold">{order.orderCode}</p><p className="truncate text-xs text-muted-foreground">{order.customerName} · {new Date(order.orderDate).toLocaleDateString("tr-TR")}</p></div><div className="shrink-0 text-right"><span className={`rounded-full px-2 py-1 text-[11px] font-medium ${ORDER_STATUS_STYLES[order.status] ?? "bg-muted text-muted-foreground"}`}>{ORDER_STATUS_LABELS[order.status] ?? order.status}</span><p className="mt-1 text-xs font-semibold">{order.grandTotal.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</p></div></Link>)}</div></div>
        <div className="space-y-4"><div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Günün koşulları</p><h2 className="mt-1 text-xl font-bold tracking-tight">Saha durumu</h2><div className="mt-5 grid grid-cols-3 gap-2 text-center"><WeatherItem icon={<CloudSun />} label="Hava" value="Açık" /><WeatherItem icon={<Activity />} label="Sıcaklık" value="28°C" /><WeatherItem icon={<Wind />} label="Rüzgar" value="12 km/s" /></div></div><div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Hızlı kısayollar</p><div className="mt-4 grid grid-cols-2 gap-2"><QuickAction href="/orders/new" label="Yeni sipariş" icon={<Plus />} /><QuickAction href="/customers/new" label="Müşteri ekle" icon={<Users />} /><QuickAction href="/deliveries" label="Dağıtım planla" icon={<Truck />} /><QuickAction href="/products" label="Stok kontrol" icon={<Package />} /></div></div></div>
      </section>
    </div>
  </DashboardLayout>;
}

function MetricCard({ icon, tone, label, value, detail }: { icon: React.ReactNode; tone: "blue" | "violet" | "orange" | "green"; label: string; value: string; detail: string }) {
  const tones = { blue: "bg-blue-100 text-blue-700", violet: "bg-violet-100 text-violet-700", orange: "bg-orange-100 text-orange-700", green: "bg-emerald-100 text-emerald-700" };
  return <div className="group rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_14px_35px_-26px_rgba(15,23,42,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_20px_42px_-25px_rgba(37,99,235,0.28)]"><div className="flex items-center justify-between"><span className={`grid size-11 place-items-center rounded-xl ${tones[tone]}`}>{icon}</span><span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold tabular-nums text-emerald-600">+ bugün</span></div><p className="mt-5 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">{label}</p><p className="mt-1 text-[38px] font-bold leading-none tracking-[-0.045em] tabular-nums text-slate-950">{value}</p><div className="mt-4 flex items-end justify-between gap-4"><p className="text-xs font-medium text-slate-500">{detail}</p><div className="flex h-6 items-end gap-1" aria-hidden="true">{[35, 52, 42, 68, 56, 78, 64].map((height, index) => <span key={index} className="w-1 rounded-full bg-blue-500/60 transition-all duration-200 group-hover:bg-blue-600" style={{ height: `${height}%` }} />)}</div></div></div>;
}

function WeatherItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-xl bg-muted/55 p-3"><span className="text-primary">{icon}</span><p className="mt-2 text-[11px] text-muted-foreground">{label}</p><p className="mt-0.5 text-sm font-semibold">{value}</p></div>;
}

function QuickAction({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return <Button className="justify-start bg-muted/50 text-xs hover:bg-muted" size="sm" variant="ghost" render={<Link href={href} />}><span className="text-primary">{icon}</span>{label}</Button>;
}
