"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type Tenant = { id: string; name: string; slug: string };
type PackageItem = { id: string; name: string; code: string; monthlyPrice: number; annualPrice: number };
type Subscription = { id: string; tenantId: string; packageId: string; startsAt: string; status: string; isTrial: boolean; trialEndsAt: string | null; monthlyPrice: number; annualPrice: number; discountAmount: number; manualPrice: number | null; taxRate: number; totalAmount: number; tenant: Tenant; package: PackageItem };

export default function SubscriptionManager({ tenants, packages, subscriptions }: { tenants: Tenant[]; packages: PackageItem[]; subscriptions: Subscription[] }) {
  const router = useRouter();
  const [tenantId, setTenantId] = useState(tenants[0]?.id ?? "");
  const [packageId, setPackageId] = useState(packages[0]?.id ?? "");
  const [status, setStatus] = useState("ACTIVE");
  const [manualPrice, setManualPrice] = useState("");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [taxRate, setTaxRate] = useState("20");
  const [isTrial, setIsTrial] = useState(false);
  const [trialEndsAt, setTrialEndsAt] = useState("");
  const [saving, setSaving] = useState(false);
  async function save() {
    setSaving(true);
    try {
      const response = await fetch("/api/platform/subscriptions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tenantId, packageId, startsAt: new Date().toISOString(), status, isTrial, trialEndsAt, discountAmount: Number(discountAmount), manualPrice: manualPrice ? Number(manualPrice) : null, taxRate }) });
      if (!response.ok) throw new Error((await response.json()).error?.message ?? "Abonelik kaydedilemedi");
      toast.success("Abonelik güncellendi"); router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Abonelik kaydedilemedi"); } finally { setSaving(false); }
  }
  return <div className="space-y-6"><div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"><h2 className="font-semibold">Tenant aboneliği</h2><p className="mt-1 text-sm text-muted-foreground">Paket ve tenant özel fiyatını tek işlemde güncelleyin.</p><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Select aria-label="Tenant" value={tenantId} onChange={(event) => setTenantId(event.target.value)}>{tenants.map((tenant) => <option key={tenant.id} value={tenant.id}>{tenant.name}</option>)}</Select><Select aria-label="Paket" value={packageId} onChange={(event) => setPackageId(event.target.value)}>{packages.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.monthlyPrice} TL/ay</option>)}</Select><Select aria-label="Durum" value={status} onChange={(event) => setStatus(event.target.value)}><option value="TRIAL">Trial</option><option value="ACTIVE">Aktif</option><option value="PAST_DUE">Gecikmiş</option><option value="CANCELLED">İptal</option><option value="EXPIRED">Süresi dolmuş</option></Select><Input aria-label="Kişiye özel aylık fiyat" type="number" placeholder="Kişiye özel aylık fiyat" value={manualPrice} onChange={(event) => setManualPrice(event.target.value)} /><Input aria-label="İndirim" type="number" placeholder="İndirim" value={discountAmount} onChange={(event) => setDiscountAmount(event.target.value)} /><Input aria-label="Vergi oranı" type="number" placeholder="Vergi %" value={taxRate} onChange={(event) => setTaxRate(event.target.value)} /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isTrial} onChange={(event) => setIsTrial(event.target.checked)} /> Trial abonelik</label>{isTrial && <Input aria-label="Trial bitişi" type="date" value={trialEndsAt} onChange={(event) => setTrialEndsAt(event.target.value)} />}</div><Button className="mt-4" onClick={save} disabled={saving || !tenantId || !packageId}>{saving ? "Kaydediliyor..." : "Aboneliği kaydet"}</Button></div><div className="overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-sm"><table className="w-full min-w-[900px] text-sm"><thead><tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground"><th className="p-4">Tenant</th><th className="p-4">Paket</th><th className="p-4">Durum</th><th className="p-4">Fiyat</th><th className="p-4">Trial / Sonraki ödeme</th></tr></thead><tbody>{subscriptions.map((item) => <tr key={item.id} className="border-b last:border-0"><td className="p-4 font-medium">{item.tenant.name}<p className="text-xs text-muted-foreground">{item.tenant.slug}</p></td><td className="p-4">{item.package.name}</td><td className="p-4">{item.status}{item.isTrial && <span className="ml-2 rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700">Trial</span>}</td><td className="p-4">{(item.manualPrice ?? item.monthlyPrice).toLocaleString("tr-TR")} TL/ay<p className="text-xs text-muted-foreground">Toplam: {item.totalAmount.toLocaleString("tr-TR")} TL</p></td><td className="p-4 text-xs">{item.trialEndsAt ? new Date(item.trialEndsAt).toLocaleDateString("tr-TR") : "-"}</td></tr>)}</tbody></table></div></div>;
}
