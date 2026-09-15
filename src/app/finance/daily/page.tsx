"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";

type PartnerSummary = { id: string; code: string; name: string; ibanSales: number; cashSales: number; posSales: number; totalSales: number; paymentCount: number };
const money = (value: number) => value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
const today = new Date().toISOString().slice(0, 10);

export default function DailyFinancePage() {
  const [date, setDate] = useState(today); const [partners, setPartners] = useState<PartnerSummary[]>([]); const [message, setMessage] = useState("");
  useEffect(() => { fetch(`/api/finance/partner-summary?date=${date}`).then((response) => response.json()).then((result) => { if (result.success) setPartners(result.data.partners); else setMessage(result.error?.message ?? "Özet yüklenemedi"); }).catch(() => setMessage("Özet yüklenemedi")); }, [date]);
  return <DashboardLayout><div className="space-y-6"><header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Finans merkezi</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Günlük bayi satış özeti</h1><p className="mt-1 text-sm text-muted-foreground">Seçilen günün IBAN, nakit, POS ve genel satışlarını bayi bazında görün.</p></div><label className="text-sm font-medium">Gün<Input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label></header>{message && <p className="rounded-lg bg-muted px-4 py-3 text-sm">{message}</p>}<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{partners.map((partner) => <article key={partner.id} className="rounded-2xl border bg-card p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-lg font-semibold">{partner.name}</p><p className="text-xs text-muted-foreground">{partner.code} · {partner.paymentCount} satış</p></div><p className="text-lg font-bold text-primary">{money(partner.totalSales)}</p></div><div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs"><div className="rounded-lg bg-blue-50 p-3 text-blue-700"><p>IBAN</p><b className="mt-1 block">{money(partner.ibanSales)}</b></div><div className="rounded-lg bg-emerald-50 p-3 text-emerald-700"><p>Nakit</p><b className="mt-1 block">{money(partner.cashSales)}</b></div><div className="rounded-lg bg-violet-50 p-3 text-violet-700"><p>POS</p><b className="mt-1 block">{money(partner.posSales)}</b></div></div></article>)}{!partners.length && <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">Bu gün kayıtlı bayi satışı bulunmuyor.</p>}</section></div></DashboardLayout>;
}
