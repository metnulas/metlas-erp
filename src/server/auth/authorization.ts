import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { AppError } from "@/server/errors/app-error";

export type Permission = "customer:write" | "order:write" | "product:write" | "stock:write" | "vehicle:write" | "personnel:write" | "delivery:write";

const rolePermissions: Record<string, Permission[]> = {
  ADMIN: ["customer:write", "order:write", "product:write", "stock:write", "vehicle:write", "personnel:write", "delivery:write"],
  OPERATIONS: ["customer:write", "order:write", "product:write", "stock:write", "vehicle:write", "personnel:write", "delivery:write"],
  COURIER: ["delivery:write"],
  ACCOUNTING: [],
};

export async function requirePermission(permission: Permission) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new AppError("Oturum açmanız gerekiyor", 401, "UNAUTHENTICATED");
  if (!rolePermissions[session.user.role]?.includes(permission)) throw new AppError("Bu işlem için yetkiniz yok", 403, "FORBIDDEN");
  return session;
}
