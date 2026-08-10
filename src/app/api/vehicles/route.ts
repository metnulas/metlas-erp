import { NextRequest, NextResponse } from "next/server";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { handleApiError } from "@/server/errors/handle-api-error";
import { createVehicleService } from "@/features/vehicles/services/vehicle.service";
import { createVehicleSchema, vehicleQuerySchema } from "@/features/vehicles/validators/vehicle.schema";
import { requirePermission } from "@/server/auth/authorization";

const vehicleService = createVehicleService();


export async function GET(request: NextRequest) {
  try {
    await requirePermission("vehicle:read");
    const { searchParams } = new URL(request.url);
    const query = vehicleQuerySchema.parse({ page: searchParams.get("page") ?? 1, pageSize: searchParams.get("pageSize") ?? 20, search: searchParams.get("search") ?? undefined, type: searchParams.get("type") ?? undefined, status: searchParams.get("status") ?? undefined, sort: searchParams.get("sort") ?? "createdAt", order: searchParams.get("order") ?? "desc" });
    return NextResponse.json({ success: true, data: await vehicleService.list(await getCurrentTenantId(), query) });
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission("vehicle:write");
    const vehicle = await vehicleService.create(await getCurrentTenantId(), createVehicleSchema.parse(await request.json()), session.user.id);
    return NextResponse.json({ success: true, data: vehicle }, { status: 201 });
  } catch (error) { return handleApiError(error); }
}
