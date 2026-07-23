import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import VehicleForm from "@/features/vehicles/components/vehicle-form";
import { createVehicleService } from "@/features/vehicles/services/vehicle.service";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) { const vehicle = await createVehicleService().getById((await params).id, await getCurrentTenantId()).catch(() => null); if (!vehicle) notFound(); return <DashboardLayout><div className="space-y-6"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" render={<Link href={`/vehicles/${vehicle.id}`} />}><ArrowLeft className="size-4" /></Button><div><h1 className="text-2xl font-bold tracking-tight">Araç Düzenle</h1><p className="text-sm text-muted-foreground">Araç bilgilerini güncelleyin.</p></div></div><VehicleForm mode="edit" initialData={vehicle} /></div></DashboardLayout>; }
