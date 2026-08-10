"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Permission = { id: string; key: string; name: string; group: { key: string; name: string } };
type Role = { id?: string; key: string; name: string; description: string | null; color: string | null; icon: string | null; isSuperAdmin?: boolean; permissions: Array<{ permission: Permission }> };

export default function RoleEditor({ role, permissions }: { role?: Role; permissions: Permission[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ key: role?.key ?? "", name: role?.name ?? "", description: role?.description ?? "", color: role?.color ?? "#2563eb", icon: role?.icon ?? "Shield" });
  const [selected, setSelected] = useState(() => new Set(role?.permissions.map(({ permission }) => permission.id) ?? []));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const groups = permissions.reduce<Record<string, { name: string; items: Permission[] }>>((result, permission) => { const group = result[permission.group.key] ?? { name: permission.group.name, items: [] }; group.items.push(permission); result[permission.group.key] = group; return result; }, {});

  function toggle(id: string) { setSelected((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; }); }
  function toggleGroup(items: Permission[], checked: boolean) { setSelected((current) => { const next = new Set(current); items.forEach((item) => checked ? next.add(item.id) : next.delete(item.id)); return next; }); }
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const response = await fetch(role?.id ? `/api/roles/${role.id}` : "/api/roles", { method: role?.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, permissionIds: [...selected] }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message ?? "Rol kaydedilemedi");
      router.push("/roles"); router.refresh();
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : "Rol kaydedilemedi"); setSaving(false); }
  }

  return <form onSubmit={submit} className="space-y-6">
    <div className="grid gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:grid-cols-2">
      <label className="space-y-2 text-sm font-medium">Rol anahtarı<Input value={form.key} disabled={role?.isSuperAdmin} onChange={(event) => setForm({ ...form, key: event.target.value })} placeholder="operations_night" required /></label>
      <label className="space-y-2 text-sm font-medium">Rol adı<Input value={form.name} disabled={role?.isSuperAdmin} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Operasyon Gece" required /></label>
      <label className="space-y-2 text-sm font-medium sm:col-span-2">Açıklama<textarea className="min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
      <label className="space-y-2 text-sm font-medium">Renk<Input type="color" value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} /></label>
      <label className="space-y-2 text-sm font-medium">İkon<Input value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })} placeholder="Shield" /></label>
    </div>
    <div className="space-y-3">
      {Object.entries(groups).map(([key, group]) => { const allSelected = group.items.every((item) => selected.has(item.id)); return <section key={key} className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold">{group.name}</h2><div className="flex gap-2"><Button type="button" size="xs" variant="outline" onClick={() => toggleGroup(group.items, true)}>Hepsini seç</Button><Button type="button" size="xs" variant="ghost" onClick={() => toggleGroup(group.items, false)}>Hepsini kaldır</Button></div></div><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{group.items.map((permission) => <label key={permission.id} className="flex items-center gap-2 rounded-lg border border-border/60 p-3 text-sm hover:bg-muted"><input type="checkbox" checked={selected.has(permission.id)} onChange={() => toggle(permission.id)} />{permission.name}<span className="ml-auto text-[10px] text-muted-foreground">{permission.key}</span></label>)}</div>{allSelected && <p className="mt-3 text-xs text-emerald-600">Kategori tamamen seçili</p>}</section>; })}
    </div>
    {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => router.push("/roles")}>İptal</Button><Button type="submit" disabled={saving || role?.isSuperAdmin}>{saving ? "Kaydediliyor..." : "Rolü kaydet"}</Button></div>
  </form>;
}
