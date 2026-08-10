import { NextRequest, NextResponse } from "next/server";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { requirePermission } from "@/server/auth/authorization";
import { handleApiError } from "@/server/errors/handle-api-error";
import { routeHistoryInputSchema } from "@/features/routes/validators/route-history.schema";
import { listRouteHistories, saveRouteHistory } from "@/features/routes/services/route-history.service";

export async function GET() {
  try {
    await requirePermission("delivery:read");
    return NextResponse.json({ success: true, data: await listRouteHistories(await getCurrentTenantId()) });
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission("delivery:write");
    const input = routeHistoryInputSchema.parse(await request.json());
    return NextResponse.json({ success: true, data: await saveRouteHistory(await getCurrentTenantId(), input) });
  } catch (error) { return handleApiError(error); }
}
