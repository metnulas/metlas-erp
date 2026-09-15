"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { KeyRound, Trash2, UserCheck, UserRoundX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Role = { id: string; name: string; key: string; permissions: Array<{ permission: { name: string } }> };
type User = { id: string; name: string; email: string; phone: string | null; isActive: boolean; roleAssignments: Array<{ role: Role }> };

export default function UserRoleEditor({ user, roles }: { user: User; roles: Role[] }) {
  const [selected, setSelected] = useState(() => new Set(user.roleAssignments.map(({ role }) => role.id)));
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const router = useRouter();
  async function save() {
    setSaving(true);
    try {
      const response = await fetch(`/api/users/${user.id}/roles`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ roleIds: [...selected] }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message ?? "Roller kaydedilemedi");
      toast.success("Kullanıcı rolleri güncellendi");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Roller kaydedilemedi"); }
    finally { setSaving(false); }
  }
  async function updateProfile() { setSaving(true); try { const response = await fetch(`/api/users/${user.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone }) }); if (!response.ok) throw new Error("Kullanıcı güncellenemedi"); toast.success("Kullanıcı güncellendi"); router.refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "Kullanıcı güncellenemedi"); } finally { setSaving(false); } }
  async function toggleActive() { const response = await fetch(`/api/users/${user.id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !user.isActive }) }); if (!response.ok) { toast.error("Kullanıcı durumu güncellenemedi"); return; } toast.success(user.isActive ? "Kullanıcı pasifleştirildi" : "Kullanıcı aktifleştirildi"); router.refresh(); }
  async function resetPassword() { const password = window.prompt("Yeni şifreyi girin (en az 8 karakter):"); if (!password) return; const response = await fetch(`/api/users/${user.id}/password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) }); if (!response.ok) { toast.error("Şifre sıfırlanamadı"); return; } toast.success("Şifre sıfırlandı"); }
  async function deleteUser() { if (!window.confirm(`${user.name} kullanıcısını silmek istiyor musunuz?`)) return; const response = await fetch(`/api/users/${user.id}`, { method: "DELETE" }); if (!response.ok) { toast.error("Kullanıcı silinemedi"); return; } toast.success("Kullanıcı silindi"); router.refresh(); }
  return <div className={`flex flex-col gap-4 rounded-xl border border-border/70 p-4 ${!user.isActive ? "opacity-60" : ""}`}><div className="grid gap-2 sm:grid-cols-2"><Input aria-label="Kullanıcı adı" value={name} onChange={(event) => setName(event.target.value)} /><Input aria-label="Telefon" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder={user.email} /></div><p className="text-xs text-muted-foreground">{user.email} · {user.isActive ? "Aktif" : "Pasif"}</p><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{roles.map((role) => <div key={role.id} className={`rounded-lg border p-2.5 ${selected.has(role.id) ? "border-primary/50 bg-primary/5" : "border-border/70"}`}><label className="flex items-center gap-1.5 text-xs font-medium"><input type="checkbox" checked={selected.has(role.id)} onChange={() => setSelected((current) => { const next = new Set(current); if (next.has(role.id)) next.delete(role.id); else next.add(role.id); return next; })} />{role.name}<span className="ml-auto text-[10px] text-muted-foreground">{role.key}</span></label><details className="mt-1"><summary className="cursor-pointer text-[10px] text-primary">{role.permissions.length} izin</summary><p className="mt-1 text-[10px] leading-4 text-muted-foreground">{role.permissions.map(({ permission }) => permission.name).join(" · ") || "İzin tanımlı değil"}</p></details></div>)}</div><div className="flex flex-wrap items-center gap-2"><Button size="xs" onClick={save} disabled={saving}>{saving ? "..." : "Rolleri kaydet"}</Button><Button size="xs" variant="outline" onClick={updateProfile} disabled={saving}>Düzenle</Button><Button size="xs" variant="outline" onClick={toggleActive}><span className="sr-only">Durum: </span>{user.isActive ? <UserRoundX className="size-3.5" /> : <UserCheck className="size-3.5" />}{user.isActive ? "Pasifleştir" : "Aktifleştir"}</Button><Button size="xs" variant="outline" onClick={resetPassword}><KeyRound className="size-3.5" /> Şifre</Button><Button size="xs" variant="destructive" onClick={deleteUser}><Trash2 className="size-3.5" /> Sil</Button></div></div>;
}
