import Link from "next/link";
import { ArrowLeft, Edit, Gauge, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Vehicle } from "@prisma/client";
import type { AssignedVehicleOrder } from "../repositories/vehicle.repository";

const statusLabels: Record<string, string> = { ACTIVE: "Aktif", MAINTENANCE: "Bakımda", INACTIVE: "Pasif" };
const statusStyles: Record<string, string> = { ACTIVE: "bg-emerald-50 text-emerald-700", MAINTENANCE: "bg-amber-50 text-amber-700", INACTIVE: "bg-muted text-muted-foreground" };
const orderLabels: Record<string, string> = { PENDING: "Bekliyor", CONFIRMED: "Onaylandı", DELIVERING: "Dağıtımda", DELIVERED: "Teslim edildi" };
const orderStyles: Record<string, string> = { PENDING: "bg-slate-100 text-slate-700", CONFIRMED: "bg-blue-50 text-blue-700", DELIVERING: "bg-amber-50 text-amber-700", DELIVERED: "bg-emerald-50 text-emerald-700" };

function documentState(value: Date | null) {
  if (!value) return { label: "Belirtilmedi", style: "bg-muted text-muted-foreground" };
  const days = Math.ceil((value.getTime() - Date.now()) / 86400000);
  if (days < 0) return { label: "Süresi geçmiş", style: "bg-red-50 text-red-700" };
  if (days <= 30) return { label: `${days} gün kaldı`, style: "bg-amber-50 text-amber-700" };
  return { label: "Geçerli", style: "bg-emerald-50 text-emerald-700" };
}

export default function VehicleDetail({ vehicle, orders }: { vehicle: Vehicle; orders: AssignedVehicleOrder[] }) {
  const inspection = documentState(vehicle.inspectionDate);
  const insurance = documentState(vehicle.insuranceDate);
  return <div className="space-y-6">
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div className="flex min-w-0 items-center gap-3"><Button variant="ghost" size="icon" render={<Link href="/vehicles" />}><ArrowLeft className="size-4" /></Button><div className="min-w-0"><h1 className="truncate text-2xl font-bold tracking-tight">{vehicle.plate}</h1><p className="font-mono text-xs text-muted-foreground">{vehicle.code}</p></div></div><Button className="w-full md:w-auto" variant="outline" render={<Link href={`/vehicles/${vehicle.id}/edit`} />}><Edit className="size-4" /> Düzenle</Button></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat label="Durum" value={statusLabels[vehicle.status] ?? vehicle.status} tone={statusStyles[vehicle.status]} /><Stat label="Araç Tipi" value={vehicle.type} /><Stat label="Kapasite" value={`${vehicle.capacity} ${vehicle.capacityUnit}`} /><Stat label="Kilometre" value={`${vehicle.mileage.toLocaleString("tr-TR")} km`} /></div>
    <div className="grid gap-6 lg:grid-cols-2"><section className="rounded-xl border border-border/70 bg-card p-6"><h2 className="mb-5 flex items-center gap-2 text-lg font-semibold"><Truck className="size-5 text-primary" /> Araç Bilgileri</h2><div className="grid gap-4 sm:grid-cols-2"><Info label="Marka" value={vehicle.brand} /><Info label="Model" value={vehicle.model} /><Info label="Model Yılı" value={vehicle.modelYear?.toString()} /><Info label="Kapasite Birimi" value={vehicle.capacityUnit} /></div></section><section className="rounded-xl border border-border/70 bg-card p-6"><h2 className="mb-5 flex items-center gap-2 text-lg font-semibold"><Gauge className="size-5 text-primary" /> Belge Takibi</h2><div className="grid gap-4 sm:grid-cols-2"><Document label="Muayene Tarihi" date={vehicle.inspectionDate} state={inspection} /><Document label="Sigorta Tarihi" date={vehicle.insuranceDate} state={insurance} /></div></section></div>
    <section className="rounded-xl border border-border/70 bg-card p-6"><div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Atanmış Dağıtımlar</h2><p className="mt-1 text-sm text-muted-foreground">Bu araca bağlı aktif ve geçmiş siparişler.</p></div><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">{orders.length}</span></div>{orders.length === 0 ? <p className="mt-5 text-sm text-muted-foreground">Bu araca atanmış sipariş bulunmuyor.</p> : <div className="mt-4 divide-y divide-border/70">{orders.map((order) => <Link key={order.id} href={`/orders/${order.id}`} className="flex flex-col gap-2 py-4 transition-colors hover:text-primary sm:flex-row sm:items-center sm:justify-between"><div><p className="font-mono text-sm font-semibold">{order.orderCode}</p><p className="mt-1 text-xs text-muted-foreground">{order.customer.fullName}{order.customer.phone ? ` · ${order.customer.phone}` : ""}</p></div><div className="flex items-center gap-3 sm:text-right"><span className={`rounded-full px-2 py-1 text-[11px] font-medium ${orderStyles[order.status] ?? "bg-muted text-muted-foreground"}`}>{orderLabels[order.status] ?? order.status}</span><span className="text-xs text-muted-foreground">{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("tr-TR") : "Tarih yok"}</span></div></Link>)}</div>}</section>
  </div>;
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) { return <div className="rounded-xl border border-border/70 bg-card p-5"><p className="text-sm text-muted-foreground">{label}</p><p className={`mt-2 inline-flex rounded-full px-2 py-1 text-base font-bold ${tone ?? ""}`}>{value}</p></div>; }
function Info({ label, value }: { label: string; value?: string | null }) { return <div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold">{value || "-"}</p></div>; }
function Document({ label, date, state }: { label: string; date: Date | null; state: { label: string; style: string } }) { return <div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold">{date ? date.toLocaleDateString("tr-TR") : "Belirtilmedi"}</p><span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[11px] font-medium ${state.style}`}>{state.label}</span></div>; }
