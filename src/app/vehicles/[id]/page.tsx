import { notFound } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import VehicleDetail from "@/features/vehicles/components/vehicle-detail";
import { createVehicleService } from "@/features/vehicles/services/vehicle.service";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";

export default async function VehiclePage({ params }: { params: Promise<{ id: string }> }) { const id = (await params).id; const service = createVehicleService(); const tenantId = await getCurrentTenantId(); const vehicle = await service.getById(id, tenantId).catch(() => null); if (!vehicle) notFound(); const orders = await service.getAssignedOrders(id, tenantId); return <DashboardLayout><VehicleDetail vehicle={vehicle} orders={orders} /></DashboardLayout>; }
