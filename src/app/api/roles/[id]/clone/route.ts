import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/server/errors/handle-api-error";
import { requirePermission } from "@/server/auth/authorization";
import { cloneRole } from "@/features/roles/services/role.service";
import { cloneRoleSchema, roleIdSchema } from "@/features/roles/validators/role.schema";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const session = await requirePermission("roles.manage"); const { id } = roleIdSchema.parse(await params); const input = cloneRoleSchema.parse(await request.json()); return NextResponse.json({ success: true, data: await cloneRole(id, session.user.tenantId, input.key, input.name, session.user.id) }, { status: 201 }); }
  catch (error) { return handleApiError(error); }
}
