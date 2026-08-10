import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { AppError } from "@/server/errors/app-error";

export type Permission = "audit:read" | "customer:read" | "customer:write" | "order:read" | "order:write" | "product:read" | "product:write" | "stock:write" | "vehicle:read" | "vehicle:write" | "personnel:read" | "personnel:write" | "delivery:read" | "delivery:write";

const rolePermissions: Record<string, Permission[]> = {
  ADMIN: ["audit:read", "customer:read", "customer:write", "order:read", "order:write", "product:read", "product:write", "stock:write", "vehicle:read", "vehicle:write", "personnel:read", "personnel:write", "delivery:read", "delivery:write"],
  OPERATIONS: ["audit:read", "customer:read", "customer:write", "order:read", "order:write", "product:read", "product:write", "stock:write", "vehicle:read", "vehicle:write", "personnel:read", "personnel:write", "delivery:read", "delivery:write"],
  COURIER: ["customer:read", "order:read", "product:read", "vehicle:read", "personnel:read", "delivery:read", "delivery:write"],
  ACCOUNTING: ["customer:read", "order:read", "product:read"],
};

export function roleHasPermission(role: string, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export async function requirePermission(permission: Permission) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new AppError("Oturum açmanız gerekiyor", 401, "UNAUTHENTICATED");
  if (!roleHasPermission(session.user.role, permission)) throw new AppError("Bu işlem için yetkiniz yok", 403, "FORBIDDEN");
  return session;
}
