import { NextRequest, NextResponse } from "next/server";
import { createAuditService } from "@/features/audit/services/audit.service";
import { auditQuerySchema } from "@/features/audit/validators/audit.schema";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { handleApiError } from "@/server/errors/handle-api-error";
import { requirePermission } from "@/server/auth/authorization";

const auditService = createAuditService();

export async function GET(request: NextRequest) {
  try {
    await requirePermission("audit:read");
    const searchParams = new URL(request.url).searchParams;
    const query = auditQuerySchema.parse({ page: searchParams.get("page") ?? 1, pageSize: searchParams.get("pageSize") ?? 25, action: searchParams.get("action") ?? undefined, entityType: searchParams.get("entityType") ?? undefined });
    return NextResponse.json({ success: true, data: await auditService.list(await getCurrentTenantId(), query) });
  } catch (error) { return handleApiError(error); }
}
