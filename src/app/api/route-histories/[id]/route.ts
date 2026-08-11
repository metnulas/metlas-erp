import { NextRequest, NextResponse } from "next/server";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { requirePermission } from "@/server/auth/authorization";
import { handleApiError } from "@/server/errors/handle-api-error";
import { updateFuelPriceSchema } from "@/features/routes/validators/route-history.schema";
import { updateRouteFuelPrice } from "@/features/routes/services/route-history.service";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("routes.manage");
    const { id } = await params;
    const input = updateFuelPriceSchema.parse(await request.json());
    return NextResponse.json({ success: true, data: await updateRouteFuelPrice(await getCurrentTenantId(), id, input.fuelPricePerLiter) });
  } catch (error) { return handleApiError(error); }
}
