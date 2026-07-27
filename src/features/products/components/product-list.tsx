"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Filter, Package, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EmptyState from "@/shared/components/empty-state";
import Pagination from "@/shared/components/pagination";
import { useDebounce } from "@/shared/hooks/use-debounce";

type ProductRow = { id: string; code: string; name: string; category: string | null; unit: string; salePrice: string | number; stockQuantity: number; minStockLevel: number; isActive: boolean };

export default function ProductList() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [search, setSearch] = useState("");
   const [isLoading, setIsLoading] = useState(true);
   const [page, setPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [lowStockOnly, setLowStockOnly] = useState(false);
   const debouncedSearch = useDebounce(search);

  useEffect(() => {
    const controller = new AbortController();
    async function loadProducts() {
      try {
         setIsLoading(true);
          const response = await fetch(`/api/products?page=${page}&pageSize=20${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ""}${lowStockOnly ? "&lowStock=true" : ""}`, { signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error?.message ?? "Ürünler yüklenemedi");
         setProducts(result.data.data);
         setTotalPages(result.data.totalPages ?? 1);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        toast.error(error instanceof Error ? error.message : "Ürünler yüklenemedi");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }
    loadProducts();
    return () => controller.abort();
    }, [page, debouncedSearch, lowStockOnly]);

  async function deleteProduct(id: string) {
    if (!confirm("Bu ürünü silmek istediğinizden emin misiniz?")) return;
    const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) return toast.error(result.error?.message ?? "Ürün silinemedi");
    toast.success("Ürün silindi");
     setProducts((current) => current.filter((product) => product.id !== id));
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Ürünler</h1><p className="mt-1 text-sm text-muted-foreground">Ürün kataloğunu, fiyatları ve stok seviyelerini yönetin.</p></div>
      <Button render={<Link href="/products/new" />}><Plus className="size-4" /> Yeni Ürün</Button>
    </div>
      <div className="flex flex-col gap-3 sm:flex-row"><div className="relative max-w-md flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Kod, ürün adı veya kategori ara..." className="pl-9" /></div><Button variant={lowStockOnly ? "default" : "outline"} onClick={() => { setLowStockOnly((current) => !current); setPage(1); }}><Filter className="size-4" /> {lowStockOnly ? "Tüm ürünler" : "Kritik stok"}</Button></div>
    {!isLoading && products.length === 0 ? <EmptyState icon={<Package className="size-8" />} title="Ürün bulunamadı" description="Henüz ürün eklenmemiş veya aramanızla eşleşen ürün yok." action={<Button render={<Link href="/products/new" />}><Plus className="size-4" /> Yeni Ürün Ekle</Button>} /> :
       <>
         <div className="hidden overflow-hidden rounded-xl border border-border/70 bg-card md:block"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/30 text-left text-muted-foreground"><tr><th className="px-4 py-3 font-medium">Kod</th><th className="px-4 py-3 font-medium">Ürün</th><th className="px-4 py-3 font-medium">Kategori</th><th className="px-4 py-3 text-right font-medium">Satış</th><th className="px-4 py-3 text-right font-medium">Stok</th><th className="px-4 py-3 text-right font-medium">İşlem</th></tr></thead><tbody className="divide-y">{products.map((product) => { const lowStock = product.stockQuantity <= product.minStockLevel; return <tr key={product.id} className="hover:bg-muted/20"><td className="px-4 py-3 font-mono text-xs">{product.code}</td><td className="px-4 py-3"><Link href={`/products/${product.id}`} className="font-medium hover:text-primary">{product.name}</Link><p className="text-xs text-muted-foreground">{product.unit}</p></td><td className="px-4 py-3 text-muted-foreground">{product.category || "-"}</td><td className="px-4 py-3 text-right">{Number(product.salePrice).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</td><td className={`px-4 py-3 text-right font-medium ${lowStock ? "text-destructive" : ""}`}>{product.stockQuantity}{lowStock && <span className="ml-1 text-xs">(düşük)</span>}</td><td className="px-4 py-3 text-right"><Button variant="ghost" size="icon" aria-label={`${product.name} ürününü sil`} onClick={() => deleteProduct(product.id)}><Trash2 className="size-4 text-destructive" /></Button></td></tr>; })}</tbody></table></div></div>
         <div className="space-y-3 md:hidden">{isLoading ? <div className="rounded-2xl border border-border/70 bg-card p-5 text-center text-sm text-muted-foreground">Ürünler yükleniyor...</div> : products.map((product) => { const lowStock = product.stockQuantity <= product.minStockLevel; return <article key={product.id} className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-mono text-xs text-muted-foreground">{product.code}</p><Link href={`/products/${product.id}`} className="mt-1 block truncate font-semibold hover:text-primary">{product.name}</Link><p className="mt-1 text-xs text-muted-foreground">{product.category || "Kategorisiz"} · {product.unit}</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${lowStock ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{lowStock ? "Düşük stok" : "Stokta"}</span></div><div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-xl bg-muted/40 p-3"><p className="text-[11px] text-muted-foreground">Satış fiyatı</p><p className="mt-1 truncate text-sm font-semibold">{Number(product.salePrice).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</p></div><div className="rounded-xl bg-muted/40 p-3"><p className="text-[11px] text-muted-foreground">Mevcut stok</p><p className={`mt-1 text-sm font-semibold ${lowStock ? "text-destructive" : ""}`}>{product.stockQuantity} {product.unit}</p></div></div><div className="mt-4 flex gap-2"><Button className="min-w-0 flex-1" size="sm" render={<Link href={`/products/${product.id}`} />}>Detay</Button><Button className="min-w-0 flex-1" size="sm" variant="outline" render={<Link href={`/products/${product.id}/edit`} />}>Düzenle</Button><Button size="icon-sm" variant="ghost" aria-label={`${product.name} ürününü sil`} onClick={() => deleteProduct(product.id)}><Trash2 className="size-4 text-destructive" /></Button></div></article>})}</div>
        </>}
     <Pagination page={page} totalPages={totalPages} onChange={setPage} />
   </div>;
}
