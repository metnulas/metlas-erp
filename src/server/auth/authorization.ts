import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { AppError } from "@/server/errors/app-error";

export type Permission = "customer:read" | "customer:write" | "order:read" | "order:write" | "product:read" | "product:write" | "stock:write" | "vehicle:read" | "vehicle:write" | "personnel:read" | "personnel:write" | "delivery:read" | "delivery:write";

const rolePermissions: Record<string, Permission[]> = {
  ADMIN: ["customer:read", "customer:write", "order:read", "order:write", "product:read", "product:write", "stock:write", "vehicle:read", "vehicle:write", "personnel:read", "personnel:write", "delivery:read", "delivery:write"],
  OPERATIONS: ["customer:read", "customer:write", "order:read", "order:write", "product:read", "product:write", "stock:write", "vehicle:read", "vehicle:write", "personnel:read", "personnel:write", "delivery:read", "delivery:write"],
  COURIER: ["customer:read", "order:read", "product:read", "vehicle:read", "personnel:read", "delivery:read", "delivery:write"],
  ACCOUNTING: ["customer:read", "order:read", "product:read"],
};

export async function requirePermission(permission: Permission) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new AppError("Oturum açmanız gerekiyor", 401, "UNAUTHENTICATED");
  if (!rolePermissions[session.user.role]?.includes(permission)) throw new AppError("Bu işlem için yetkiniz yok", 403, "FORBIDDEN");
  return session;
}
