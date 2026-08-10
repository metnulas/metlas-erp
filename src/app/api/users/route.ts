import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/server/auth/authorization";
import { handleApiError } from "@/server/errors/handle-api-error";
import { createUser } from "@/features/roles/services/role.service";
import { createUserSchema } from "@/features/roles/validators/role.schema";

export async function GET() {
  try {
    const session = await requirePermission("users.view");
    if (!session.user.tenantId) return NextResponse.json({ success: true, data: [] });
    const users = await prisma.user.findMany({ where: { tenantId: session.user.tenantId }, orderBy: { name: "asc" }, select: { id: true, name: true, email: true, isActive: true, roleAssignments: { where: { tenantId: session.user.tenantId, deletedAt: null, role: { deletedAt: null } }, select: { role: { select: { id: true, key: true, name: true } } } } } });
    return NextResponse.json({ success: true, data: users });
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: Request) {
  try {
    const session = await requirePermission("users.manage");
    const input = createUserSchema.parse(await request.json());
    const user = await createUser(session.user.tenantId, input, session.user.id);
    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) { return handleApiError(error); }
}
