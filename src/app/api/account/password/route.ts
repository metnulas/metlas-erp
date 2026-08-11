import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword, hashPassword } from "@/lib/auth-password";
import { changePasswordSchema } from "@/features/auth/validators/password.schema";
import { handleApiError } from "@/server/errors/handle-api-error";
import { invalidatePermissionCache } from "@/server/auth/permission-resolver";
import { AppError } from "@/server/errors/app-error";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new AppError("Oturum açmanız gerekiyor", 401, "UNAUTHENTICATED");
    const input = changePasswordSchema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { passwordHash: true, tenantId: true } });
    if (!user || !(await verifyPassword(input.currentPassword, user.passwordHash))) throw new AppError("Mevcut şifre hatalı", 400, "PASSWORD_INVALID");
    await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash: await hashPassword(input.newPassword), mustChangePassword: false, permissionVersion: { increment: 1 } } });
    invalidatePermissionCache(session.user.id, user.tenantId);
    return NextResponse.json({ success: true, data: { updated: true } });
  } catch (error) { return handleApiError(error); }
}
