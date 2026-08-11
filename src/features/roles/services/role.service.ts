import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/server/errors/app-error";
import { recordAudit } from "@/server/audit/audit-log";
import { invalidatePermissionCache } from "@/server/auth/permission-resolver";
import { hashPassword } from "@/lib/auth-password";
import type { CreateRoleInput, UpdateRoleInput } from "../validators/role.schema";

function tenantScope(tenantId: string | null): Prisma.RoleWhereInput {
  return tenantId ? { tenantId } : { tenantId: null, isSuperAdmin: true };
}

export async function getRole(id: string, tenantId: string | null) {
  const role = await prisma.role.findFirst({ where: { id, ...tenantScope(tenantId), deletedAt: null }, include: { permissions: { where: { deletedAt: null }, include: { permission: { include: { group: true } } } } } });
  if (!role) throw new AppError("Rol bulunamadı", 404, "ROLE_NOT_FOUND");
  return role;
}

async function validatePermissionIds(permissionIds: string[], tenantId: string | null) {
  const permissions = await prisma.permission.findMany({ where: { id: { in: permissionIds }, deletedAt: null, isActive: true, OR: [{ tenantId: null }, ...(tenantId ? [{ tenantId }] : [])] }, select: { id: true, key: true } });
  if (tenantId && permissions.some((permission) => permission.key.startsWith("platform."))) throw new AppError("Platform permissionları yalnızca global Super Admin içindir", 403, "PLATFORM_PERMISSION_FORBIDDEN");
  if (permissions.length !== new Set(permissionIds).size) throw new AppError("Geçersiz veya erişilemeyen permission bulundu", 400, "PERMISSION_NOT_AVAILABLE");
}

export async function listRoles(tenantId: string | null) {
  return prisma.role.findMany({ where: { ...tenantScope(tenantId), deletedAt: null }, orderBy: [{ isSuperAdmin: "desc" }, { name: "asc" }], include: { permissions: { where: { deletedAt: null }, select: { permission: { select: { id: true, key: true, name: true, group: { select: { key: true, name: true } } } } } }, _count: { select: { userRoles: { where: { deletedAt: null } } } } } });
}

export async function listPermissions(tenantId: string | null) {
  return prisma.permission.findMany({ where: { deletedAt: null, isActive: true, OR: [{ tenantId: null }, ...(tenantId ? [{ tenantId }] : [])] }, orderBy: [{ group: { sortOrder: "asc" } }, { name: "asc" }], include: { group: true } });
}

export async function createRole(tenantId: string | null, input: CreateRoleInput, actorId: string) {
  await validatePermissionIds(input.permissionIds, tenantId);
  const role = await prisma.$transaction(async (tx) => {
    const created = await tx.role.create({ data: { tenantId, key: input.key, name: input.name, description: input.description, color: input.color, icon: input.icon, createdBy: actorId, updatedBy: actorId } });
    if (input.permissionIds.length) await tx.rolePermission.createMany({ data: input.permissionIds.map((permissionId) => ({ tenantId, roleId: created.id, permissionId })) });
    return created;
  });
  await recordAudit({ tenantId, actorId, action: "ROLE_CREATE", entityType: "Role", entityId: role.id, metadata: { key: role.key, permissionCount: input.permissionIds.length } });
  return getRole(role.id, tenantId);
}

