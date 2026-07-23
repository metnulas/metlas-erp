import { notFound } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PersonnelDetail from "@/features/personnel/components/personnel-detail";
import { createPersonnelService } from "@/features/personnel/services/personnel.service";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
export default async function PersonnelPage({ params }: { params: Promise<{ id: string }> }) { const personnel = await createPersonnelService().getById((await params).id, await getCurrentTenantId()).catch(() => null); if (!personnel) notFound(); return <DashboardLayout><PersonnelDetail personnel={personnel} /></DashboardLayout>; }
