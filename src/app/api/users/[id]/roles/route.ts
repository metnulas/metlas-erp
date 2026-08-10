import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/server/errors/handle-api-error";
import { requirePermission } from "@/server/auth/authorization";
import { assignUserRoles } from "@/features/roles/services/role.service";
import { assignUserRolesSchema, roleIdSchema } from "@/features/roles/validators/role.schema";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const session = await requirePermission("users.manage"); const { id } = roleIdSchema.parse(await params); const input = assignUserRolesSchema.parse(await request.json()); return NextResponse.json({ success: true, data: await assignUserRoles(id, session.user.tenantId, input.roleIds, session.user.id) }); }
  catch (error) { return handleApiError(error); }
}
