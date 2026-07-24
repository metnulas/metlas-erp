import { NextRequest, NextResponse } from "next/server";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { createCustomerService } from "@/features/customers/services/customer.service";
import { customerQuerySchema, createCustomerSchema } from "@/features/customers/validators/customer.schema";
import type { ApiResponse } from "@/shared/types";
import { handleApiError } from "@/server/errors/handle-api-error";
import { requirePermission } from "@/server/auth/authorization";

const customerService = createCustomerService();

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getCurrentTenantId();
    const { searchParams } = new URL(request.url);

    const query = customerQuerySchema.parse({
      page: searchParams.get("page") ?? 1,
      pageSize: searchParams.get("pageSize") ?? 20,
      search: searchParams.get("search") ?? undefined,
      isActive: searchParams.get("isActive") ?? undefined,
      city: searchParams.get("city") ?? undefined,
      sort: searchParams.get("sort") ?? "createdAt",
      order: searchParams.get("order") ?? "desc",
    });

    const result = await customerService.list(tenantId, query);

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
    await requirePermission("customer:write");
    const tenantId = await getCurrentTenantId();
    const body = await request.json();
    const input = createCustomerSchema.parse(body);

    const customer = await customerService.create(tenantId, input);

    const response: ApiResponse<typeof customer> = {
      success: true,
      data: customer,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
