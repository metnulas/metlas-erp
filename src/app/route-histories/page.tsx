import Link from "next/link";
import { ArrowLeft, Fuel, History, MapPinned, Route, TrendingUp } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { listRouteHistories } from "@/features/routes/services/route-history.service";
import FuelPriceEditor from "@/features/routes/components/FuelPriceEditor";

type RouteStop = { orderCode?: string; customerName?: string; latitude?: number; longitude?: number };

function money(value: unknown) {
  return Number(value ?? 0).toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

export default async function RouteHistoriesPage() {
  const histories = await listRouteHistories(await getCurrentTenantId());
  const totalDistance = histories.reduce((sum, history) => sum + history.distanceKm, 0);
  const totalRevenue = histories.reduce((sum, history) => sum + Number(history.revenue), 0);
  const totalFuelCost = histories.reduce((sum, history) => sum + Number(history.estimatedFuelCost), 0);

  return <DashboardLayout>
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="flex items-center gap-2 text-sm font-medium text-primary"><History className="size-4" /> Operasyon arşivi</p><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Geçmiş rotalarım</h1><p className="mt-1 text-sm text-muted-foreground">Günlük rota snapshot’ları ve tahmini operasyon maliyetleri.</p></div>
        <Button variant="outline" render={<Link href="/" />}><ArrowLeft className="size-4" /> Dashboard’a dön</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3"><Metric title="Toplam mesafe" value={`${totalDistance.toLocaleString("tr-TR", { maximumFractionDigits: 1 })} km`} icon={<Route className="size-5" />} /><Metric title="Tahmini yakıt maliyeti" value={money(totalFuelCost)} icon={<Fuel className="size-5" />} /><Metric title="Teslim edilen ciro" value={money(totalRevenue)} icon={<TrendingUp className="size-5" />} /></div>
      {histories.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-12 text-center"><MapPinned className="mx-auto size-9 text-muted-foreground" /><p className="mt-3 font-medium">Henüz kayıtlı rota yok</p><p className="mt-1 text-sm text-muted-foreground">Dashboard’da rota oluşturulduğunda günlük kayıt otomatik tutulur.</p></div> : <div className="space-y-4">{histories.map((history) => {
        const stops = Array.isArray(history.stops) ? history.stops as RouteStop[] : [];
        const lastStop = stops[stops.length - 1];
        const googleUrl = lastStop?.latitude !== undefined && lastStop.longitude !== undefined ? `https://www.google.com/maps/dir/?api=1&destination=${lastStop.latitude},${lastStop.longitude}&travelmode=driving` : null;
        return <article key={history.id} className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium text-primary">{new Date(history.routeDate).toLocaleDateString("tr-TR", { dateStyle: "full", timeZone: "UTC" })}</p><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${history.distanceSource === "GPS_OSRM" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{history.distanceSource === "GPS_OSRM" ? "GPS / yol mesafesi" : "Planlanan mesafe"}</span></div><h2 className="mt-1 text-xl font-bold">{history.orderCount} teslimat noktası</h2><p className="mt-1 text-sm text-muted-foreground">{stops.map((stop) => stop.customerName || stop.orderCode).filter(Boolean).join(" → ") || "Durak bilgisi yok"}</p></div>{googleUrl && <Button size="sm" variant="outline" render={<a href={googleUrl} target="_blank" rel="noreferrer" />}><MapPinned className="size-4" /> Son durağı aç</Button>}</div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><Stat label="Mesafe" value={`${history.distanceKm.toLocaleString("tr-TR", { maximumFractionDigits: 1 })} km`} /><Stat label="Yakıt tüketimi" value={`${history.estimatedFuelLiters.toLocaleString("tr-TR", { maximumFractionDigits: 1 })} L`} /><div className="rounded-xl bg-muted/50 p-3"><p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Yakıt fiyatı</p><div className="mt-2"><FuelPriceEditor historyId={history.id} initialPrice={Number(history.fuelPricePerLiter)} /></div></div><Stat label="Yakıt maliyeti" value={money(history.estimatedFuelCost)} /><Stat label="Teslim ciro" value={money(history.revenue)} /></div></article>;
      })}</div>}
    </div>
  </DashboardLayout>;
}

function Metric({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) { return <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"><div className="flex items-center gap-2 text-primary">{icon}<span className="text-sm font-medium text-muted-foreground">{title}</span></div><p className="mt-3 text-2xl font-bold tracking-tight">{value}</p></div>; }
function Stat({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-muted/50 p-3"><p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>; }
