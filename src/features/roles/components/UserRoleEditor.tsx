"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Role = { id: string; name: string; key: string };
type User = { id: string; name: string; email: string; isActive: boolean; roleAssignments: Array<{ role: Role }> };

export default function UserRoleEditor({ user, roles }: { user: User; roles: Role[] }) {
  const [selected, setSelected] = useState(() => new Set(user.roleAssignments.map(({ role }) => role.id)));
  const [saving, setSaving] = useState(false);
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
  return <div className="flex flex-col gap-3 rounded-xl border border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{user.name}</p><p className="text-xs text-muted-foreground">{user.email}</p></div><div className="flex flex-wrap items-center gap-2">{roles.map((role) => <label key={role.id} className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"><input type="checkbox" checked={selected.has(role.id)} onChange={() => setSelected((current) => { const next = new Set(current); if (next.has(role.id)) next.delete(role.id); else next.add(role.id); return next; })} />{role.name}</label>)}<Button size="xs" onClick={save} disabled={saving}>{saving ? "..." : "Kaydet"}</Button></div></div>;
}
