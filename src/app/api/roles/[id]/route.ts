import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/server/errors/handle-api-error";
import { requirePermission } from "@/server/auth/authorization";
import { getRole, updateRole, softDeleteRole } from "@/features/roles/services/role.service";
import { roleIdSchema, updateRoleSchema } from "@/features/roles/validators/role.schema";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const session = await requirePermission("roles.view"); const { id } = roleIdSchema.parse(await params); return NextResponse.json({ success: true, data: await getRole(id, session.user.tenantId) }); }
  catch (error) { return handleApiError(error); }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const session = await requirePermission("roles.manage"); const { id } = roleIdSchema.parse(await params); return NextResponse.json({ success: true, data: await updateRole(id, session.user.tenantId, updateRoleSchema.parse(await request.json()), session.user.id) }); }
  catch (error) { return handleApiError(error); }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const session = await requirePermission("roles.manage"); const { id } = roleIdSchema.parse(await params); return NextResponse.json({ success: true, data: await softDeleteRole(id, session.user.tenantId, session.user.id) }); }
  catch (error) { return handleApiError(error); }
}
