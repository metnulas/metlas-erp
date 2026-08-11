import Link from "next/link";
import { Settings2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { requirePermission } from "@/server/auth/authorization";
import { listPlatformSettings } from "@/features/platform/services/settings.service";
import PlatformSettingsManager from "@/features/platform/components/PlatformSettingsManager";

export default async function PlatformSettingsPage() {
  await requirePermission("settings.manage");
  const settings = await listPlatformSettings();
  return <DashboardLayout><div className="space-y-6"><div><Link href="/platform" className="text-sm font-medium text-primary">← Platform Merkezi</Link><p className="mt-4 flex items-center gap-2 text-sm font-medium text-primary"><Settings2 className="size-4" /> Sistem yönetimi</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Platform Ayarları</h1><p className="mt-2 text-sm text-muted-foreground">SMTP, storage, backup, AI, marka ve bakım modu ayarlarını yönetin.</p></div><PlatformSettingsManager settings={settings} /></div></DashboardLayout>;
}
