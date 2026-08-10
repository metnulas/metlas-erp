"use client";

import { useState } from "react";
import type { CustomerAccountEntry } from "@prisma/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const labels: Record<string, string> = { CHARGE: "Borç", PAYMENT: "Tahsilat", DEPOSIT_IN: "Depozito giriş", DEPOSIT_OUT: "Depozito çıkış" };
const styles: Record<string, string> = { CHARGE: "text-red-600", PAYMENT: "text-emerald-600", DEPOSIT_IN: "text-blue-600", DEPOSIT_OUT: "text-orange-600" };

export default function AccountEntryPanel({ customerId, initialEntries }: { customerId: string; initialEntries: CustomerAccountEntry[] }) {
  const [entries, setEntries] = useState(initialEntries);
  const [type, setType] = useState("PAYMENT");
  const [amount, setAmount] = useState("");
  const [depositQuantity, setDepositQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const isDeposit = type.startsWith("DEPOSIT");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`/api/customers/${customerId}/account`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, amount: isDeposit ? 0 : amount, depositQuantity: isDeposit ? depositQuantity : 0, notes }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message ?? "Hareket kaydedilemedi");
      setEntries((current) => [result.data, ...current]);
      setAmount(""); setDepositQuantity(""); setNotes("");
      toast.success("Cari hareket kaydedildi");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Hareket kaydedilemedi"); } finally { setSaving(false); }
  }

  return <section className="rounded-xl border border-border/70 bg-card p-6"><div><h2 className="text-lg font-semibold">Cari ve Depozito Hareketleri</h2><p className="mt-1 text-sm text-muted-foreground">Tahsilat, borç ve şişe depozitosu hareketlerini kaydedin.</p></div><form onSubmit={submit} className="mt-5 grid gap-3 rounded-xl bg-muted/30 p-4 sm:grid-cols-2 lg:grid-cols-4"><select aria-label="Hareket tipi" value={type} onChange={(event) => setType(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="PAYMENT">Tahsilat</option><option value="CHARGE">Borç</option><option value="DEPOSIT_IN">Depozito giriş</option><option value="DEPOSIT_OUT">Depozito çıkış</option></select>{isDeposit ? <Input type="number" min="1" value={depositQuantity} onChange={(event) => setDepositQuantity(event.target.value)} placeholder="Adet" aria-label="Depozito adedi" /> : <Input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Tutar (TRY)" aria-label="Tutar" />}<Input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Açıklama" aria-label="Açıklama" /><Button type="submit" disabled={saving}>{saving ? "Kaydediliyor..." : "Hareket Ekle"}</Button></form>{entries.length === 0 ? <p className="mt-5 text-sm text-muted-foreground">Henüz hareket kaydı bulunmuyor.</p> : <div className="mt-4 divide-y divide-border/70">{entries.map((entry) => <div key={entry.id} className="flex items-center justify-between gap-3 py-3"><div><p className="text-sm font-semibold">{labels[entry.type] ?? entry.type}</p><p className="text-xs text-muted-foreground">{entry.notes || "Açıklama yok"} · {new Date(entry.createdAt).toLocaleDateString("tr-TR")}</p></div><div className="text-right"><p className={`text-sm font-bold ${styles[entry.type] ?? ""}`}>{entry.type.startsWith("DEPOSIT") ? `${entry.depositChange > 0 ? "+" : ""}${entry.depositChange} adet` : `${entry.type === "PAYMENT" ? "-" : "+"}${Number(entry.amount).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}`}</p><p className="text-[11px] text-muted-foreground">Bakiye: {Number(entry.balanceAfter).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</p></div></div>)}</div>}</section>;
}
