import { NextRequest, NextResponse } from "next/server";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { handleApiError } from "@/server/errors/handle-api-error";
import { createDeliveryService } from "@/features/deliveries/services/delivery.service";
import { assignDeliverySchema } from "@/features/deliveries/validators/delivery.schema";
import { requirePermission } from "@/server/auth/authorization";

const deliveryService = createDeliveryService();

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission("delivery:write");
    const { id } = await params;
    const input = assignDeliverySchema.parse(await request.json());
    return NextResponse.json({ success: true, data: await deliveryService.assign(id, await getCurrentTenantId(), input, session.user.id) });
  } catch (error) { return handleApiError(error); }
}
