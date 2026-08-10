import { NextRequest, NextResponse } from "next/server";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { handleApiError } from "@/server/errors/handle-api-error";
import { createDeliveryService } from "@/features/deliveries/services/delivery.service";
import { deliveryQuerySchema } from "@/features/deliveries/validators/delivery.schema";
import { requirePermission } from "@/server/auth/authorization";

const deliveryService = createDeliveryService();

export async function GET(request: NextRequest) {
  try {
    await requirePermission("deliveries.view");
    const { searchParams } = new URL(request.url);
    const query = deliveryQuerySchema.parse({ date: searchParams.get("date") ?? undefined, status: searchParams.get("status") ?? undefined, includeUnscheduled: searchParams.get("includeUnscheduled") ?? false });
    return NextResponse.json({ success: true, data: await deliveryService.list(await getCurrentTenantId(), query) });
  } catch (error) { return handleApiError(error); }
}
