"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Setting = { id: string; key: string; label: string; category: string; value: string; description: string | null; isSecret: boolean };
const categoryLabels: Record<string, string> = { SMTP: "SMTP", SMS: "SMS", MAIL: "Mail", STORAGE: "Storage", CLOUD: "Cloud", BACKUP: "Backup", QUEUE: "Queue", CRON: "Cron", CACHE: "Cache", AI: "AI", BRANDING: "Marka", SYSTEM: "Sistem" };

export default function PlatformSettingsManager({ settings }: { settings: Setting[] }) {
  const router = useRouter();
  const [values, setValues] = useState(() => Object.fromEntries(settings.map((setting) => [setting.key, setting.value])));
  const [saving, setSaving] = useState(false);
  const groups = settings.reduce<Record<string, Setting[]>>((result, setting) => { (result[setting.category] ??= []).push(setting); return result; }, {});
  async function save() {
    setSaving(true);
    try {
      const response = await fetch("/api/platform/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settings: Object.entries(values).map(([key, value]) => ({ key, value })) }) });
      if (!response.ok) throw new Error((await response.json()).error?.message ?? "Ayarlar kaydedilemedi");
      toast.success("Platform ayarları kaydedildi"); router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Ayarlar kaydedilemedi"); } finally { setSaving(false); }
  }
  return <div className="space-y-5">{Object.entries(groups).map(([category, items]) => <section key={category} className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"><div><h2 className="font-semibold">{categoryLabels[category] ?? category}</h2><p className="mt-1 text-sm text-muted-foreground">{categoryLabels[category] ?? category} bağlantı ve çalışma ayarları.</p></div><div className="mt-4 grid gap-4 sm:grid-cols-2">{items.map((setting) => <label key={setting.key} className="space-y-1.5"><span className="text-sm font-medium">{setting.label}</span><Input type={setting.isSecret ? "password" : "text"} value={values[setting.key] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [setting.key]: event.target.value }))} placeholder={setting.isSecret ? "Değiştirmek için yeni değer girin" : setting.label} /><span className="block text-xs text-muted-foreground">{setting.key}{setting.isSecret ? " · Gizli değer" : ""}</span></label>)}</div></section>)}<div className="sticky bottom-4 flex justify-end"><Button onClick={save} disabled={saving}>{saving ? "Kaydediliyor..." : "Ayarları kaydet"}</Button></div></div>;
}
