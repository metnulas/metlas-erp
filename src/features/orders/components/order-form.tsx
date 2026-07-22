"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createOrderSchema, type CreateOrderInput } from "../validators/order.schema";
import { Loader2, Save, X, Plus, Trash2 } from "lucide-react";
import type { Order, OrderItem } from "@prisma/client";

interface OrderFormProps {
  initialData?: Order & { items: OrderItem[] };
  mode: "create" | "edit";
}

interface CustomerOption {
  id: string;
  fullName: string;
  phone: string;
}

export default function OrderForm({ initialData, mode }: OrderFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: initialData
      ? {
          customerId: initialData.customerId,
          orderDate: initialData.orderDate ? new Date(initialData.orderDate).toISOString().slice(0, 10) : "",
          deliveryDate: initialData.deliveryDate ? new Date(initialData.deliveryDate).toISOString().slice(0, 10) : "",
          status: initialData.status,
          discount: Number(initialData.discount),
          notes: initialData.notes ?? "",
          items: initialData.items.map((item) => ({
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            notes: item.notes ?? "",
          })),
        }
      : {
          customerId: "",
          orderDate: new Date().toISOString().slice(0, 10),
          deliveryDate: "",
          status: "PENDING",
          discount: 0,
          notes: "",
          items: [{ productName: "", quantity: 1, unitPrice: 0, notes: "" }],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");
  const watchedDiscount = watch("discount");

  const totalAmount = (watchedItems ?? []).reduce(
    (sum, item) => sum + Number(item.quantity ?? 0) * Number(item.unitPrice ?? 0),
    0
  );
  const grandTotal = Math.max(0, totalAmount - Number(watchedDiscount ?? 0));

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const response = await fetch("/api/customers?pageSize=100&isActive=true");
        const result = await response.json();
        if (result.success) {
          setCustomers(result.data.data);
        }
      } catch {
        // silent
      }
    }
    fetchCustomers();
  }, []);

  async function onSubmit(data: CreateOrderInput) {
    setIsSubmitting(true);
    try {
      const url = mode === "edit" && initialData ? `/api/orders/${initialData.id}` : "/api/orders";
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

      toast.success(mode === "edit" ? "Sipariş güncellendi" : "Sipariş oluşturuldu");
      router.push(`/orders/${result.data.id}`);
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
        <h2 className="mb-6 text-lg font-semibold">Sipariş Bilgileri</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <label htmlFor="customerId" className="text-sm font-medium">
              Müşteri <span className="text-destructive">*</span>
            </label>
            <select
              id="customerId"
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-base transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              {...register("customerId")}
            >
              <option value="">Müşteri seçin</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} - {c.phone}
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="text-xs text-destructive">{errors.customerId.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="orderDate" className="text-sm font-medium">
              Sipariş Tarihi <span className="text-destructive">*</span>
            </label>
            <Input id="orderDate" type="date" {...register("orderDate")} />
            {errors.orderDate && (
              <p className="text-xs text-destructive">{errors.orderDate.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="deliveryDate" className="text-sm font-medium">Teslim Tarihi</label>
            <Input id="deliveryDate" type="date" {...register("deliveryDate")} />
            {errors.deliveryDate && (
              <p className="text-xs text-destructive">{errors.deliveryDate.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="status" className="text-sm font-medium">Durum</label>
            <select
              id="status"
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-base transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              {...register("status")}
            >
              <option value="PENDING">Beklemede</option>
              <option value="CONFIRMED">Onaylandı</option>
              <option value="DELIVERING">Teslimatta</option>
              <option value="DELIVERED">Teslim Edildi</option>
              <option value="CANCELLED">İptal</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="discount" className="text-sm font-medium">İndirim (₺)</label>
            <Input id="discount" type="number" step="0.01" {...register("discount")} />
            {errors.discount && (
              <p className="text-xs text-destructive">{errors.discount.message}</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border/70 bg-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Sipariş Ürünleri</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ productName: "", quantity: 1, unitPrice: 0, notes: "" })}
          >
            <Plus className="size-4" />
            Ürün Ekle
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-lg bg-muted/30 p-4">
              <div className="grid gap-3 sm:grid-cols-12 sm:items-end">
                <div className="space-y-1.5 sm:col-span-5">
                  <label className="text-xs font-medium text-muted-foreground">Ürün Adı</label>
                  <Input placeholder="Ürün adı" {...register(`items.${index}.productName`)} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Miktar</label>
                  <Input type="number" {...register(`items.${index}.quantity`)} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Birim Fiyat (₺)</label>
                  <Input type="number" step="0.01" {...register(`items.${index}.unitPrice`)} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Toplam</label>
                  <Input
                    readOnly
                    value={`${(Number(watchedItems?.[index]?.quantity ?? 0) * Number(watchedItems?.[index]?.unitPrice ?? 0)).toLocaleString("tr-TR")} ₺`}
                    className="bg-muted/50"
                  />
                </div>
                <div className="flex justify-end sm:col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {errors.items && (
          <p className="mt-2 text-xs text-destructive">{errors.items.message}</p>
        )}

        <div className="mt-4 flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ara Toplam:</span>
              <span className="font-medium">{Number(totalAmount).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">İndirim:</span>
              <span className="font-medium text-red-500">-{Number(watchedDiscount ?? 0).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="font-semibold">Genel Toplam:</span>
              <span className="text-lg font-bold text-primary">{Number(grandTotal).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border/70 bg-card p-6">
        <h2 className="mb-6 text-lg font-semibold">Notlar</h2>
        <div className="space-y-1.5">
          <textarea
            id="notes"
            rows={3}
            placeholder="Sipariş hakkında notlar..."
            className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            {...register("notes")}
          />
          {errors.notes && (
            <p className="text-xs text-destructive">{errors.notes.message}</p>
          )}
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          <X className="size-4" />
          İptal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
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