export async function updateRole(id: string, tenantId: string | null, input: UpdateRoleInput, actorId: string) {
  const current = await getRole(id, tenantId);
  if (current.isSuperAdmin && (input.key || input.name || input.permissionIds)) throw new AppError("Super Admin rolü değiştirilemez", 400, "SUPER_ADMIN_LOCKED");
  if (input.permissionIds) await validatePermissionIds(input.permissionIds, tenantId);
  await prisma.$transaction(async (tx) => {
    await tx.role.update({ where: { id }, data: { ...(input.key !== undefined && { key: input.key }), ...(input.name !== undefined && { name: input.name }), ...(input.description !== undefined && { description: input.description }), ...(input.color !== undefined && { color: input.color }), ...(input.icon !== undefined && { icon: input.icon }), updatedBy: actorId } });
    if (input.permissionIds) {
      await tx.rolePermission.updateMany({ where: { roleId: id, tenantId, deletedAt: null }, data: { deletedAt: new Date() } });
      for (const permissionId of input.permissionIds) {
        const existing = await tx.rolePermission.findFirst({ where: { tenantId, roleId: id, permissionId } });
        if (existing) await tx.rolePermission.update({ where: { id: existing.id }, data: { deletedAt: null } });
        else await tx.rolePermission.create({ data: { tenantId, roleId: id, permissionId } });
      }
    }
  });
  invalidatePermissionCache();
  await recordAudit({ tenantId, actorId, action: input.permissionIds ? "ROLE_PERMISSION_ADD" : "ROLE_UPDATE", entityType: "Role", entityId: id, metadata: { permissionIds: input.permissionIds ?? null } });
  return getRole(id, tenantId);
}

export async function cloneRole(id: string, tenantId: string | null, key: string, name: string, actorId: string) {
  const source = await getRole(id, tenantId);
  const permissionIds = source.permissions.map(({ permission }) => permission.id);
  return createRole(tenantId, { key, name, description: source.description, color: source.color, icon: source.icon, permissionIds }, actorId);
}

export async function setRoleActive(id: string, tenantId: string | null, active: boolean, actorId: string) {
  const role = await getRole(id, tenantId);
  if (role.isSuperAdmin) throw new AppError("Super Admin rolü pasifleştirilemez", 400, "SUPER_ADMIN_LOCKED");
  await prisma.role.update({ where: { id }, data: { isActive: active, updatedBy: actorId } });
  invalidatePermissionCache();
  await recordAudit({ tenantId, actorId, action: active ? "ROLE_ACTIVATE" : "ROLE_DEACTIVATE", entityType: "Role", entityId: id });
  return { id, isActive: active };
}

export async function softDeleteRole(id: string, tenantId: string | null, actorId: string) {
  const role = await getRole(id, tenantId);
  if (role.isSuperAdmin) throw new AppError("Super Admin rolü silinemez", 400, "SUPER_ADMIN_LOCKED");
  await prisma.role.update({ where: { id }, data: { deletedAt: new Date(), isActive: false, updatedBy: actorId } });
  invalidatePermissionCache();
  await recordAudit({ tenantId, actorId, action: "ROLE_DELETE", entityType: "Role", entityId: id });
  return { deleted: true };
}

export async function assignUserRoles(userId: string, tenantId: string | null, roleIds: string[], actorId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { tenantId: true } });
  if (!user || user.tenantId !== tenantId) throw new AppError("Kullanıcı bulunamadı", 404, "USER_NOT_FOUND");
  const roles = await prisma.role.findMany({ where: { id: { in: roleIds }, ...tenantScope(tenantId), isActive: true, deletedAt: null }, select: { id: true } });
  if (roles.length !== new Set(roleIds).size) throw new AppError("Geçersiz rol bulundu", 400, "ROLE_NOT_AVAILABLE");
  await prisma.$transaction(async (tx) => {
    await tx.userRole.updateMany({ where: { userId, tenantId, deletedAt: null }, data: { deletedAt: new Date() } });
    for (const roleId of roleIds) {
      const existing = await tx.userRole.findFirst({ where: { tenantId, userId, roleId } });
      if (existing) await tx.userRole.update({ where: { id: existing.id }, data: { deletedAt: null, assignedBy: actorId } });
      else await tx.userRole.create({ data: { tenantId, userId, roleId, assignedBy: actorId } });
    }
    await tx.user.update({ where: { id: userId }, data: { permissionVersion: { increment: 1 } } });
  });
  invalidatePermissionCache(userId, tenantId);
  await recordAudit({ tenantId, actorId, action: "USER_ROLE_ASSIGN", entityType: "User", entityId: userId, metadata: { roleIds } });
  return prisma.userRole.findMany({ where: { userId, tenantId, deletedAt: null }, include: { role: true } });
}

