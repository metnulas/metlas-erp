"use client";

import { useState } from "react";
import { Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type RepeatItem = { productId: string | null; productName: string; quantity: number; unitPrice: number; notes: string | null };

export default function RepeatOrderButton({ customerId, items }: { customerId: string; items: RepeatItem[] }) {
  const [loading, setLoading] = useState(false);

  async function repeatOrder() {
    setLoading(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          orderDate: new Date().toISOString().slice(0, 10),
          status: "PENDING",
          discount: 0,
          notes: "Önceki siparişten tekrar oluşturuldu",
          items: items.map((item) => ({ ...item, total: item.quantity * item.unitPrice })),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message ?? "Tekrar sipariş oluşturulamadı");
      toast.success("Tekrar sipariş oluşturuldu");
      window.location.assign(`/orders/${result.data.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Tekrar sipariş oluşturulamadı");
    } finally {
      setLoading(false);
    }
  }

  return <Button variant="outline" className="w-full md:w-auto" onClick={repeatOrder} disabled={loading || items.length === 0}>{loading ? <Loader2 className="size-4 animate-spin" /> : <Copy className="size-4" />} Tekrar sipariş</Button>;
}
