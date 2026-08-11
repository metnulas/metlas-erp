import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/server/errors/handle-api-error";
import { requirePermission } from "@/server/auth/authorization";
import { resetUserPassword } from "@/features/roles/services/role.service";
import { resetUserPasswordSchema, roleIdSchema } from "@/features/roles/validators/role.schema";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const session = await requirePermission("users.manage"); const { id } = roleIdSchema.parse(await params); const input = resetUserPasswordSchema.parse(await request.json()); return NextResponse.json({ success: true, data: await resetUserPassword(id, session.user.tenantId, input.password, session.user.id) }); }
  catch (error) { return handleApiError(error); }
}
