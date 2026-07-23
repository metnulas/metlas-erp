"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CalendarDays, ClipboardList, MapPin, Truck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import EmptyState from "@/shared/components/empty-state";
import DeliveryAssignment from "./delivery-assignment";

type Delivery = {
  id: string;
  orderCode: string;
  deliveryDate: string | null;
  status: string;
  customer: { id: string; fullName: string; phone: string; address: string | null; district: string | null };
  vehicle: { id: string; plate: string } | null;
  personnel: { id: string; fullName: string } | null;
};

const statusLabels: Record<string, string> = { PENDING: "Beklemede", CONFIRMED: "Onaylandı", DELIVERING: "Teslimatta" };
const statusStyles: Record<string, string> = { PENDING: "bg-amber-50 text-amber-700", CONFIRMED: "bg-blue-50 text-blue-700", DELIVERING: "bg-purple-50 text-purple-700" };

function today() { return new Date().toISOString().slice(0, 10); }

export default function DeliveryList() {
  const [date, setDate] = useState(today);
  const [items, setItems] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/deliveries?date=${date}&includeUnscheduled=true`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message ?? "Dağıtımlar yüklenemedi");
      setItems(result.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Dağıtımlar yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Günlük Dağıtım</h1><p className="mt-1 text-sm text-muted-foreground">Siparişleri araç ve personele atayın, teslimat akışını yönetin.</p></div>
        <label className="flex w-full items-center gap-2 text-sm font-medium sm:w-auto"><CalendarDays className="size-4 text-muted-foreground" /><Input className="w-full sm:w-40" type="date" value={date} onChange={(event) => { setLoading(true); setDate(event.target.value); }} /></label>
      </div>
      {!loading && items.length === 0 ? (
        <EmptyState icon={<ClipboardList className="size-8" />} title="Bu tarihte dağıtım yok" description="Seçili tarihte bekleyen veya dağıtımda olan sipariş bulunmuyor." action={<Button render={<Link href="/orders" />}>Siparişlere Git</Button>} />
      ) : (
        <div className="space-y-3">
          {loading ? <div className="rounded-2xl border border-border/70 bg-card p-6 text-center text-sm text-muted-foreground">Dağıtımlar yükleniyor...</div> : items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><Link href={`/orders/${item.id}`} className="font-mono text-sm font-semibold hover:text-primary">{item.orderCode}</Link><span className={`rounded-full px-2 py-1 text-[11px] font-medium ${statusStyles[item.status] ?? "bg-muted text-muted-foreground"}`}>{statusLabels[item.status] ?? item.status}</span>{!item.deliveryDate && <span className="rounded-full bg-orange-50 px-2 py-1 text-[11px] font-medium text-orange-700">Planlanmamış</span>}</div>
                  <p className="mt-2 text-base font-semibold">{item.customer.fullName}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-3.5" />{item.customer.district || item.customer.address || "Adres girilmemiş"}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Truck className="size-3.5" />{item.vehicle?.plate || "Araç atanmamış"}</span><span className="flex items-center gap-1"><UserRound className="size-3.5" />{item.personnel?.fullName || "Personel atanmamış"}</span></div>
                </div>
                <div className="w-full lg:max-w-2xl"><DeliveryAssignment orderId={item.id} initialVehicleId={item.vehicle?.id} initialPersonnelId={item.personnel?.id} initialDate={item.deliveryDate} initialStatus={item.status} compact onSaved={load} /></div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
