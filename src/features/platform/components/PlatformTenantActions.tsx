"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PlatformTenantActions({ tenantId, isActive }: { tenantId?: string; isActive?: boolean }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  async function createTenant() { if (!name.trim()) return; setSaving(true); try { const response = await fetch("/api/platform/tenants", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) }); if (!response.ok) throw new Error("Tenant oluşturulamadı"); setName(""); toast.success("Tenant oluşturuldu"); router.refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "Tenant oluşturulamadı"); } finally { setSaving(false); } }
  async function toggleTenant() { const response = await fetch(`/api/platform/tenants/${tenantId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !isActive }) }); if (!response.ok) { toast.error("Tenant durumu değiştirilemedi"); return; } toast.success(isActive ? "Tenant pasifleştirildi" : "Tenant aktifleştirildi"); router.refresh(); }
  async function deleteTenant() { if (!window.confirm("Boş tenant silinsin mi?")) return; const response = await fetch(`/api/platform/tenants/${tenantId}`, { method: "DELETE" }); if (!response.ok) { const result = await response.json(); toast.error(result.error?.message ?? "Tenant silinemedi"); return; } toast.success("Tenant silindi"); router.refresh(); }
  return tenantId ? <div className="flex flex-wrap gap-2"><Button size="xs" variant="outline" onClick={toggleTenant}>{isActive ? "Pasifleştir" : "Aktifleştir"}</Button><Button size="xs" variant="destructive" onClick={deleteTenant}>Sil</Button></div> : <div className="flex w-full max-w-md gap-2"><Input aria-label="Yeni tenant adı" placeholder="Yeni firma adı" value={name} onChange={(event) => setName(event.target.value)} /><Button onClick={createTenant} disabled={saving || !name.trim()}>{saving ? "Oluşturuluyor..." : "Tenant oluştur"}</Button></div>;
}
