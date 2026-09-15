"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Partner = { id: string; code: string; name: string; balance: number };
const money = (value: number) => value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

export default function FinancePage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partner, setPartner] = useState({ code: "", name: "", paymentTermDays: "0" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  async function loadPartners() { const response = await fetch("/api/finance/partners"); const result = await response.json(); if (result.success) setPartners(result.data); else setMessage(result.error?.message ?? "Bayi listesi yüklenemedi"); }
  // Load the tenant-scoped partner list when the finance screen opens.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadPartners(); }, []);
  async function createPartner(event: React.FormEvent) { event.preventDefault(); setLoading(true); setMessage(""); try { const response = await fetch("/api/finance/partners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: partner.code, name: partner.name, type: "BOTH", paymentTermDays: Number(partner.paymentTermDays) }) }); const result = await response.json(); if (!response.ok || !result.success) throw new Error(result.error?.message ?? "Bayi eklenemedi"); setMessage("Bayi başarıyla eklendi."); setPartner({ code: "", name: "", paymentTermDays: "0" }); await loadPartners(); } catch (error) { setMessage(error instanceof Error ? error.message : "Bayi eklenemedi"); } finally { setLoading(false); } }
  return <DashboardLayout><div className="space-y-6"><header><p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Finans merkezi</p><h1 className="mt-2 text-3xl font-bold">Bayi bilgileri</h1><p className="mt-1 text-sm text-muted-foreground">Bayi ekleyin ve cari hesabını yönetin.</p></header>{message && <p className="rounded-lg bg-muted px-4 py-3 text-sm">{message}</p>}<section className="max-w-3xl rounded-2xl border bg-card p-6"><h2 className="text-lg font-semibold">Yeni bayi ekle</h2><form className="mt-5 grid gap-4 sm:grid-cols-3" onSubmit={createPartner}><label className="space-y-1 text-sm font-medium">Bayi kodu<Input value={partner.code} onChange={(event) => setPartner({ ...partner, code: event.target.value })} placeholder="BAYI-001" required /></label><label className="space-y-1 text-sm font-medium">Bayi adı<Input value={partner.name} onChange={(event) => setPartner({ ...partner, name: event.target.value })} placeholder="A Ana Bayi" required /></label><label className="space-y-1 text-sm font-medium">Vade günü<Input type="number" min="0" value={partner.paymentTermDays} onChange={(event) => setPartner({ ...partner, paymentTermDays: event.target.value })} /></label><Button type="submit" disabled={loading} className="sm:col-span-3">{loading ? "Kaydediliyor..." : "Bayi ekle"}</Button></form></section><section className="rounded-2xl border bg-card p-6"><h2 className="text-lg font-semibold">Kayıtlı bayiler</h2><div className="mt-4 divide-y">{partners.map((item) => <div key={item.id} className="flex items-center justify-between py-3"><span><b>{item.name}</b><small className="ml-2 text-muted-foreground">{item.code}</small></span><b>{money(item.balance)}</b></div>)}{partners.length === 0 && <p className="py-4 text-sm text-muted-foreground">Henüz bayi eklenmedi.</p>}</div></section></div></DashboardLayout>;
}
