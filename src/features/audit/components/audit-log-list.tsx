"use client";

import { useEffect, useState } from "react";
import { ClipboardCheck, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import Pagination from "@/shared/components/pagination";

type AuditRow = { id: string; actorId: string | null; action: string; entityType: string; entityId: string; metadata: unknown; createdAt: string };
const actionLabels: Record<string, string> = { CREATE: "Oluşturma", UPDATE: "Güncelleme", DELETE: "Silme", STOCK_ADJUSTMENT: "Stok ayarı", ASSIGN: "Dağıtım atama", DELIVER: "Teslimat" };

export default function AuditLogList() {
  const [items, setItems] = useState<AuditRow[]>([]);
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      try {
        const query = new URLSearchParams({ page: String(page), pageSize: "25" });
        if (action) query.set("action", action);
        if (entityType) query.set("entityType", entityType);
        const response = await fetch(`/api/audit-logs?${query}`, { signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error?.message ?? "Denetim kayıtları yüklenemedi");
        setItems(result.data.data);
        setTotalPages(result.data.totalPages ?? 1);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        toast.error(error instanceof Error ? error.message : "Denetim kayıtları yüklenemedi");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [action, entityType, page]);

  function changeFilter(setter: (value: string) => void, value: string) { setter(value); setPage(1); }

  return <div className="space-y-5">
    <div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={entityType} onChange={(event) => changeFilter(setEntityType, event.target.value)} placeholder="Modül ara: Order, Product..." className="pl-9" /></div><select aria-label="İşlem filtresi" value={action} onChange={(event) => changeFilter(setAction, event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Tüm işlemler</option>{Object.entries(actionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
    {loading ? <div className="rounded-2xl border border-border/70 bg-card p-8 text-center text-sm text-muted-foreground">Denetim kayıtları yükleniyor...</div> : items.length === 0 ? <div className="rounded-2xl border border-dashed border-border/70 bg-card p-10 text-center"><ClipboardCheck className="mx-auto size-8 text-muted-foreground" /><p className="mt-3 font-medium">Kayıt bulunamadı</p><p className="mt-1 text-sm text-muted-foreground">Seçilen filtrelerle eşleşen denetim kaydı yok.</p></div> : <div className="overflow-hidden rounded-2xl border border-border/70 bg-card"><div className="divide-y divide-border/70">{items.map((item) => <article key={item.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">{actionLabels[item.action] ?? item.action}</span><span className="text-sm font-semibold">{item.entityType}</span><span className="font-mono text-xs text-muted-foreground">{item.entityId}</span></div><p className="mt-1 text-xs text-muted-foreground">Kullanıcı: {item.actorId ?? "Sistem"}</p></div><time className="shrink-0 text-xs text-muted-foreground" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString("tr-TR")}</time></article>)}</div></div>}
    <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>;
}
