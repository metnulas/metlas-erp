"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type Tenant = { id: string; name: string };
type Invoice = { id: string; invoiceNumber: string; tenantId: string; totalAmount: number };
type Payment = { id: string; amount: number; method: string; referenceNumber: string | null; status: string; refundAmount: number; createdAt: string; tenant: Tenant; invoice: { invoiceNumber: string } | null };

export default function PaymentManager({ tenants, invoices, payments }: { tenants: Tenant[]; invoices: Invoice[]; payments: Payment[] }) {
  const router = useRouter();
  const [tenantId, setTenantId] = useState(tenants[0]?.id ?? "");
  const [invoiceId, setInvoiceId] = useState(invoices[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("BANK_TRANSFER");
  const [status, setStatus] = useState("SUCCEEDED");
  const [saving, setSaving] = useState(false);
  const tenantInvoices = invoices.filter((invoice) => invoice.tenantId === tenantId);
  async function create() {
    setSaving(true);
    try {
      const response = await fetch("/api/platform/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tenantId, invoiceId, amount: Number(amount), method, status }) });
      if (!response.ok) throw new Error((await response.json()).error?.message ?? "Ödeme kaydedilemedi");
      setAmount(""); toast.success("Ödeme kaydedildi"); router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Ödeme kaydedilemedi"); } finally { setSaving(false); }
  }
  async function refund(id: string) {
    if (!window.confirm("Ödeme iade edilsin mi?")) return;
    const response = await fetch(`/api/platform/payments/${id}/refund`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    if (!response.ok) { toast.error((await response.json()).error?.message ?? "İade başarısız"); return; }
    toast.success("Ödeme iade edildi"); router.refresh();
  }
  return <div className="space-y-6"><div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"><h2 className="font-semibold">Ödeme kaydı</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Select aria-label="Tenant" value={tenantId} onChange={(event) => { setTenantId(event.target.value); setInvoiceId(""); }}>{tenants.map((tenant) => <option key={tenant.id} value={tenant.id}>{tenant.name}</option>)}</Select><Select aria-label="Fatura" value={invoiceId} onChange={(event) => setInvoiceId(event.target.value)}><option value="">Faturasız ödeme</option>{tenantInvoices.map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.invoiceNumber} · {invoice.totalAmount} TL</option>)}</Select><Input aria-label="Tutar" type="number" placeholder="Tutar" value={amount} onChange={(event) => setAmount(event.target.value)} /><Select aria-label="Yöntem" value={method} onChange={(event) => setMethod(event.target.value)}><option value="CARD">Kart</option><option value="BANK_TRANSFER">Banka transferi</option><option value="CASH">Nakit</option><option value="OTHER">Diğer</option></Select><Select aria-label="Durum" value={status} onChange={(event) => setStatus(event.target.value)}><option value="SUCCEEDED">Başarılı</option><option value="PENDING">Bekleyen</option><option value="FAILED">Başarısız</option></Select></div><Button className="mt-4" onClick={create} disabled={saving || !tenantId || !amount}>{saving ? "Kaydediliyor..." : "Ödeme kaydet"}</Button></div><div className="overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-sm"><table className="w-full min-w-[900px] text-sm"><thead><tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground"><th className="p-4">Tenant / Fatura</th><th className="p-4">Tutar</th><th className="p-4">Yöntem</th><th className="p-4">Referans / Tarih</th><th className="p-4">Durum</th><th className="p-4" /></tr></thead><tbody>{payments.map((payment) => <tr key={payment.id} className="border-b last:border-0"><td className="p-4">{payment.tenant.name}<p className="text-xs text-muted-foreground">{payment.invoice?.invoiceNumber ?? "Faturasız"}</p></td><td className="p-4 font-semibold">{payment.amount.toLocaleString("tr-TR")} TL<p className="text-xs text-muted-foreground">İade: {payment.refundAmount.toLocaleString("tr-TR")} TL</p></td><td className="p-4">{payment.method}</td><td className="p-4 text-xs">{payment.referenceNumber ?? "-"}<br />{new Date(payment.createdAt).toLocaleString("tr-TR")}</td><td className="p-4"><span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">{payment.status}</span></td><td className="p-4">{payment.status === "SUCCEEDED" && <Button size="xs" variant="outline" onClick={() => refund(payment.id)}>İade</Button>}</td></tr>)}</tbody></table></div></div>;
}
