import { NextRequest, NextResponse } from "next/server";
import { createCustomerService } from "@/features/customers/services/customer.service";
import { customerIdSchema } from "@/features/customers/validators/customer.schema";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { handleApiError } from "@/server/errors/handle-api-error";
import { requirePermission } from "@/server/auth/authorization";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission("customer:write");
    const { id } = customerIdSchema.parse(await params);
    return NextResponse.json({ success: true, data: await createCustomerService().geocode(id, await getCurrentTenantId(), session.user.id) });
  } catch (error) { return handleApiError(error); }
}
