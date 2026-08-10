import { NextRequest, NextResponse } from "next/server";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { createCustomerService } from "@/features/customers/services/customer.service";
import { customerIdSchema, updateCustomerSchema } from "@/features/customers/validators/customer.schema";
import type { ApiResponse } from "@/shared/types";
import { handleApiError } from "@/server/errors/handle-api-error";
import { requirePermission } from "@/server/auth/authorization";

const customerService = createCustomerService();


export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("customers.view");
    const tenantId = await getCurrentTenantId();
    const { id } = await params;
    const { id: validId } = customerIdSchema.parse({ id });

    const customer = await customerService.getById(validId, tenantId);

    const response: ApiResponse<typeof customer> = {
      success: true,
      data: customer,
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
    const session = await requirePermission("customers.edit");
    const tenantId = await getCurrentTenantId();
    const { id } = await params;
    const body = await request.json();
    const input = updateCustomerSchema.parse({ ...body, id });

    const customer = await customerService.update(id, tenantId, input, session.user.id);

    const response: ApiResponse<typeof customer> = {
      success: true,
      data: customer,
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
    const session = await requirePermission("customers.delete");
    const tenantId = await getCurrentTenantId();
    const { id } = await params;
    const { id: validId } = customerIdSchema.parse({ id });

    await customerService.softDelete(validId, tenantId, session.user.id);

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
