"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ImpersonateTenantButton({ tenantId }: { tenantId: string }) {
  const { update } = useSession();
  const [loading, setLoading] = useState(false);
  async function enter() { setLoading(true); await update({ impersonatingTenantId: tenantId }); window.location.assign("/"); }
  return <Button size="xs" variant="outline" onClick={enter} disabled={loading}><Eye className="size-3.5" /> {loading ? "Açılıyor..." : "ERP'ye gir"}</Button>;
}
