import type { Metadata } from "next";
import { ClipboardCheck } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AuditLogList from "@/features/audit/components/audit-log-list";

export const metadata: Metadata = { title: "Denetim Kayıtları | METLAS ERP", description: "ERP işlemlerinin denetim kayıtlarını inceleyin" };

export default function AuditLogsPage() {
  return <DashboardLayout><div className="space-y-6"><div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><ClipboardCheck className="size-5" /></span><div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Denetim Kayıtları</h1><p className="mt-1 text-sm text-muted-foreground">Kritik ERP işlemlerini, aktörlerini ve zamanlarını inceleyin.</p></div></div><AuditLogList /></div></DashboardLayout>;
}
