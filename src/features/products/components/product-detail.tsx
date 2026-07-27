"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, PackagePlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Product, StockMovement } from "@prisma/client";

type ProductDetailData = Omit<Product, "salePrice" | "purchasePrice" | "depositAmount"> & { salePrice: number; purchasePrice: number; depositAmount: number; stockMovements: StockMovement[] };
const movementLabels: Record<string, string> = { INITIAL: "İlk stok", PURCHASE: "Alış", RETURN: "İade", ADJUSTMENT: "Düzeltme", SALE: "Satış", ORDER: "Sipariş" };

export default function ProductDetail({ product }: { product: ProductDetailData }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [type, setType] = useState("PURCHASE");
  const [notes, setNotes] = useState("");
  const [direction, setDirection] = useState("IN");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function adjustStock(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const signedQuantity = type === "ADJUSTMENT" && direction === "OUT" ? -Math.abs(quantity) : Math.abs(quantity);
      const response = await fetch(`/api/products/${product.id}/stock`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, quantity: signedQuantity, notes }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message ?? "Stok güncellenemedi");
      toast.success("Stok güncellendi");
      router.refresh();
      setNotes("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Stok güncellenemedi");
    } finally {
      setIsSubmitting(false);
    }
  }

  return <div className="space-y-6"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div className="flex min-w-0 items-center gap-3"><Button variant="ghost" size="icon" render={<Link href="/products" />}><ArrowLeft className="size-4" /></Button><div className="min-w-0"><h1 className="truncate text-2xl font-bold tracking-tight">{product.name}</h1><p className="font-mono text-xs text-muted-foreground">{product.code}</p></div></div><Button className="w-full md:w-auto" variant="outline" render={<Link href={`/products/${product.id}/edit`} />}><Edit className="size-4" /> Düzenle</Button></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat label="Satış Fiyatı" value={product.salePrice.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })} /><Stat label="Mevcut Stok" value={`${product.stockQuantity} ${product.unit}`} /><Stat label="Minimum Stok" value={`${product.minStockLevel} ${product.unit}`} /><Stat label="Depozito" value={product.hasDeposit ? product.depositAmount.toLocaleString("tr-TR", { style: "currency", currency: "TRY" }) : "Yok"} /></div><div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]"><section className="rounded-xl border border-border/70 bg-card p-6"><h2 className="mb-4 text-lg font-semibold">Stok Hareketleri</h2><div className="hidden overflow-x-auto md:block"><table className="w-full text-sm"><thead className="border-b text-left text-muted-foreground"><tr><th className="px-2 py-3">Tarih</th><th className="px-2 py-3">Tür</th><th className="px-2 py-3 text-right">Miktar</th><th className="px-2 py-3 text-right">Bakiye</th></tr></thead><tbody className="divide-y">{product.stockMovements.map((movement) => <tr key={movement.id}><td className="px-2 py-3 text-muted-foreground">{new Date(movement.createdAt).toLocaleString("tr-TR")}</td><td className="px-2 py-3">{movementLabels[movement.type] ?? movement.type}</td><td className={`px-2 py-3 text-right font-medium ${movement.quantity < 0 ? "text-destructive" : "text-emerald-600"}`}>{movement.quantity > 0 ? "+" : ""}{movement.quantity}</td><td className="px-2 py-3 text-right">{movement.balanceAfter}</td></tr>)}</tbody></table></div><div className="space-y-3 md:hidden">{product.stockMovements.map((movement) => <div key={movement.id} className="rounded-xl bg-muted/35 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold">{movementLabels[movement.type] ?? movement.type}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(movement.createdAt).toLocaleString("tr-TR")}</p></div><p className={`text-base font-bold ${movement.quantity < 0 ? "text-destructive" : "text-emerald-600"}`}>{movement.quantity > 0 ? "+" : ""}{movement.quantity}</p></div><div className="mt-3 flex justify-between border-t border-border/60 pt-3 text-xs"><span className="text-muted-foreground">Bakiye sonrası</span><span className="font-semibold">{movement.balanceAfter}</span></div></div>)}</div>{product.stockMovements.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Henüz stok hareketi yok.</p>}</section><form onSubmit={adjustStock} className="h-fit rounded-xl border border-border/70 bg-card p-6"><div className="flex items-center gap-2"><PackagePlus className="size-5 text-primary" /><h2 className="text-lg font-semibold">Stok işlemi</h2></div><p className="mt-1 text-sm text-muted-foreground">Alış, iade veya manuel düzeltme kaydedin.</p><div className="mt-5 space-y-4"><label className="block space-y-1.5 text-sm font-medium">İşlem türü<Select value={type} onChange={(event) => setType(event.target.value)} disabled={isSubmitting}><option value="PURCHASE">Alış / giriş</option><option value="RETURN">İade</option><option value="ADJUSTMENT">Manuel düzeltme</option></Select></label>{type === "ADJUSTMENT" && <label className="block space-y-1.5 text-sm font-medium">Yön<Select value={direction} onChange={(event) => setDirection(event.target.value)} disabled={isSubmitting}><option value="IN">Stok artır</option><option value="OUT">Stok azalt</option></Select></label>}<label className="block space-y-1.5 text-sm font-medium">Miktar<Input type="number" min="1" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))} disabled={isSubmitting} /></label><label className="block space-y-1.5 text-sm font-medium">Not<Textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} disabled={isSubmitting} /></label><Button className="w-full" type="submit" disabled={isSubmitting}>{isSubmitting ? "Kaydediliyor..." : "Stok işlemini kaydet"}</Button></div></form></div></div>;
}

function Stat({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-border/70 bg-card p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-xl font-bold">{value}</p></div>; }
