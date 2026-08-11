import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/server/errors/handle-api-error";
import { requirePermission } from "@/server/auth/authorization";
import { setUserActive } from "@/features/roles/services/role.service";
import { roleIdSchema } from "@/features/roles/validators/role.schema";
import { z } from "zod";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const session = await requirePermission("users.manage"); const { id } = roleIdSchema.parse(await params); const input = z.object({ active: z.boolean() }).parse(await request.json()); return NextResponse.json({ success: true, data: await setUserActive(id, session.user.tenantId, input.active, session.user.id) }); }
  catch (error) { return handleApiError(error); }
}
