"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Truck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Option = { id: string; label: string; detail: string };
type Props = { orderId: string; initialVehicleId?: string | null; initialPersonnelId?: string | null; initialDate?: string | Date | null; initialNotes?: string | null; initialStatus: string; compact?: boolean; onSaved?: () => void };

export default function DeliveryAssignment({ orderId, initialVehicleId, initialPersonnelId, initialDate, initialNotes, initialStatus, compact = false, onSaved }: Props) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Option[]>([]);
  const [personnel, setPersonnel] = useState<Option[]>([]);
  const [vehicleId, setVehicleId] = useState(initialVehicleId ?? "");
  const [personnelId, setPersonnelId] = useState(initialPersonnelId ?? "");
  const [date, setDate] = useState(initialDate ? new Date(initialDate).toISOString().slice(0, 10) : "");
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [status, setStatus] = useState(initialStatus);
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

  async function save() {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/delivery`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ vehicleId: vehicleId || null, personnelId: personnelId || null, deliveryDate: date, deliveryNotes: notes, status }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message ?? "Dağıtım kaydedilemedi");
      toast.success("Dağıtım bilgileri kaydedildi");
      onSaved?.();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Dağıtım kaydedilemedi");
    } finally {
      setLoading(false);
    }
  }

  const disabled = loadingOptions || loading;
  return <div className={compact ? "space-y-3" : "space-y-5"}>
    {!compact && <div><h2 className="text-lg font-semibold">Dağıtım Ataması</h2><p className="mt-1 text-sm text-muted-foreground">Siparişi aktif araç ve personele atayın.</p></div>}
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="space-y-1.5 text-sm font-medium"><span className="flex items-center gap-2"><Truck className="size-4 text-muted-foreground" /> Araç</span><Select value={vehicleId} onChange={(event) => setVehicleId(event.target.value)} disabled={disabled}><option value="">Araç seçilmedi</option>{vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.label} · {vehicle.detail}</option>)}</Select></label>
      <label className="space-y-1.5 text-sm font-medium"><span className="flex items-center gap-2"><UserRound className="size-4 text-muted-foreground" /> Personel</span><Select value={personnelId} onChange={(event) => setPersonnelId(event.target.value)} disabled={disabled}><option value="">Personel seçilmedi</option>{personnel.map((person) => <option key={person.id} value={person.id}>{person.label} · {person.detail}</option>)}</Select></label>
      <label className="space-y-1.5 text-sm font-medium">Dağıtım tarihi<input className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-base md:text-sm" type="date" value={date} onChange={(event) => setDate(event.target.value)} disabled={loading} /></label>
      <label className="space-y-1.5 text-sm font-medium">Durum<Select value={status} onChange={(event) => setStatus(event.target.value)} disabled={loading}><option value="PENDING">Beklemede</option><option value="CONFIRMED">Onaylandı</option><option value="DELIVERING">Teslimatta</option><option value="DELIVERED">Teslim Edildi</option><option value="CANCELLED">İptal</option></Select></label>
    </div>
    <label className="block space-y-1.5 text-sm font-medium">Dağıtım notu<Textarea value={notes} onChange={(event) => setNotes(event.target.value)} disabled={loading} rows={3} /></label>
    <Button className="w-full sm:w-auto" onClick={save} disabled={disabled}>{loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Kaydet</Button>
  </div>;
}
