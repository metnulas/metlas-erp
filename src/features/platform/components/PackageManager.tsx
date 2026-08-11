"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PackageItem = { id: string; code: string; name: string; description: string | null; monthlyPrice: number; annualPrice: number; maxUsers: number | null; maxOrders: number | null; maxWarehouses: number | null; maxVehicles: number | null; storageGb: number | null; apiLimit: number | null; aiUsage: number | null; isActive: boolean; _count: { subscriptions: number } };
const initial = { code: "", name: "", monthlyPrice: "", annualPrice: "", maxUsers: "", maxOrders: "", maxWarehouses: "", maxVehicles: "", storageGb: "", apiLimit: "", aiUsage: "" };

export default function PackageManager({ packages }: { packages: PackageItem[] }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const set = (key: keyof typeof initial, value: string) => setForm((current) => ({ ...current, [key]: value }));
  async function create() {
    setSaving(true);
    try {
      const body = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value === "" ? null : ["monthlyPrice", "annualPrice", "maxUsers", "maxOrders", "maxWarehouses", "maxVehicles", "storageGb", "apiLimit", "aiUsage"].includes(key) ? Number(value) : value]));
      const response = await fetch("/api/platform/packages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!response.ok) throw new Error((await response.json()).error?.message ?? "Paket oluşturulamadı");
      setForm(initial); toast.success("Paket oluşturuldu"); router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Paket oluşturulamadı"); } finally { setSaving(false); }
  }
  async function toggle(item: PackageItem) {
    const response = await fetch(`/api/platform/packages/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !item.isActive }) });
    if (!response.ok) { toast.error("Paket durumu değiştirilemedi"); return; }
    toast.success(item.isActive ? "Paket pasifleştirildi" : "Paket aktifleştirildi"); router.refresh();
  }
  async function remove(item: PackageItem) {
    if (!window.confirm(`${item.name} paketi silinsin mi?`)) return;
    const response = await fetch(`/api/platform/packages/${item.id}`, { method: "DELETE" });
    if (!response.ok) { toast.error((await response.json()).error?.message ?? "Paket silinemedi"); return; }
    toast.success("Paket silindi"); router.refresh();
  }
  const fields = [["code", "Kod"], ["name", "Paket adı"], ["monthlyPrice", "Aylık fiyat"], ["annualPrice", "Yıllık fiyat"], ["maxUsers", "Kullanıcı limiti"], ["maxOrders", "Sipariş limiti"], ["maxWarehouses", "Depo limiti"], ["maxVehicles", "Araç limiti"], ["storageGb", "Disk GB"], ["apiLimit", "API limiti"], ["aiUsage", "AI kullanımı"]] as const;
  return <div className="space-y-6"><div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"><h2 className="font-semibold">Yeni paket</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{fields.map(([key, label]) => <Input key={key} aria-label={label} placeholder={label} type={key === "code" || key === "name" ? "text" : "number"} value={form[key]} onChange={(event) => set(key, event.target.value)} />)}</div><Button className="mt-4" onClick={create} disabled={saving || !form.code || !form.name || !form.monthlyPrice || !form.annualPrice}>{saving ? "Kaydediliyor..." : "Paket oluştur"}</Button></div><div className="overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-sm"><table className="w-full min-w-[980px] text-sm"><thead><tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground"><th className="p-4">Paket</th><th className="p-4">Fiyat</th><th className="p-4">Limitler</th><th className="p-4">Kullanım</th><th className="p-4">Durum</th><th className="p-4" /></tr></thead><tbody>{packages.map((item) => <tr key={item.id} className="border-b last:border-0"><td className="p-4"><p className="font-semibold">{item.name}</p><p className="text-xs text-muted-foreground">{item.code}</p></td><td className="p-4">{item.monthlyPrice.toLocaleString("tr-TR")} TL / ay<br /><span className="text-xs text-muted-foreground">{item.annualPrice.toLocaleString("tr-TR")} TL / yıl</span></td><td className="p-4 text-xs">{item.maxUsers ?? "∞"} kullanıcı · {item.maxOrders ?? "∞"} sipariş<br />{item.maxWarehouses ?? "∞"} depo · {item.maxVehicles ?? "∞"} araç</td><td className="p-4 text-xs">{item.storageGb ?? "∞"} GB · {item.apiLimit ?? "∞"} API<br />{item.aiUsage ?? "∞"} AI</td><td className="p-4"><span className={`rounded-full px-2 py-1 text-xs ${item.isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{item.isActive ? "Aktif" : "Pasif"}</span><p className="mt-2 text-xs text-muted-foreground">{item._count.subscriptions} tenant</p></td><td className="p-4"><div className="flex gap-2"><Button size="xs" variant="outline" onClick={() => toggle(item)}>{item.isActive ? "Pasifleştir" : "Aktifleştir"}</Button><Button size="xs" variant="destructive" onClick={() => remove(item)}>Sil</Button></div></td></tr>)}</tbody></table></div></div>;
}
