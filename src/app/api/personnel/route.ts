import { NextRequest, NextResponse } from "next/server";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { handleApiError } from "@/server/errors/handle-api-error";
import { createPersonnelService } from "@/features/personnel/services/personnel.service";
import { createPersonnelSchema, personnelQuerySchema } from "@/features/personnel/validators/personnel.schema";
import { requirePermission } from "@/server/auth/authorization";

const personnelService = createPersonnelService();

export async function GET(request: NextRequest) {
  try { await requirePermission("personnel.view"); const { searchParams } = new URL(request.url); const query = personnelQuerySchema.parse({ page: searchParams.get("page") ?? 1, pageSize: searchParams.get("pageSize") ?? 20, search: searchParams.get("search") ?? undefined, position: searchParams.get("position") ?? undefined, status: searchParams.get("status") ?? undefined, sort: searchParams.get("sort") ?? "createdAt", order: searchParams.get("order") ?? "desc" }); return NextResponse.json({ success: true, data: await personnelService.list(await getCurrentTenantId(), query) }); } catch (error) { return handleApiError(error); }
}
export async function POST(request: NextRequest) { try { const session = await requirePermission("personnel.manage"); return NextResponse.json({ success: true, data: await personnelService.create(await getCurrentTenantId(), createPersonnelSchema.parse(await request.json()), session.user.id) }, { status: 201 }); } catch (error) { return handleApiError(error); } }
