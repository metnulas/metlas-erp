"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createProductSchema, type CreateProductInput } from "../validators/product.schema";
import type { Product } from "@prisma/client";

type ProductFormData = Omit<Product, "salePrice" | "purchasePrice" | "depositAmount"> & {
  salePrice: number;
  purchasePrice: number;
  depositAmount: number;
};

export default function ProductForm({ initialData, mode }: { initialData?: ProductFormData; mode: "create" | "edit" }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: initialData ? {
      code: initialData.code,
      name: initialData.name,
      category: initialData.category ?? "",
      unit: initialData.unit,
      description: initialData.description ?? "",
      salePrice: Number(initialData.salePrice),
      purchasePrice: Number(initialData.purchasePrice),
      stockQuantity: initialData.stockQuantity,
      minStockLevel: initialData.minStockLevel,
      hasDeposit: initialData.hasDeposit,
      depositAmount: Number(initialData.depositAmount),
    } : {
      code: "", name: "", category: "", unit: "ADET", description: "", salePrice: 0,
      purchasePrice: 0, stockQuantity: 0, minStockLevel: 0, hasDeposit: false, depositAmount: 0,
    },
  });

  async function onSubmit(data: CreateProductInput) {
    setIsSubmitting(true);
    try {
      const response = await fetch(mode === "edit" && initialData ? `/api/products/${initialData.id}` : "/api/products", {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message ?? "İşlem başarısız");
      toast.success(mode === "edit" ? "Ürün güncellendi" : "Ürün oluşturuldu");
      router.push(`/products/${result.data.id}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bilinmeyen hata");
    } finally {
      setIsSubmitting(false);
    }
  }

  const fieldError = (field: keyof typeof errors) => errors[field]?.message?.toString();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section className="rounded-xl border border-border/70 bg-card p-6">
        <h2 className="mb-6 text-lg font-semibold">Ürün Bilgileri</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Ürün Kodu" error={fieldError("code")}><Input placeholder="URN-0001" {...register("code")} /></Field>
          <Field label="Ürün Adı" error={fieldError("name")}><Input placeholder="19L Damacana Su" {...register("name")} /></Field>
          <Field label="Kategori" error={fieldError("category")}><Input placeholder="Damacana" {...register("category")} /></Field>
          <Field label="Birim" error={fieldError("unit")}><Input placeholder="ADET" {...register("unit")} /></Field>
          <Field label="Satış Fiyatı (₺)" error={fieldError("salePrice")}><Input type="number" min="0" step="0.01" {...register("salePrice")} /></Field>
          <Field label="Alış Fiyatı (₺)" error={fieldError("purchasePrice")}><Input type="number" min="0" step="0.01" {...register("purchasePrice")} /></Field>
        </div>
      </section>
      <section className="rounded-xl border border-border/70 bg-card p-6">
        <h2 className="mb-6 text-lg font-semibold">Stok ve Depozito</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Mevcut Stok" error={mode === "edit" ? undefined : fieldError("stockQuantity")}><Input type="number" min="0" {...register("stockQuantity")} disabled={mode === "edit"} /></Field>
          <Field label="Minimum Stok" error={fieldError("minStockLevel")}><Input type="number" min="0" {...register("minStockLevel")} /></Field>
          <label className="flex items-center gap-3 pt-7 text-sm font-medium"><input type="checkbox" className="size-4 rounded border-input" {...register("hasDeposit")} /> Depozitolu ürün</label>
          <Field label="Depozito Tutarı (₺)" error={fieldError("depositAmount")}><Input type="number" min="0" step="0.01" {...register("depositAmount")} /></Field>
        </div>
        {mode === "edit" && <p className="mt-3 text-xs text-muted-foreground">Mevcut stok değişiklikleri ürün detayındaki stok hareketlerinden yapılmalıdır.</p>}
      </section>
      <section className="rounded-xl border border-border/70 bg-card p-6">
        <label htmlFor="description" className="mb-2 block text-sm font-medium">Açıklama</label>
        <Textarea id="description" rows={4} {...register("description")} />
        {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
      </section>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}><X className="size-4" /> İptal</Button>
        <Button className="w-full sm:w-auto" type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{mode === "edit" ? "Güncelle" : "Oluştur"}</Button>
      </div>
    </form>
  );
}

