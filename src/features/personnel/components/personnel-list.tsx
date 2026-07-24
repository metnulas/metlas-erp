"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Search, Trash2, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EmptyState from "@/shared/components/empty-state";
import Pagination from "@/shared/components/pagination";
import { useDebounce } from "@/shared/hooks/use-debounce";

type PersonnelRow = { id: string; employeeCode: string; fullName: string; phone: string; email: string | null; position: string; licenseClass: string | null; status: string };
const labels: Record<string, string> = { ACTIVE: "Aktif", ON_LEAVE: "İzinli", INACTIVE: "Pasif" };
const styles: Record<string, string> = { ACTIVE: "bg-emerald-50 text-emerald-700", ON_LEAVE: "bg-amber-50 text-amber-700", INACTIVE: "bg-muted text-muted-foreground" };

export default function PersonnelList() {
  const [items, setItems] = useState<PersonnelRow[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      try {
        const query = new URLSearchParams({ page: String(page), pageSize: "20" });
        if (debouncedSearch) query.set("search", debouncedSearch);
        const response = await fetch(`/api/personnel?${query}`, { signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error?.message ?? "Personeller yüklenemedi");
        setItems(result.data.data);
        setTotalPages(result.data.totalPages ?? 1);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        toast.error(error instanceof Error ? error.message : "Personeller yüklenemedi");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [page, debouncedSearch]);

  async function remove(id: string) {
    if (!confirm("Bu personeli silmek istediğinizden emin misiniz?")) return;
    const response = await fetch(`/api/personnel/${id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) return toast.error(result.error?.message ?? "Personel silinemedi");
    setItems((current) => current.filter((item) => item.id !== id));
    toast.success("Personel silindi");
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Personeller</h1><p className="mt-1 text-sm text-muted-foreground">Dağıtım ekibinizi ve sürücü bilgilerini yönetin.</p></div><Button render={<Link href="/personnel/new" />}><Plus className="size-4" /> Yeni Personel</Button></div>
    <div className="relative max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Ad, kod veya görev ara..." className="pl-9" /></div>
    {!loading && items.length === 0 ? <EmptyState icon={<UsersRound className="size-8" />} title="Personel bulunamadı" description="Henüz personel eklenmemiş veya aramanızla eşleşen kayıt yok." action={<Button render={<Link href="/personnel/new" />}><Plus className="size-4" /> Yeni Personel Ekle</Button>} /> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{loading ? <div className="rounded-2xl border border-border/70 bg-card p-5 text-center text-sm text-muted-foreground">Personeller yükleniyor...</div> : items.map((item) => <article key={item.id} className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-mono text-xs text-muted-foreground">{item.employeeCode}</p><Link href={`/personnel/${item.id}`} className="mt-1 block truncate text-base font-semibold hover:text-primary">{item.fullName}</Link><p className="mt-1 truncate text-sm text-muted-foreground">{item.position} · {item.phone}</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${styles[item.status] ?? styles.INACTIVE}`}>{labels[item.status] ?? item.status}</span></div><div className="mt-4 flex gap-2"><Button className="min-w-0 flex-1" size="sm" render={<Link href={`/personnel/${item.id}`} />}>Detay</Button><Button className="min-w-0 flex-1" size="sm" variant="outline" render={<Link href={`/personnel/${item.id}/edit`} />}>Düzenle</Button><Button size="icon-sm" variant="ghost" aria-label={`${item.fullName} personelini sil`} onClick={() => remove(item.id)}><Trash2 className="size-4 text-destructive" /></Button></div></article>)}</div>}
    <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>;
}
