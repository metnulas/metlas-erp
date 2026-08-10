import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { AppError } from "@/server/errors/app-error";
import { getPermissionSnapshot } from "@/server/auth/permission-resolver";

export type Permission = string;

export function hasPermission(permissions: string[], permission: Permission) {
  return permissions.includes(permission);
}

export async function requirePermission(permission: Permission) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new AppError("Oturum açmanız gerekiyor", 401, "UNAUTHENTICATED");
  const snapshot = await getPermissionSnapshot(session.user.id, session.user.tenantId ?? null);
  if (!hasPermission(snapshot.permissions, permission)) throw new AppError("Bu işlem için yetkiniz yok", 403, "FORBIDDEN");
  return session;
}
