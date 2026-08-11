"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

type Tenant = { id: string; name: string };
type Invoice = { id: string; invoiceNumber: string; pdfNumber: string | null; issueDate: string; dueDate: string; status: string; totalAmount: number; tenant: Tenant; lines: { id: string; description: string }[] };

export default function InvoiceManager({ tenants, invoices }: { tenants: Tenant[]; invoices: Invoice[] }) {
  const router = useRouter();
  const [tenantId, setTenantId] = useState(tenants[0]?.id ?? "");
  const [periodStart, setPeriodStart] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(() => new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  async function generate() {
    setSaving(true);
    try {
      const response = await fetch("/api/platform/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tenantId, periodStart, dueDate }) });
      if (!response.ok) throw new Error((await response.json()).error?.message ?? "Fatura oluşturulamadı");
      toast.success("Fatura oluşturuldu"); router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Fatura oluşturulamadı"); } finally { setSaving(false); }
  }
  return <div className="space-y-6"><div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"><h2 className="font-semibold">Otomatik fatura oluştur</h2><p className="mt-1 text-sm text-muted-foreground">Aktif tenant aboneliğinden dönem faturası üretir. Aynı dönem ikinci kez oluşturulmaz.</p><div className="mt-4 grid gap-3 sm:grid-cols-3"><Select aria-label="Tenant" value={tenantId} onChange={(event) => setTenantId(event.target.value)}>{tenants.map((tenant) => <option key={tenant.id} value={tenant.id}>{tenant.name}</option>)}</Select><input className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm" aria-label="Dönem başlangıcı" type="date" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} /><input className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm" aria-label="Vade" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></div><Button className="mt-4" onClick={generate} disabled={saving || !tenantId}>{saving ? "Oluşturuluyor..." : "Fatura oluştur"}</Button></div><div className="overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-sm"><table className="w-full min-w-[820px] text-sm"><thead><tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground"><th className="p-4">Fatura</th><th className="p-4">Tenant</th><th className="p-4">Kesim / Vade</th><th className="p-4">Tutar</th><th className="p-4">Durum</th></tr></thead><tbody>{invoices.map((invoice) => <tr key={invoice.id} className="border-b last:border-0"><td className="p-4 font-medium">{invoice.invoiceNumber}<p className="text-xs text-muted-foreground">PDF: {invoice.pdfNumber ?? "Hazırlanacak"}</p></td><td className="p-4">{invoice.tenant.name}</td><td className="p-4 text-xs">{new Date(invoice.issueDate).toLocaleDateString("tr-TR")} / {new Date(invoice.dueDate).toLocaleDateString("tr-TR")}</td><td className="p-4 font-semibold">{invoice.totalAmount.toLocaleString("tr-TR")} TL</td><td className="p-4"><span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">{invoice.status}</span></td></tr>)}</tbody></table></div></div>;
}
