"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Vehicle } from "@prisma/client";
import { createVehicleSchema, type CreateVehicleInput } from "../validators/vehicle.schema";

export default function VehicleForm({ initialData, mode }: { initialData?: Vehicle; mode: "create" | "edit" }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<CreateVehicleInput>({
    resolver: zodResolver(createVehicleSchema),
    defaultValues: initialData ? {
      code: initialData.code, plate: initialData.plate, type: initialData.type, brand: initialData.brand ?? "", model: initialData.model ?? "",
      modelYear: initialData.modelYear ?? "", capacity: initialData.capacity, capacityUnit: initialData.capacityUnit, mileage: initialData.mileage,
      status: initialData.status, inspectionDate: initialData.inspectionDate ? new Date(initialData.inspectionDate).toISOString().slice(0, 10) : "",
      insuranceDate: initialData.insuranceDate ? new Date(initialData.insuranceDate).toISOString().slice(0, 10) : "", notes: initialData.notes ?? "",
    } : { code: "", plate: "", type: "Damacana Dağıtım Aracı", brand: "", model: "", modelYear: "", capacity: 0, capacityUnit: "ADET", mileage: 0, status: "ACTIVE", inspectionDate: "", insuranceDate: "", notes: "" },
  });

  async function onSubmit(data: CreateVehicleInput) {
    setIsSubmitting(true);
    try {
      const response = await fetch(mode === "edit" && initialData ? `/api/vehicles/${initialData.id}` : "/api/vehicles", { method: mode === "edit" ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message ?? "İşlem başarısız");
      toast.success(mode === "edit" ? "Araç güncellendi" : "Araç oluşturuldu"); router.push(`/vehicles/${result.data.id}`); router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Bilinmeyen hata"); } finally { setIsSubmitting(false); }
  }

  const errorText = (field: keyof typeof errors) => errors[field]?.message?.toString();
  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
    <section className="rounded-xl border border-border/70 bg-card p-6"><h2 className="mb-6 text-lg font-semibold">Araç Bilgileri</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="Araç Kodu" error={errorText("code")}><Input placeholder="ARAC-0001" {...register("code")} /></Field>
      <Field label="Plaka" error={errorText("plate")}><Input placeholder="34 ABC 123" className="uppercase" {...register("plate")} /></Field>
      <Field label="Araç Tipi" error={errorText("type")}><Input placeholder="Damacana Dağıtım Aracı" {...register("type")} /></Field>
      <Field label="Marka" error={errorText("brand")}><Input placeholder="Ford" {...register("brand")} /></Field>
      <Field label="Model" error={errorText("model")}><Input placeholder="Transit" {...register("model")} /></Field>
      <Field label="Model Yılı" error={errorText("modelYear")}><Input type="number" min="1900" max="2200" {...register("modelYear")} /></Field>
    </div></section>
    <section className="rounded-xl border border-border/70 bg-card p-6"><h2 className="mb-6 text-lg font-semibold">Kapasite ve Durum</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Kapasite" error={errorText("capacity")}><Input type="number" min="0" {...register("capacity")} /></Field>
      <Field label="Kapasite Birimi" error={errorText("capacityUnit")}><Input placeholder="ADET" {...register("capacityUnit")} /></Field>
      <Field label="Kilometre" error={errorText("mileage")}><Input type="number" min="0" {...register("mileage")} /></Field>
      <Field label="Durum" error={errorText("status")}><select className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm" {...register("status")}><option value="ACTIVE">Aktif</option><option value="MAINTENANCE">Bakımda</option><option value="INACTIVE">Pasif</option></select></Field>
    </div></section>
    <section className="rounded-xl border border-border/70 bg-card p-6"><h2 className="mb-6 text-lg font-semibold">Belge Takibi</h2><div className="grid gap-4 sm:grid-cols-2"><Field label="Muayene Tarihi" error={errorText("inspectionDate")}><Input type="date" {...register("inspectionDate")} /></Field><Field label="Sigorta Tarihi" error={errorText("insuranceDate")}><Input type="date" {...register("insuranceDate")} /></Field></div><label htmlFor="vehicle-notes" className="mt-4 block text-sm font-medium">Notlar</label><textarea id="vehicle-notes" rows={4} className="mt-1 flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" {...register("notes")} /></section>
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button className="w-full sm:w-auto" type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}><X className="size-4" /> İptal</Button><Button className="w-full sm:w-auto" type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{mode === "edit" ? "Güncelle" : "Oluştur"}</Button></div>
  </form>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <div className="space-y-1.5"><label className="text-sm font-medium">{label}</label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>; }
