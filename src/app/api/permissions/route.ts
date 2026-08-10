import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { handleApiError } from "@/server/errors/handle-api-error";
import { requirePermission } from "@/server/auth/authorization";
import { listPermissions } from "@/features/roles/services/role.service";
import { createPermissionSchema, createPermissionGroupSchema } from "@/features/roles/validators/role.schema";

export async function GET() {
  try { const session = await requirePermission("roles.view"); return NextResponse.json({ success: true, data: await listPermissions(session.user.tenantId) }); }
  catch (error) { return handleApiError(error); }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission("roles.manage");
    const body = await request.json();
    const permission = createPermissionSchema.parse(body);
    const group = await prisma.permissionGroup.findFirst({ where: { id: permission.groupId, deletedAt: null, OR: [{ tenantId: null }, ...(session.user.tenantId ? [{ tenantId: session.user.tenantId }] : [])] } });
    if (!group) return NextResponse.json({ success: false, error: { code: "GROUP_NOT_FOUND", message: "Permission grubu bulunamadı" } }, { status: 404 });
    const created = await prisma.permission.create({ data: { ...permission, tenantId: session.user.tenantId } });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) { return handleApiError(error); }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requirePermission("roles.manage");
    const input = createPermissionGroupSchema.parse(await request.json());
    const group = await prisma.permissionGroup.create({ data: { ...input, tenantId: session.user.tenantId } });
    return NextResponse.json({ success: true, data: group }, { status: 201 });
  } catch (error) { return handleApiError(error); }
}
