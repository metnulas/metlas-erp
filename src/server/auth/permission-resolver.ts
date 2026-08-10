import { prisma } from "@/lib/db/prisma";

export type PermissionSnapshot = {
  permissions: string[];
  version: number;
  expiresAt: number;
};

type CacheEntry = PermissionSnapshot;

const CACHE_TTL_MS = 60_000;
const permissionCache = new Map<string, CacheEntry>();

function cacheKey(userId: string, tenantId: string | null) {
  return `${tenantId ?? "platform"}:${userId}`;
}

export function invalidatePermissionCache(userId?: string, tenantId?: string | null) {
  if (!userId) {
    permissionCache.clear();
    return;
  }
  permissionCache.delete(cacheKey(userId, tenantId ?? null));
}

export async function getPermissionSnapshot(userId: string, tenantId: string | null): Promise<PermissionSnapshot> {
  const key = cacheKey(userId, tenantId);
  const cached = permissionCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tenantId: true, permissionVersion: true },
  });
  if (!user || user.tenantId !== tenantId) return { permissions: [], version: user?.permissionVersion ?? 0, expiresAt: Date.now() + CACHE_TTL_MS };

  const assignments = await prisma.userRole.findMany({
    where: { userId, tenantId, deletedAt: null, role: { isActive: true, deletedAt: null } },
    select: {
      role: {
        select: {
          isSuperAdmin: true,
          permissions: {
            where: { deletedAt: null, permission: { isActive: true, deletedAt: null } },
            select: { permission: { select: { key: true } } },
          },
        },
      },
    },
  });

  const permissions = assignments.flatMap((assignment) => assignment.role.isSuperAdmin
    ? []
    : assignment.role.permissions.map(({ permission }) => permission.key));

  if (assignments.some((assignment) => assignment.role.isSuperAdmin)) {
    const allPermissions = await prisma.permission.findMany({ where: { isActive: true, deletedAt: null }, select: { key: true } });
    permissions.push(...allPermissions.map((permission) => permission.key));
  }

  const snapshot = { permissions: [...new Set(permissions)], version: user.permissionVersion, expiresAt: Date.now() + CACHE_TTL_MS };
  permissionCache.set(key, snapshot);
  return snapshot;
}

export async function userHasPermission(userId: string, tenantId: string | null, permission: string) {
  const snapshot = await getPermissionSnapshot(userId, tenantId);
  return snapshot.permissions.includes(permission);
}
