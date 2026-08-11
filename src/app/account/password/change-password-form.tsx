"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ChangePasswordForm() {
  const { update } = useSession();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmation: "" });
  const [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent) { event.preventDefault(); if (saving) return; setSaving(true); try { const response = await fetch("/api/account/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); const result = await response.json(); if (!response.ok) throw new Error(result.error?.message ?? "Şifre güncellenemedi"); await update().catch(() => undefined); toast.success("Şifreniz güncellendi"); window.location.assign("/platform"); } catch (error) { toast.error(error instanceof Error ? error.message : "Şifre güncellenemedi"); setSaving(false); } }
  return <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border/70 bg-card p-6 shadow-sm"><label className="block space-y-2 text-sm font-medium">Mevcut şifre<Input type="password" value={form.currentPassword} onChange={(event) => setForm({ ...form, currentPassword: event.target.value })} required /></label><label className="block space-y-2 text-sm font-medium">Yeni şifre<Input type="password" value={form.newPassword} onChange={(event) => setForm({ ...form, newPassword: event.target.value })} minLength={8} required /><span className="text-xs font-normal text-muted-foreground">Büyük/küçük harf, rakam ve özel karakter içermelidir.</span></label><label className="block space-y-2 text-sm font-medium">Yeni şifre tekrar<Input type="password" value={form.confirmation} onChange={(event) => setForm({ ...form, confirmation: event.target.value })} required /></label><Button type="submit" className="w-full" disabled={saving} aria-busy={saving}>{saving ? "Güncelleniyor..." : "Şifreyi güncelle"}</Button></form>;
}
