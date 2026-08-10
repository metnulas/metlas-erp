import { NextRequest, NextResponse } from "next/server";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { handleApiError } from "@/server/errors/handle-api-error";
import { createVehicleService } from "@/features/vehicles/services/vehicle.service";
import { requirePermission } from "@/server/auth/authorization";
import { updateVehicleSchema, vehicleIdSchema } from "@/features/vehicles/validators/vehicle.schema";

const vehicleService = createVehicleService();


export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requirePermission("vehicles.view"); const { id } = vehicleIdSchema.parse(await params); return NextResponse.json({ success: true, data: await vehicleService.getById(id, await getCurrentTenantId()) }); } catch (error) { return handleApiError(error); }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const session = await requirePermission("vehicles.manage"); const { id } = await params; const input = updateVehicleSchema.parse({ ...(await request.json()), id }); return NextResponse.json({ success: true, data: await vehicleService.update(id, await getCurrentTenantId(), input, session.user.id) }); } catch (error) { return handleApiError(error); }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const session = await requirePermission("vehicles.manage"); const { id } = vehicleIdSchema.parse(await params); await vehicleService.softDelete(id, await getCurrentTenantId(), session.user.id); return NextResponse.json({ success: true, data: { deleted: true } }); } catch (error) { return handleApiError(error); }
}
