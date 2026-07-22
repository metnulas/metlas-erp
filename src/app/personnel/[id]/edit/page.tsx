import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import PersonnelForm from "@/features/personnel/components/personnel-form";
import { createPersonnelService } from "@/features/personnel/services/personnel.service";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
export default async function EditPersonnelPage({ params }: { params: Promise<{ id: string }> }) { const personnel = await createPersonnelService().getById((await params).id, getCurrentTenantId()).catch(() => null); if (!personnel) notFound(); return <DashboardLayout><div className="space-y-6"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" render={<Link href={`/personnel/${personnel.id}`} />}><ArrowLeft className="size-4" /></Button><div><h1 className="text-2xl font-bold tracking-tight">Personel Düzenle</h1><p className="text-sm text-muted-foreground">Personel bilgilerini güncelleyin.</p></div></div><PersonnelForm mode="edit" initialData={personnel} /></div></DashboardLayout>; }
