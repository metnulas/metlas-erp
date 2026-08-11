import DashboardLayout from "@/components/layout/DashboardLayout";
import { requirePermission } from "@/server/auth/authorization";
import { listRoles } from "@/features/roles/services/role.service";
import { prisma } from "@/lib/db/prisma";
import UserRoleEditor from "@/features/roles/components/UserRoleEditor";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function UsersPage() {
  const session = await requirePermission("users.view");
  const users = session.user.tenantId ? await prisma.user.findMany({ where: { tenantId: session.user.tenantId, deletedAt: null }, orderBy: { name: "asc" }, select: { id: true, name: true, email: true, phone: true, isActive: true, roleAssignments: { where: { tenantId: session.user.tenantId, deletedAt: null, role: { deletedAt: null } }, select: { role: { select: { id: true, key: true, name: true } } } } } }) : [];
  const roles = session.user.tenantId ? await listRoles(session.user.tenantId) : [];
  return <DashboardLayout><div className="space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="text-3xl font-bold tracking-tight">Kullanıcı Yönetimi</h1><p className="mt-2 text-sm text-muted-foreground">Kullanıcılara birden fazla rol atayın ve erişim kapsamını yönetin.</p></div><Button render={<Link href="/users/new" />}><Plus className="size-4" /> Yeni kullanıcı</Button></div><div className="space-y-3 rounded-2xl border border-border/70 bg-card p-5 shadow-sm">{users.map((user) => <UserRoleEditor key={user.id} user={user} roles={roles} />)}{users.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Bu tenant için kullanıcı bulunmuyor.</p>}</div></div></DashboardLayout>;
}
