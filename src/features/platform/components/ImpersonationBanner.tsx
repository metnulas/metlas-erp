"use client";

import { useSession } from "next-auth/react";
import { Eye, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ImpersonationBanner() {
  const { data: session, update } = useSession();
  if (!session?.user?.isGlobalAdmin || !session.user.impersonatingTenantId) return null;
  async function exit() { await update({ impersonatingTenantId: null }); window.location.assign("/platform"); }
  return <div className="sticky top-0 z-40 flex min-h-12 items-center justify-between gap-3 bg-amber-400 px-4 py-2 text-sm font-medium text-amber-950 shadow-sm sm:px-6 lg:px-10"><span className="flex items-center gap-2"><Eye className="size-4" /> Global Super Admin olarak tenant görüntüleme modu aktif.</span><Button size="xs" variant="outline" className="border-amber-800/30 bg-amber-100/40 text-amber-950 hover:bg-amber-100" onClick={exit}><LogOut className="size-3.5" /> Global panele dön</Button></div>;
}
