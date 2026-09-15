"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, CircleCheck, Loader2, Play, Save, Truck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TRANSITIONS } from "@/shared/constants/order-status";
import OrderPaymentPanel from "@/features/orders/components/order-payment-panel";

type Option = { id: string; label: string; detail: string };
type Props = { orderId: string; initialVehicleId?: string | null; initialPersonnelId?: string | null; initialDate?: string | Date | null; initialNotes?: string | null; initialStatus: string; initialAmount?: number; compact?: boolean; onSaved?: () => void };

export default function DeliveryAssignment({ orderId, initialVehicleId, initialPersonnelId, initialDate, initialNotes, initialStatus, initialAmount = 0, compact = false, onSaved }: Props) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Option[]>([]);
  const [personnel, setPersonnel] = useState<Option[]>([]);
  const [vehicleId, setVehicleId] = useState(initialVehicleId ?? "");
  const [personnelId, setPersonnelId] = useState(initialPersonnelId ?? "");
  const [date, setDate] = useState(initialDate ? new Date(initialDate).toISOString().slice(0, 10) : "");
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [status, setStatus] = useState(initialStatus);
  const [paymentChoiceOpen, setPaymentChoiceOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/vehicles?pageSize=100&status=ACTIVE").then((response) => response.json()),
      fetch("/api/personnel?pageSize=100&status=ACTIVE").then((response) => response.json()),
    ]).then(([vehicleResult, personnelResult]) => {
      if (!vehicleResult.success || !personnelResult.success) throw new Error("Dağıtım seçenekleri yüklenemedi");
      setVehicles(vehicleResult.data.data.map((vehicle: { id: string; code: string; plate: string; type: string }) => ({ id: vehicle.id, label: vehicle.plate, detail: `${vehicle.code} · ${vehicle.type}` })));
      setPersonnel(personnelResult.data.data.map((person: { id: string; fullName: string; employeeCode: string; phone: string }) => ({ id: person.id, label: person.fullName, detail: `${person.employeeCode} · ${person.phone}` })));
    }).catch((error) => toast.error(error instanceof Error ? error.message : "Seçenekler yüklenemedi")).finally(() => setLoadingOptions(false));
  }, []);

  async function persist(nextStatus: string, successMessage: string, paymentMethod?: "CASH" | "IBAN" | "CARD") {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/delivery`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ vehicleId: vehicleId || null, personnelId: personnelId || null, deliveryDate: date, deliveryNotes: notes, status: nextStatus, paymentMethod }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message ?? "Dağıtım kaydedilemedi");
      setStatus(nextStatus);
      setPaymentChoiceOpen(false);
      if ((nextStatus === "CONFIRMED" || nextStatus === "DELIVERING") && (!vehicleId || !personnelId)) {
        setVehicleId(result.data.vehicle?.id ?? vehicleId);
        setPersonnelId(result.data.personnel?.id ?? personnelId);
        toast.success(`${successMessage}. Müsait araç ve personel otomatik atandı.`);
      } else toast.success(successMessage);
      onSaved?.();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Dağıtım kaydedilemedi");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (status === "DELIVERED") { setPaymentChoiceOpen(true); return; }
    await persist(status, "Dağıtım bilgileri kaydedildi");
  }

  async function quickStatus(nextStatus: string, message: string) {
    if (nextStatus === "DELIVERED" && !window.confirm("Siparişi teslim edildi olarak işaretlemek ve stok düşümü yapmak istiyor musunuz?")) return;
    if (nextStatus === "CANCELLED" && !window.confirm("Siparişi iptal etmek istediğinizden emin misiniz?")) return;
    if (nextStatus === "DELIVERED") { setPaymentChoiceOpen(true); return; }
    await persist(nextStatus, message);
  }

  const disabled = loadingOptions || loading;
  const availableStatuses = ORDER_STATUS_TRANSITIONS[status] ?? [status];
  return <div className={compact ? "space-y-3" : "space-y-5"}>
    {!compact && <div><h2 className="text-lg font-semibold">Dağıtım Ataması</h2><p className="mt-1 text-sm text-muted-foreground">Siparişi aktif araç ve personele atayın.</p></div>}
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="space-y-1.5 text-sm font-medium"><span className="flex items-center gap-2"><Truck className="size-4 text-muted-foreground" /> Araç</span><Select value={vehicleId} onChange={(event) => setVehicleId(event.target.value)} disabled={disabled}><option value="">Araç seçilmedi</option>{vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.label} · {vehicle.detail}</option>)}</Select></label>
      <label className="space-y-1.5 text-sm font-medium"><span className="flex items-center gap-2"><UserRound className="size-4 text-muted-foreground" /> Personel</span><Select value={personnelId} onChange={(event) => setPersonnelId(event.target.value)} disabled={disabled}><option value="">Personel seçilmedi</option>{personnel.map((person) => <option key={person.id} value={person.id}>{person.label} · {person.detail}</option>)}</Select></label>
      <label className="space-y-1.5 text-sm font-medium">Dağıtım tarihi<input className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-base md:text-sm" type="date" value={date} onChange={(event) => setDate(event.target.value)} disabled={loading} /></label>
       <label className="space-y-1.5 text-sm font-medium">Durum<Select value={status} onChange={(event) => setStatus(event.target.value)} disabled={loading}>{availableStatuses.map((value) => <option key={value} value={value}>{ORDER_STATUS_LABELS[value] ?? value}</option>)}</Select><span className="text-xs font-normal text-muted-foreground">Geçerli sonraki durumlar gösteriliyor.</span></label>
    </div>
      <label className="block space-y-1.5 text-sm font-medium">Dağıtım notu<Textarea value={notes} onChange={(event) => setNotes(event.target.value)} disabled={loading} rows={3} /></label>
      {status !== "DELIVERED" && status !== "CANCELLED" && <div className="rounded-xl border border-border/70 bg-muted/20 p-3"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hızlı durum güncelleme</p><div className="grid gap-2 sm:flex sm:flex-wrap">{(status === "PENDING" || status === "CONFIRMED") && <Button type="button" size="sm" variant="outline" onClick={() => quickStatus("DELIVERING", "Sipariş dağıtıma çıkarıldı")} disabled={disabled}><Play className="size-4" /> Dağıtıma Çıkar</Button>}{status === "DELIVERING" && <Button type="button" size="sm" onClick={() => quickStatus("DELIVERED", "Sipariş teslim edildi")} disabled={disabled}><CircleCheck className="size-4" /> Teslim Edildi</Button>}{(status === "PENDING" || status === "CONFIRMED" || status === "DELIVERING") && <Button type="button" size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => quickStatus("CANCELLED", "Sipariş iptal edildi")} disabled={disabled}><Ban className="size-4" /> İptal Et</Button>}</div></div>}
      {paymentChoiceOpen && <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-4"><p className="text-sm font-semibold">Ödeme yöntemini seçin</p><p className="mt-1 text-xs text-muted-foreground">Seçiminiz teslimat ve finans kaydına işlenecek.</p><div className="mt-3 grid grid-cols-3 gap-2"><Button type="button" disabled={disabled} onClick={() => persist("DELIVERED", "Sipariş teslim edildi", "CASH")}>Nakit</Button><Button type="button" disabled={disabled} onClick={() => persist("DELIVERED", "Sipariş teslim edildi", "IBAN")}>IBAN</Button><Button type="button" disabled={disabled} onClick={() => persist("DELIVERED", "Sipariş teslim edildi", "CARD")}>POS</Button></div><Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => setPaymentChoiceOpen(false)} disabled={loading}>Vazgeç</Button></div>}
     <Button className="w-full sm:w-auto" onClick={save} disabled={disabled}>{loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Kaydet</Button>
   {status === "DELIVERED" && <OrderPaymentPanel orderId={orderId} amount={initialAmount} />} </div>;
}
