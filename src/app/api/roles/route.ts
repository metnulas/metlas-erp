import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/server/errors/handle-api-error";
import { requirePermission } from "@/server/auth/authorization";
import { createRole, listRoles } from "@/features/roles/services/role.service";
import { createRoleSchema } from "@/features/roles/validators/role.schema";

export async function GET() {
  try { const session = await requirePermission("roles.view"); return NextResponse.json({ success: true, data: await listRoles(session.user.tenantId) }); }
  catch (error) { return handleApiError(error); }
}

export async function POST(request: NextRequest) {
  try { const session = await requirePermission("roles.manage"); const role = await createRole(session.user.tenantId, createRoleSchema.parse(await request.json()), session.user.id); return NextResponse.json({ success: true, data: role }, { status: 201 }); }
  catch (error) { return handleApiError(error); }
}
