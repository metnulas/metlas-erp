"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function FuelPriceEditor({ historyId, initialPrice }: { historyId: string; initialPrice: number }) {
  const [price, setPrice] = useState(String(initialPrice));
  const [saving, setSaving] = useState(false);
  async function save() {
    const value = Number(price.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) { toast.error("Geçerli bir yakıt fiyatı girin"); return; }
    setSaving(true);
    try {
      const response = await fetch(`/api/route-histories/${historyId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fuelPricePerLiter: value }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message ?? "Yakıt fiyatı güncellenemedi");
      toast.success("Yakıt fiyatı güncellendi");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Yakıt fiyatı güncellenemedi"); }
    finally { setSaving(false); }
  }
  return <div className="flex items-center gap-2"><Input aria-label="Litre yakıt fiyatı" className="h-9 w-28 rounded-xl text-right tabular-nums" type="number" min="0.01" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} /><span className="text-xs text-muted-foreground">/ L</span><Button size="xs" variant="outline" onClick={save} disabled={saving}>{saving ? "..." : "Güncelle"}</Button></div>;
}
