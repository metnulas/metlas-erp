import { NextRequest, NextResponse } from "next/server";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { createOrderService } from "@/features/orders/services/order.service";
import { orderQuerySchema, createOrderSchema } from "@/features/orders/validators/order.schema";
import type { ApiResponse } from "@/shared/types";
import { handleApiError } from "@/server/errors/handle-api-error";
import { requirePermission } from "@/server/auth/authorization";

const orderService = createOrderService();

export async function GET(request: NextRequest) {
  try {
    await requirePermission("order:read");
    const tenantId = await getCurrentTenantId();
    const { searchParams } = new URL(request.url);

    const query = orderQuerySchema.parse({
      page: searchParams.get("page") ?? 1,
      pageSize: searchParams.get("pageSize") ?? 20,
      search: searchParams.get("search") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      customerId: searchParams.get("customerId") ?? undefined,
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
      sort: searchParams.get("sort") ?? "createdAt",
      order: searchParams.get("order") ?? "desc",
    });

    const result = await orderService.list(tenantId, query);

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
    };

    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission("order:write");
    const tenantId = await getCurrentTenantId();
    const body = await request.json();
    const input = createOrderSchema.parse(body);

    const order = await orderService.create(tenantId, input);

    const response: ApiResponse<typeof order> = {
      success: true,
      data: order,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
