import { z } from "zod";

const key = z.string().trim().min(2).max(80).regex(/^[a-z0-9_.-]+$/, "Key yalnızca küçük harf, sayı, nokta, tire ve alt çizgi içerebilir");

export const createRoleSchema = z.object({
  key,
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional().nullable(),
  color: z.string().trim().max(32).optional().nullable(),
  icon: z.string().trim().max(64).optional().nullable(),
  permissionIds: z.array(z.string().cuid()).default([]),
});

export const updateRoleSchema = createRoleSchema.partial().extend({ permissionIds: z.array(z.string().cuid()).optional() });
export const roleIdSchema = z.object({ id: z.string().cuid() });
export const cloneRoleSchema = z.object({ key, name: z.string().trim().min(2).max(80) });
export const createPermissionGroupSchema = z.object({ key, name: z.string().trim().min(2).max(80), description: z.string().trim().max(500).optional().nullable() });
export const createPermissionSchema = z.object({ groupId: z.string().cuid(), key, name: z.string().trim().min(2).max(100), description: z.string().trim().max(500).optional().nullable() });
export const assignUserRolesSchema = z.object({ roleIds: z.array(z.string().cuid()) });
export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
  roleIds: z.array(z.string().cuid()).min(1, "En az bir rol seçmelisiniz"),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
