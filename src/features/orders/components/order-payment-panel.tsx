"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = { orderId: string; amount: number };
const labels = { CASH: "Nakit", IBAN: "IBAN", CARD: "POS" } as const;

export default function OrderPaymentPanel({ orderId, amount }: Props) {
  const [method, setMethod] = useState<keyof typeof labels | null>(null); const [savedMethod, setSavedMethod] = useState<string | null>(null); const [loading, setLoading] = useState(false); const [message, setMessage] = useState("");
  async function load() { const response = await fetch(`/api/orders/${orderId}/payments`); const result = await response.json(); if (result.success && result.data[0]) setSavedMethod(result.data[0].method); }
  // Read the existing payment once so a delivered order cannot be charged twice from the UI.
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, []);
  async function save(nextMethod: keyof typeof labels) { setLoading(true); setMessage(""); try { const response = await fetch(`/api/orders/${orderId}/payments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount, method: nextMethod }) }); const result = await response.json(); if (!response.ok || !result.success) throw new Error(result.error?.message ?? "Ödeme kaydedilemedi"); setSavedMethod(nextMethod); setMethod(null); setMessage("Ödeme yöntemi kaydedildi."); } catch (error) { setMessage(error instanceof Error ? error.message : "Ödeme kaydedilemedi"); } finally { setLoading(false); } }
  return <section className="rounded-xl border border-primary/25 bg-primary/5 p-5"><div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold">Ödeme yöntemi</h2><p className="mt-1 text-sm text-muted-foreground">Teslim edilen siparişin tahsilat yöntemini seçin.</p></div><b>{amount.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</b></div>{savedMethod ? <p className="mt-4 rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-800">Kayıtlı yöntem: <b>{labels[savedMethod as keyof typeof labels] ?? savedMethod}</b></p> : <div className="mt-4 flex flex-wrap gap-2">{(Object.keys(labels) as Array<keyof typeof labels>).map((key) => <Button key={key} type="button" variant={method === key ? "default" : "outline"} disabled={loading} onClick={() => { setMethod(key); void save(key); }}>{labels[key]}</Button>)}</div>}{message && <p className="mt-3 text-sm text-muted-foreground">{message}</p>}</section>;
}
