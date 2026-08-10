"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createCustomerSchema, type CreateCustomerInput } from "../validators/customer.schema";
import type { Customer } from "@prisma/client";
import { Loader2, Save, X } from "lucide-react";

interface CustomerFormProps {
  initialData?: Customer;
  mode: "create" | "edit";
}

export default function CustomerForm({ initialData, mode }: CustomerFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: initialData
      ? {
          customerCode: initialData.customerCode,
          fullName: initialData.fullName,
          phone: initialData.phone,
          phone2: initialData.phone2 ?? "",
          email: initialData.email ?? "",
          address: initialData.address ?? "",
          city: initialData.city ?? "",
          district: initialData.district ?? "",
          location: initialData.location ?? "",
          balance: Number(initialData.balance),
          depositBottleCount: initialData.depositBottleCount,
          emptyBottleCount: initialData.emptyBottleCount,
          notes: initialData.notes ?? "",
        }
      : {
          customerCode: "",
          fullName: "",
          phone: "",
          phone2: "",
          email: "",
          address: "",
          city: "",
          district: "",
          location: "",
          balance: 0,
          depositBottleCount: 0,
          emptyBottleCount: 0,
          notes: "",
        },
  });

  async function onSubmit(data: CreateCustomerInput) {
    setIsSubmitting(true);
    try {
      const url = mode === "edit" && initialData ? `/api/customers/${initialData.id}` : "/api/customers";
      const method = mode === "edit" ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message ?? "İşlem başarısız");
      }

      toast.success(mode === "edit" ? "Müşteri güncellendi" : "Müşteri oluşturuldu");
      router.push(`/customers/${result.data.id}`);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Bilinmeyen hata";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section className="rounded-xl border border-border/70 bg-card p-6">
        <h2 className="mb-6 text-lg font-semibold">Temel Bilgiler</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <label htmlFor="customerCode" className="text-sm font-medium">
              Müşteri Kodu
            </label>
            <Input id="customerCode" placeholder={mode === "create" ? "Otomatik oluşturulur" : "MUS-0001"} readOnly={mode === "create"} {...register("customerCode")} />
            {errors.customerCode && (
              <p className="text-xs text-destructive">{errors.customerCode.message}</p>
            )}
          </div>
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
            <label htmlFor="fullName" className="text-sm font-medium">
              Ad Soyad <span className="text-destructive">*</span>
            </label>
            <Input id="fullName" placeholder="Ahmet Yılmaz" {...register("fullName")} />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-sm font-medium">
              Telefon <span className="text-destructive">*</span>
            </label>
            <Input id="phone" placeholder="0555 123 45 67" {...register("phone")} />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="phone2" className="text-sm font-medium">İkinci Telefon</label>
            <Input id="phone2" placeholder="0212 345 67 89" {...register("phone2")} />
            {errors.phone2 && (
              <p className="text-xs text-destructive">{errors.phone2.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">E-posta</label>
            <Input id="email" type="email" placeholder="ornek@email.com" {...register("email")} />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border/70 bg-card p-6">
        <h2 className="mb-6 text-lg font-semibold">Adres Bilgileri</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
            <label htmlFor="address" className="text-sm font-medium">Adres</label>
            <Input id="address" placeholder="Tam adres bilgisi" {...register("address")} />
            {errors.address && (
              <p className="text-xs text-destructive">{errors.address.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="city" className="text-sm font-medium">Şehir</label>
            <Input id="city" placeholder="İstanbul" {...register("city")} />
            {errors.city && (
              <p className="text-xs text-destructive">{errors.city.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="district" className="text-sm font-medium">İlçe</label>
            <Input id="district" placeholder="Kadıköy" {...register("district")} />
            {errors.district && (
              <p className="text-xs text-destructive">{errors.district.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="location" className="text-sm font-medium">Konum</label>
            <Input id="location" placeholder="Enlem, Boyam" {...register("location")} />
            {errors.location && (
              <p className="text-xs text-destructive">{errors.location.message}</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground sm:col-span-2 lg:col-span-3">Adres kaydedildiğinde konum OpenStreetMap üzerinden otomatik bulunur. Daha doğru rota için mahalle, sokak ve bina numarasını eksiksiz girin.</p>
        </div>
      </section>

      <section className="rounded-xl border border-border/70 bg-card p-6">
        <h2 className="mb-6 text-lg font-semibold">Finansal Bilgiler</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label htmlFor="balance" className="text-sm font-medium">Bakiye</label>
            <Input id="balance" type="number" step="0.01" {...register("balance")} />
            {errors.balance && (
              <p className="text-xs text-destructive">{errors.balance.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="depositBottleCount" className="text-sm font-medium">Depozito Şişe</label>
            <Input id="depositBottleCount" type="number" {...register("depositBottleCount")} />
            {errors.depositBottleCount && (
              <p className="text-xs text-destructive">{errors.depositBottleCount.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="emptyBottleCount" className="text-sm font-medium">Boş Şişe</label>
            <Input id="emptyBottleCount" type="number" {...register("emptyBottleCount")} />
            {errors.emptyBottleCount && (
              <p className="text-xs text-destructive">{errors.emptyBottleCount.message}</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border/70 bg-card p-6">
        <h2 className="mb-6 text-lg font-semibold">Notlar</h2>
        <div className="space-y-1.5">
          <Textarea
            id="notes"
            rows={3}
            placeholder="Müşteri hakkında notlar..."
            className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            {...register("notes")}
          />
          {errors.notes && (
            <p className="text-xs text-destructive">{errors.notes.message}</p>
          )}
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          <X className="size-4" />
          İptal
        </Button>
        <Button className="w-full sm:w-auto" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {mode === "edit" ? "Güncelle" : "Oluştur"}
        </Button>
      </div>
    </form>
  );
}
