import { notFound } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import VehicleDetail from "@/features/vehicles/components/vehicle-detail";
import { createVehicleService } from "@/features/vehicles/services/vehicle.service";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";

export default async function VehiclePage({ params }: { params: Promise<{ id: string }> }) { const vehicle = await createVehicleService().getById((await params).id, getCurrentTenantId()).catch(() => null); if (!vehicle) notFound(); return <DashboardLayout><VehicleDetail vehicle={vehicle} /></DashboardLayout>; }
