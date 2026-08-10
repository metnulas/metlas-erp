import { NextRequest, NextResponse } from "next/server";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { createOrderService } from "@/features/orders/services/order.service";
import { orderIdSchema, updateOrderSchema } from "@/features/orders/validators/order.schema";
import type { ApiResponse } from "@/shared/types";
import { handleApiError } from "@/server/errors/handle-api-error";
import { requirePermission } from "@/server/auth/authorization";

const orderService = createOrderService();


export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("order:read");
    const tenantId = await getCurrentTenantId();
    const { id } = await params;
    const { id: validId } = orderIdSchema.parse({ id });

    const order = await orderService.getById(validId, tenantId);

    const response: ApiResponse<typeof order> = {
      success: true,
      data: order,
    };

    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission("order:write");
    const tenantId = await getCurrentTenantId();
    const { id } = await params;
    const body = await request.json();
    const input = updateOrderSchema.parse({ ...body, id });

    const order = await orderService.update(id, tenantId, input, session.user.id);

    const response: ApiResponse<typeof order> = {
      success: true,
      data: order,
    };

    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission("order:write");
    const tenantId = await getCurrentTenantId();
    const { id } = await params;
    const { id: validId } = orderIdSchema.parse({ id });

    await orderService.softDelete(validId, tenantId, session.user.id);

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