export async function createUser(tenantId: string | null, input: { name: string; email: string; phone: string; password: string; roleIds: string[] }, actorId: string) {
  if (!tenantId) throw new AppError("Global kullanıcı tenant seçimi gerektirir", 400, "TENANT_REQUIRED");
  const roles = await prisma.role.findMany({ where: { id: { in: input.roleIds }, tenantId, isActive: true, deletedAt: null }, select: { id: true } });
  if (roles.length !== new Set(input.roleIds).size) throw new AppError("Geçersiz veya pasif rol bulundu", 400, "ROLE_NOT_AVAILABLE");
  const existing = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
  if (existing) throw new AppError("Bu e-posta adresi zaten kullanılıyor", 409, "USER_EMAIL_EXISTS");
  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({ data: { tenantId, email: input.email, phone: input.phone, name: input.name, passwordHash: await hashPassword(input.password), role: "OPERATIONS" } });
    await tx.userRole.createMany({ data: input.roleIds.map((roleId) => ({ tenantId, userId: created.id, roleId, assignedBy: actorId })) });
    return created;
  });
  await recordAudit({ tenantId, actorId, action: "USER_CREATE", entityType: "User", entityId: user.id, metadata: { email: user.email, roleIds: input.roleIds } });
  return { id: user.id, name: user.name, email: user.email, phone: user.phone, roleIds: input.roleIds };
}

async function getTenantUser(userId: string, tenantId: string) {
  const user = await prisma.user.findFirst({ where: { id: userId, tenantId, deletedAt: null } });
  if (!user) throw new AppError("Kullanıcı bulunamadı", 404, "USER_NOT_FOUND");
  return user;
}

export async function updateUser(userId: string, tenantId: string | null, input: { name: string; phone: string }, actorId: string) {
  if (!tenantId) throw new AppError("Tenant bulunamadı", 400, "TENANT_REQUIRED");
  await getTenantUser(userId, tenantId);
  const user = await prisma.user.update({ where: { id: userId }, data: { name: input.name, phone: input.phone } });
  await recordAudit({ tenantId, actorId, action: "USER_UPDATE", entityType: "User", entityId: userId, metadata: { name: input.name, phone: input.phone } });
  return { id: user.id, name: user.name, phone: user.phone };
}

export async function setUserActive(userId: string, tenantId: string | null, active: boolean, actorId: string) {
  if (!tenantId) throw new AppError("Tenant bulunamadı", 400, "TENANT_REQUIRED");
  if (userId === actorId && !active) throw new AppError("Kendi hesabınızı pasifleştiremezsiniz", 400, "SELF_DEACTIVATE_FORBIDDEN");
  await getTenantUser(userId, tenantId);
  const user = await prisma.user.update({ where: { id: userId }, data: { isActive: active, permissionVersion: { increment: 1 } } });
  invalidatePermissionCache(userId, tenantId);
  await recordAudit({ tenantId, actorId, action: active ? "USER_ACTIVATE" : "USER_DEACTIVATE", entityType: "User", entityId: userId });
  return { id: user.id, isActive: user.isActive };
}

export async function softDeleteUser(userId: string, tenantId: string | null, actorId: string) {
  if (!tenantId) throw new AppError("Tenant bulunamadı", 400, "TENANT_REQUIRED");
  if (userId === actorId) throw new AppError("Kendi hesabınızı silemezsiniz", 400, "SELF_DELETE_FORBIDDEN");
  await getTenantUser(userId, tenantId);
  await prisma.user.update({ where: { id: userId }, data: { deletedAt: new Date(), isActive: false, permissionVersion: { increment: 1 } } });
  invalidatePermissionCache(userId, tenantId);
  await recordAudit({ tenantId, actorId, action: "USER_DELETE", entityType: "User", entityId: userId });
  return { deleted: true };
}

export async function resetUserPassword(userId: string, tenantId: string | null, password: string, actorId: string) {
  if (!tenantId) throw new AppError("Tenant bulunamadı", 400, "TENANT_REQUIRED");
  await getTenantUser(userId, tenantId);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(password) } });
  await recordAudit({ tenantId, actorId, action: "USER_PASSWORD_RESET", entityType: "User", entityId: userId });
  return { updated: true };
}
