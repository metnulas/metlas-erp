"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const today = new Date().toISOString().slice(0, 10);

export default function DashboardExpenseForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    category: "",
    type: "OTHER",
    description: "",
    amount: "",
    expenseDate: today,
    paymentMethod: "CASH",
  });
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/finance/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok || !result.success)
        throw new Error(result.error?.message ?? "Gider kaydedilemedi");
      toast.success("Gider kaydedildi. Dashboard cirosu güncellendi.");
      setForm({ ...form, category: "", description: "", amount: "" });
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gider kaydedilemedi",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Finans hızlı işlem
        </p>
        <h2 className="mt-1 text-xl font-bold tracking-tight">
          Bugünün giderini yaz
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Kaydettiğiniz gider, net cirodan otomatik düşer.
        </p>
      </div>
      <form
        onSubmit={submit}
        className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6"
      >
        <Input
          className="lg:col-span-1"
          placeholder="Kategori"
          value={form.category}
          onChange={(event) =>
            setForm({ ...form, category: event.target.value })
          }
          required
        />
        <Input
          className="lg:col-span-2"
          placeholder="Açıklama"
          value={form.description}
          onChange={(event) =>
            setForm({ ...form, description: event.target.value })
          }
          required
        />
        <Input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Tutar (TL)"
          value={form.amount}
          onChange={(event) => setForm({ ...form, amount: event.target.value })}
          required
        />
        <select
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          value={form.type}
          onChange={(event) => setForm({ ...form, type: event.target.value })}
        >
          <option value="OTHER">Genel gider</option>
          <option value="FUEL">Yakıt</option>
        </select>
        <select
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          value={form.paymentMethod}
          onChange={(event) =>
            setForm({ ...form, paymentMethod: event.target.value })
          }
        >
          <option value="CASH">Nakit</option>
          <option value="BANK_TRANSFER">IBAN</option>
          <option value="CARD">POS</option>
          <option value="OTHER">Diğer</option>
        </select>
        <Input
          type="date"
          value={form.expenseDate}
          onChange={(event) =>
            setForm({ ...form, expenseDate: event.target.value })
          }
        />
        <Button
          type="submit"
          disabled={saving}
          className="sm:col-span-2 lg:col-span-6"
        >
          {saving ? "Kaydediliyor..." : "Gideri kaydet"}
        </Button>
      </form>
    </section>
  );
}
