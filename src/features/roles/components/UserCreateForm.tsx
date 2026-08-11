"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Role = { id: string; name: string; key: string };

export default function UserCreateForm({ roles }: { roles: Role[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", roleIds: [] as string[] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  function toggleRole(roleId: string) { setForm((current) => ({ ...current, roleIds: current.roleIds.includes(roleId) ? current.roleIds.filter((id) => id !== roleId) : [...current.roleIds, roleId] })); }
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const response = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message ?? "Kullanıcı oluşturulamadı");
      router.push("/users"); router.refresh();
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : "Kullanıcı oluşturulamadı"); setSaving(false); }
  }
  return <form onSubmit={submit} className="space-y-6">
    <div className="grid gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:grid-cols-2">
      <label className="space-y-2 text-sm font-medium">Ad soyad<Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
      <label className="space-y-2 text-sm font-medium">E-posta<Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" required /></label>
      <label className="space-y-2 text-sm font-medium">Telefon<Input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} autoComplete="tel" required /></label>
      <label className="space-y-2 text-sm font-medium sm:col-span-2">Geçici şifre<Input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} minLength={8} autoComplete="new-password" required /><span className="text-xs font-normal text-muted-foreground">En az 8 karakter olmalıdır.</span></label>
    </div>
    <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"><h2 className="font-semibold">Roller</h2><p className="mt-1 text-sm text-muted-foreground">Kullanıcıya bir veya birden fazla rol atayın.</p><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{roles.map((role) => <label key={role.id} className="flex items-center gap-2 rounded-xl border border-border/70 p-3 text-sm hover:bg-muted"><input type="checkbox" checked={form.roleIds.includes(role.id)} onChange={() => toggleRole(role.id)} />{role.name}<span className="ml-auto text-xs text-muted-foreground">{role.key}</span></label>)}</div></section>
    {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => router.push("/users")}>İptal</Button><Button type="submit" disabled={saving || form.roleIds.length === 0}>{saving ? "Oluşturuluyor..." : "Kullanıcı oluştur"}</Button></div>
  </form>;
}
