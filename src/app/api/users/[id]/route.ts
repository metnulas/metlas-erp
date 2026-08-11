import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/server/errors/handle-api-error";
import { requirePermission } from "@/server/auth/authorization";
import { updateUser, softDeleteUser } from "@/features/roles/services/role.service";
import { roleIdSchema, updateUserSchema } from "@/features/roles/validators/role.schema";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const session = await requirePermission("users.manage"); const { id } = roleIdSchema.parse(await params); return NextResponse.json({ success: true, data: await updateUser(id, session.user.tenantId, updateUserSchema.parse(await request.json()), session.user.id) }); }
  catch (error) { return handleApiError(error); }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const session = await requirePermission("users.manage"); const { id } = roleIdSchema.parse(await params); return NextResponse.json({ success: true, data: await softDeleteUser(id, session.user.tenantId, session.user.id) }); }
  catch (error) { return handleApiError(error); }
}
