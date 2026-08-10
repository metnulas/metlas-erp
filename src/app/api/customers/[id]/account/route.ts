import { NextRequest, NextResponse } from "next/server";
import { createAccountEntryService } from "@/features/customers/services/account-entry.service";
import { accountEntryQuerySchema, createAccountEntrySchema } from "@/features/customers/validators/account-entry.schema";
import { customerIdSchema } from "@/features/customers/validators/customer.schema";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { handleApiError } from "@/server/errors/handle-api-error";
import { requirePermission } from "@/server/auth/authorization";

const accountEntryService = createAccountEntryService();

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("customer:read");
    const { id } = customerIdSchema.parse(await params);
    const searchParams = new URL(request.url).searchParams;
    const query = accountEntryQuerySchema.parse({ page: searchParams.get("page") ?? 1, pageSize: searchParams.get("pageSize") ?? 20 });
    return NextResponse.json({ success: true, data: await accountEntryService.list(id, await getCurrentTenantId(), query) });
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission("customer:write");
    const { id } = customerIdSchema.parse(await params);
    const input = createAccountEntrySchema.parse(await request.json());
    return NextResponse.json({ success: true, data: await accountEntryService.create(id, await getCurrentTenantId(), input, session.user.id) }, { status: 201 });
  } catch (error) { return handleApiError(error); }
}
